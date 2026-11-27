import assert from 'node:assert/strict'
import test from 'node:test'
import { parseRemaOffers, parseNettoOffers, searchOffers, drinkKind } from '../../lib/alcohol-offers.ts'
import { sundayMarkets } from '../../lib/markets.ts'
import { denmarkEvents, eventsBetween, mergeEvents } from '../../lib/denmark-events.ts'
import { discoverVega, validEventDate } from '../../lib/event-discovery.ts'

function remaPage(products) {
  const flat = []
  const add = value => {
    const index = flat.length
    flat.push(null)
    flat[index] = Array.isArray(value) ? value.map(add) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key,item]) => [key,add(item)])) : value
    return index
  }
  add(products)
  return '<script type="application/json" id="__NUXT_DATA__">' + JSON.stringify(flat) + '</script>'
}
const price = { price: 12, is_campaign: true, is_advertised: true, starting_at: '2026-11-22T00:00:00Z', ending_at: '2026-11-28T00:00:00Z', deposit: 1, compare_unit: 'ltr', compare_unit_price: 24, max_quantity: 6 }
const beer = { id: 42, name: 'PILSNER', underline: '50 CL.', category: { slug: 'ol' }, prices: [price], is_available_in_all_stores: false }

test('retailer adapter includes active alcohol campaigns and rejects regular, expired, future and non-alcohol products', () => {
  const html = remaPage([beer,
    { ...beer, id: 43, prices: [{ ...price, is_campaign: false }] },
    { ...beer, id: 44, prices: [{ ...price, ending_at: '2026-11-26T00:00:00Z' }] },
    { ...beer, id: 45, prices: [{ ...price, starting_at: '2026-11-28T00:00:00Z' }] },
    { ...beer, id: 46, category: { slug: 'alkoholfri-olvin' } },
    { ...beer, id: 47, name: 'PØLSEBRØD', category: { slug: 'brod' } },
    { ...beer, id: 48, prices: [{ ...price, price: -1 }] },
  ]) + '<a href="/varer/drikkevarer/ol/42-pilsner">Pilsner</a>'
  const offers = parseRemaOffers(html, '2026-11-27')
  assert.equal(offers.length, 1)
  assert.equal(offers[0].perLitre, 24)
  assert.equal(offers[0].deposit, 1)
  assert.equal(offers[0].maxQuantity, 6)
  assert.equal(offers[0].localOnly, true)
  assert.equal(offers[0].url, 'https://shop.rema1000.dk/varer/drikkevarer/ol/42-pilsner')
  assert.throws(() => parseRemaOffers('<html>changed</html>', '2026-11-27'))
  assert.equal(drinkKind('alkoholfri-olvin'), null)
})

test('search deduplicates, matches all query words and sorts package price separately from litre price', () => {
  const a = parseRemaOffers(remaPage([beer]), '2026-11-27')[0]
  const b = { ...a, id: 'b', name: 'PILSNER STOR', price: 20, perLitre: 10 }
  assert.deepEqual(searchOffers([a,a,b], 'pilsner', 'beer').map(x=>x.id), ['b', a.id])
  assert.equal(searchOffers([a,b], 'rema stor', 'all', 'price').length, 1)
  assert.equal(searchOffers([a,b], '', 'beer', 'price')[0].id, a.id)
  assert.equal(searchOffers([a,b], '', 'wine').length, 0)
  assert.equal(searchOffers([a,b], '', 'all', 'price', '2026-11-29').length, 0)
})

test('Netto adapter reads public JSON data and distinguishes membership, non-alcohol and non-active offers', () => {
  const offer = { id:'a', title:'Dansk øl', description:'50 cl. + pant', price: 5, offerState:'active', startTime:'2026-11-21T01:00:00', endTime:'2026-11-28T00:59:59', unitPriceText:'Pr. liter 10,00' }
  const data = { offers:[offer, {...offer,id:'b',title:'Alkoholfri øl'}, {...offer,id:'c',offerState:'expired'}, {...offer,id:'d',title:'Pølsebrød'}, {...offer,id:'e',personalizedOffer:true}] }
  const packet = JSON.stringify([1, '1:' + JSON.stringify(data) + '\n'])
  const found = parseNettoOffers('<script>self.__next_f.push(' + packet + ')</script>', '2026-11-27')
  assert.equal(found.length,1)
  assert.equal(found[0].membership,true)
  assert.equal(found[0].perLitre,10)
  assert.throws(()=>parseNettoOffers('<script>alert(1)</script>','2026-11-27'))
})

test('Sunday market schedules respect researched seasons, summer closures and year limits', () => {
  const markets = sundayMarkets(2026)
  assert.ok(eventsBetween(markets,'2026-11-29').some(e=>e.da.includes('under Buen')))
  assert.equal(eventsBetween(markets,'2026-12-06').length,0)
  assert.ok(!eventsBetween(markets,'2026-07-12').some(e=>e.da.includes('under Buen')))
  assert.ok(eventsBetween(markets,'2026-10-04').some(e=>e.city==='Gentofte'))
  assert.ok(!eventsBetween(markets,'2026-10-11').some(e=>e.city==='Gentofte'))
  assert.deepEqual(sundayMarkets(2027),[])
  const december = denmarkEvents(2026)
  assert.ok(eventsBetween(december,'2026-12-06').some(e=>e.da.includes('Bella') && e.time==='10:00–16:00'))
  assert.ok(eventsBetween(december,'2026-12-13').some(e=>e.da==='Lucia i Kajak' && e.time==='17:00–19:00'))
  assert.ok(!eventsBetween(december,'2026-01-13').some(e=>e.da==='Lucia i Kajak'))
})

test('concert discovery validates dates, deduplicates links and keeps curated details', () => {
  const html = '<a href="/event/test-band-2026-12-05">More</a><a href="/event/test-band-2026-12-05">Again</a><a href="/beyond/event/social-night-2026-12-06">More</a><a href="/event/bad-2026-02-30">Bad</a>'
  const found = discoverVega(html)
  assert.equal(found.length,2)
  assert.equal(found[1].kind,'social')
  assert.equal(validEventDate('2026-02-30'),false)
  assert.equal(validEventDate('2026-12-13'),true)
  assert.equal(mergeEvents([found[0],{...found[0],time:'20:00'}])[0].time,'20:00')
})
