import { danishToday } from './iso-week.ts'
import { supermarkets } from './supermarkets.ts'
import type { AlcoholOffer, DrinkKind } from './alcohol-offers.ts'

export const normalizeStore = (name: string) => name.toLocaleLowerCase('da').normalize('NFD').replace(/\p{Diacritic}/gu,'').replaceAll('ø','o').replace(/[^a-z0-9]/g,'').replace(/^coop(?=365)/,'')
export const retailerFor = (name: string) => supermarkets.find(store => normalizeStore(store.name) === normalizeStore(name))
export const offerSearchUrl = (store: string, query: string) => 'https://etilbudsavis.dk/soeg/'+encodeURIComponent((store+' '+query).toLocaleLowerCase('da'))
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : {}
const string = (value: unknown) => typeof value === 'string' ? value : ''
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined
function htmlText(value: string) {
  return value.replaceAll('&quot;','"').replace(/&#39;|&apos;/g,"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&')
}

export function publicOfferRows(html: string) {
  let recognized = false
  const rows: Record<string,unknown>[] = []
  for (const match of html.matchAll(/<app-data\b[^>]*>([\s\S]*?)<\/app-data>/g)) {
    try {
      const packet = object(JSON.parse(htmlText(match[1])))
      if (Array.isArray(packet.data)) {
        const candidates = packet.data.map(object).filter(item => 'business' in item && 'price' in item)
        if (candidates.length || 'pagination' in object(packet.metadata)) recognized = true
        rows.push(...candidates)
      }
    } catch { /* Skip unrelated or malformed hydration records. */ }
  }
  if (!recognized) throw new Error('Offer source format unavailable')
  return rows
}

function kindOf(name: string, query: string): DrinkKind {
  const text = (name + ' ' + query).toLocaleLowerCase('da')
  if (/alkoholfri|alkoholfrit|0[,.]0\s*%/.test(text)) return 'grocery'
  if (/cider|hard seltzer/.test(text)) return 'cider'
  if (/\b(?:gin|vodka|whisky|whiskey|rom|rum|akvavit|snaps|cognac|tequila|spiritus)\b/.test(text)) return 'spirits'
  if (/(?:^|[^\p{L}])(?:øl|specialøl|pilsner|lager|ipa|ale)(?:$|[^\p{L}])/u.test(text)) return 'beer'
  if (/(?:^|[^\p{L}])(?:rødvin|hvidvin|rosé|portvin|prosecco|champagne|vin)(?:$|[^\p{L}])/u.test(text)) return 'wine'
  return 'grocery'
}

export function parsePublicOffers(html: string, expectedStore: string, query: string, now = new Date()): AlcoholOffer[] {
  const offers: AlcoholOffer[] = []
  for (const row of publicOfferRows(html)) {
    const business = object(row.business), retailer = retailerFor(string(business.name))
    if (!retailer || normalizeStore(retailer.name) !== normalizeStore(expectedStore) || business.countryCode !== 'DK' || row.currencyCode !== 'DKK') continue
    const name = string(row.name), detail = string(row.description), id = string(row.publicId)
    const from = string(row.validFrom), until = string(row.validUntil)
    if (!name || !/^[\w-]+$/.test(id) || !Number.isFinite(Date.parse(from)) || !Number.isFinite(Date.parse(until)) || Date.parse(from) > +now || Date.parse(until) < +now) continue
    const basePrice = number(row.price), memberPrice = number(row.membershipPrice) ?? number(row.appPrice)
    if (!basePrice && !memberPrice) continue
    const baseUnit = string(row.baseUnit).toLowerCase()
    const unit: AlcoholOffer['unit'] = ['liter','litre','l'].includes(baseUnit) ? 'l' : ['kg','kilogram'].includes(baseUnit) ? 'kg' : ['stk','piece','pieces','each'].includes(baseUnit) ? 'item' : undefined
    const range = number(row.pieceCountFrom) !== number(row.pieceCountTo) || number(row.unitSizeFrom) !== number(row.unitSizeTo)
    const unitPriceIsMax = range || /(?:max\.?|maks\.?)\s*[\d\n]|(?:liter|kg)\s+(?:max|maks)/i.test(detail)
    const mixed = range || /eller|flere varianter|frit valg|\bel\./i.test(name + ' ' + detail)
    const slug = Array.isArray(business.slugs) ? business.slugs.find(value => typeof value === 'string' && /^[\p{L}\p{N}_-]+$/u.test(value)) as string | undefined : undefined
    const url = new URL('https://etilbudsavis.dk/' + encodeURIComponent(slug ?? retailer.name))
    if (/^[\w-]+$/.test(string(row.publicationPublicId))) url.searchParams.set('publication', string(row.publicationPublicId))
    url.searchParams.set('offer', id)
    const restricted = /medlemspris|medlemstilbud|netto\s*\+|lidl\s+plus|føtex\s+plus|bilka\s+plus|coop\s+(?:app|medlem)|kun (?:for )?medlemmer|kun med [^.!\n]{0,35}(?:app|plus|\+)|kræver [^.!\n]{0,20}medlem/i.test(name+' '+detail) || row.membershipRequired===true
    const common = { name, detail, store:retailer.name, kind:kindOf(name,query), start:danishToday(new Date(from)), end:danishToday(new Date(until)), validFrom:from, validUntil:until,
      url:url.href, localOnly:false, unit, unitPriceIsMax, mixed, source:'eTilbudsavis', priceIsFrom:Boolean(number(row.fromPrice)||number(row.pieceCountGet)||number(row.pieceCountGetFor)), gtin:/^\d{8,14}$/.test(string(row.gtin)) ? string(row.gtin) : undefined }
    if (basePrice) {
      const unitPrice = number(row.unitPrice)
      offers.push({ ...common,id:retailer.id+'-'+id,price:basePrice,membership:restricted,unitPrice,perLitre:unit==='l'?unitPrice:undefined })
    }
    if (memberPrice && (!basePrice || memberPrice < basePrice)) {
      const unitPrice = basePrice && number(row.unitPrice) ? Number(row.unitPrice) * memberPrice / basePrice : undefined
      offers.push({ ...common,id:retailer.id+'-'+id+'-member',price:memberPrice,membership:true,unitPrice,perLitre:unit==='l'?unitPrice:undefined })
    }
  }
  return [...new Map(offers.map(offer=>[offer.id,offer])).values()]
}

export function activeOffer(offer: AlcoholOffer, now = new Date()) {
  const today = danishToday(now)
  return offer.start <= today && offer.end >= today && (!offer.validFrom || Date.parse(offer.validFrom) <= +now) && (!offer.validUntil || Date.parse(offer.validUntil) >= +now)
}
export function comparablePrice(offer: AlcoholOffer, basis: string): number | undefined {
  const rounded = (value: number | undefined) => value && Number.isFinite(value) && value > 0 ? Math.round(value*100)/100 || undefined : undefined
  if (offer.priceIsFrom) return undefined
  if (basis === 'price') return rounded(offer.price)
  if (offer.unitPriceIsMax) return undefined
  const unit = basis === 'litre' ? 'l' : basis === 'kg' ? 'kg' : basis === 'item' ? 'item' : null
  if (unit === 'l' && offer.perLitre && (!offer.unit || offer.unit === 'l')) return rounded(offer.perLitre)
  return unit && offer.unit === unit ? rounded(offer.unitPrice) : undefined
}
export function sortByComparison(offers: AlcoholOffer[], basis: string) {
  return [...offers].sort((a,b)=>(basis==='ending' ? a.end.localeCompare(b.end) : (comparablePrice(a,basis) ?? Infinity)-(comparablePrice(b,basis) ?? Infinity)) || a.name.localeCompare(b.name,'da'))
}
// Conservative text matches; mixed-variant promotions are never treated as the same product.
export function productMatchKey(offer: AlcoholOffer) {
  if (offer.mixed || offer.priceIsFrom || offer.unitPriceIsMax) return null
  if (offer.gtin) return 'gtin:'+offer.gtin
  const name = offer.name.toLocaleLowerCase('da').replace(/(\d),(\d)/g,'$1.$2').replace(/[^\p{L}\p{N}.%]+/gu,' ').trim().split(/\s+/).sort().join(' ')
  const pack = /\bds(?:\.|\b)|dåse/i.test(offer.detail) ? 'can' : /\bfl(?:\.|\b)|flaske/i.test(offer.detail) ? 'bottle' : 'unspecified'
  const detail = offer.detail.toLocaleLowerCase('da').replace(/(\d),(\d)/g,'$1.$2').replace(/\s+/g,' ').trim()
  return name ? name+'|'+detail+'|'+(offer.unit ?? (offer.perLitre?'l':''))+'|'+pack : null
}
