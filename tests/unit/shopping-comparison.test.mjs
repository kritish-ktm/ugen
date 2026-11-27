import assert from 'node:assert/strict'
import test from 'node:test'
import { offerSearchUrl, parsePublicOffers, publicOfferRows, activeOffer, comparablePrice, sortByComparison, productMatchKey } from '../../lib/shopping-comparison.ts'
import { supermarkets } from '../../lib/supermarkets.ts'

const now = new Date('2026-11-27T12:00:00Z')
const row = {
  publicId:'test-offer', publicationPublicId:'leaflet', name:'Fjord pilsner', description:'33 cl. dåse',
  business:{ name:'Netto', slugs:['Netto'], countryCode:'DK' }, currencyCode:'DKK', price:5, unitPrice:15.15, baseUnit:'liter',
  validFrom:'2026-11-26T23:00:00+0000', validUntil:'2026-11-27T22:59:59+0000',
}
const html = (rows) => '<app-data data-status="success">'+JSON.stringify({data:rows,metadata:{pagination:{limit:30,offset:0}}}).replaceAll('&','&amp;').replaceAll('"','&quot;')+'</app-data>'
const parse = (rows, store='Netto', query='øl') => parsePublicOffers(html(rows),store,query,now)
const offer = parse([row])[0]

test('source searches use canonical lowercase URLs to avoid rejected publisher redirects', () => {
  assert.equal(offerSearchUrl('Netto','ØL'),'https://etilbudsavis.dk/soeg/netto%20%C3%B8l')
  assert.equal(decodeURIComponent(new URL(offerSearchUrl('REMA 1000','MÆLK')).pathname),'/soeg/rema 1000 mælk')
})

test('public listing adapter accepts all eight Danish chains and ignores foreign or wrong-store prices', () => {
  for (const store of supermarkets) {
    const name = store.id==='365'?'Coop 365discount':store.name
    const offers = parse([{...row,business:{...row.business,name}}],store.name)
    assert.equal(offers.length,1,store.name)
    assert.equal(offers[0].store,store.name)
    assert.equal(offers[0].start,'2026-11-27')
    assert.equal(offers[0].end,'2026-11-27')
    assert.match(offers[0].url,/^https:\/\/etilbudsavis.dk\//)
    assert.equal(new URL(offers[0].url).searchParams.get('offer'),'test-offer')
  }
  assert.equal(parse([{...row,business:{...row.business,countryCode:'DE'}}]).length,0)
  assert.equal(parse([{...row,currencyCode:'EUR'}]).length,0)
  assert.equal(parse([{...row,business:{...row.business,name:'Border shop'}}]).length,0)
  assert.equal(parse([row],'Lidl').length,0)
})

test('only explicitly active dated prices survive parsing and cached expiry checks', () => {
  assert.equal(parse([
    row,
    {...row,publicId:'expired',validUntil:'2026-11-27T11:59:59Z'},
    {...row,publicId:'future',validFrom:'2026-11-27T12:00:01Z'},
    {...row,publicId:'catalogue',validFrom:null,validUntil:null},
    {...row,publicId:'bad',price:-1},
  ]).length,1)
  assert.equal(activeOffer(offer,now),true)
  assert.equal(activeOffer(offer,new Date('2026-11-27T23:00:00Z')),false)
  assert.equal(activeOffer({...offer,validFrom:'invalid'},now),false)
  assert.equal(activeOffer({...offer,validUntil:'invalid'},now),false)
})

test('members-only base prices and app discounts remain explicitly restricted', () => {
  const offers = parse([{...row,membershipPrice:4}])
  assert.equal(offers.length,2)
  assert.equal(offers[0].membership,false)
  assert.equal(offers[1].membership,true)
  assert.equal(offers[1].price,4)
  assert.equal(comparablePrice(offers[1],'litre'),12.12)
  assert.equal(parse([{...row,description:'Kun med Netto+ app'}])[0].membership,true)
  assert.equal(parse([{...row,description:'Netto+ pris'}])[0].membership,true)
  assert.equal(parse([{...row,description:'Lidl Plus-tilbud'}])[0].membership,true)
  assert.equal(parse([{...row,membershipRequired:true}])[0].membership,true)
  assert.equal(parse([{...row,appPrice:3}])[1].membership,true)
})

test('unit ranking excludes uncertain promotions and incompatible quantities while package sorting stays separate', () => {
  const maximum = parse([{...row,description:'Literpris max. 15,15'}])[0]
  const range = parse([{...row,pieceCountFrom:6,pieceCountTo:24}])[0]
  const conditional = parse([{...row,pieceCountGet:6,pieceCountGetFor:5}])[0]
  const kilo = parse([{...row,baseUnit:'kg',unitPrice:8}], 'Netto','kaffe')[0]
  for (const uncertain of [maximum,range,conditional]) assert.equal(comparablePrice(uncertain,'litre'),undefined)
  assert.equal(comparablePrice(kilo,'litre'),undefined)
  assert.equal(comparablePrice(kilo,'kg'),8)
  assert.equal(comparablePrice(maximum,'price'),5)
  assert.equal(comparablePrice(conditional,'price'),undefined)
  assert.equal(sortByComparison([range,kilo,offer],'litre')[0],offer)
  assert.equal(comparablePrice({...offer,unitPrice:15.154,perLitre:15.154},'litre'),15.15)
  assert.equal(comparablePrice({...offer,unitPrice:NaN,perLitre:NaN},'litre'),undefined)
})

test('same-product grouping preserves descriptions, alcohol content, packaging and variant restrictions', () => {
  assert.equal(productMatchKey(offer),productMatchKey({...offer,store:'Lidl',price:4}))
  for (const different of [
    {...offer,name:'Fjord pilsner alkoholfri'},
    {...offer,detail:'50 cl. dåse'},
    {...offer,detail:'33 cl. flaske'},
    {...offer,detail:'33 cl. dåse 6% vol.'},
  ]) assert.notEqual(productMatchKey(offer),productMatchKey(different))
  assert.equal(productMatchKey({...offer,mixed:true}),null)
  assert.equal(productMatchKey({...offer,priceIsFrom:true}),null)
  assert.equal(productMatchKey({...offer,unitPriceIsMax:true}),null)
  assert.equal(productMatchKey({...offer,gtin:'1234567890123'}),'gtin:1234567890123')
  assert.notEqual(parse([{...row,name:'Alkoholfri øl 0,0%'}])[0].kind,'beer')
})

test('empty listings are distinct from broken sources and unrelated advertising data', () => {
  assert.deepEqual(parse([]),[])
  assert.throws(()=>publicOfferRows('<html>source changed</html>'))
  assert.throws(()=>publicOfferRows('<app-data>{bad json}</app-data>'))
  const ad='<app-data>'+JSON.stringify({data:[{ad:'not an offer',price:1}]})+'</app-data>'
  assert.equal(parsePublicOffers(ad+html([row,row]),'Netto','øl',now).length,1)
})
