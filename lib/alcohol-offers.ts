export type DrinkKind = 'beer' | 'wine' | 'spirits' | 'cider' | 'grocery'
export type AlcoholOffer = {
  id: string; name: string; detail: string; store: string; kind: DrinkKind
  price: number; perLitre?: number; deposit?: number; maxQuantity?: number
  start: string; end: string; url: string; localOnly: boolean
  membership?: boolean
  unit?: 'l' | 'kg' | 'item'
  unitPrice?: number
  unitPriceIsMax?: boolean
  priceIsFrom?: boolean
  mixed?: boolean
  validFrom?: string
  validUntil?: string
  source?: string
  gtin?: string
}

export function parseNettoOffers(html: string, today: string): AlcoholOffer[] {
  const found: AlcoholOffer[] = []
  let recognized = false
  function visit(value: unknown, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 25) return
    const item = record(value)
    if ('offerState' in item && 'startTime' in item) {
      recognized = true
      const name = text(item.title), detail = text(item.description), lower = name.toLocaleLowerCase('da')
      const kind: DrinkKind | null = /alkoholfri|alkoholfrit|0[,.]0\s*%/.test(lower + ' ' + detail) ? null
        : /\b(?:gin|vodka|whisky|whiskey|rom|rum|akvavit|snaps|cognac|tequila)\b/.test(lower) ? 'spirits'
        : /cider|hard seltzer/.test(lower) ? 'cider'
        : /(?:^|[^\p{L}])(?:øl|specialøl|pilsner|lager|ipa|ale)(?:$|[^\p{L}])/u.test(lower) ? 'beer'
        : /(?:^|[^\p{L}])(?:rødvin|hvidvin|rosé|portvin|prosecco|champagne|vin)(?:$|[^\p{L}])/u.test(lower) ? 'wine' : null
      const start = text(item.startTime).slice(0,10), end = text(item.endTime).slice(0,10)
      if (!kind || !/\d\s*(?:cl|ml|l|liter)\b/i.test(detail) || item.offerState !== 'active' || item.personalizedOffer === true || item.hidePrice === true || item.packageDealId || item.priceText || !positive(item.price) || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > today || end < today) return
      // For cutoff times on today's date, require the cutoff still to be in the future in Copenhagen.
      const cutoff = text(item.endTime)
      if (end === today && cutoff.length >= 19 && new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Copenhagen', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23' }).format(new Date()).replace(' ', 'T') > cutoff.slice(0,19)) return
      const unitText = text(item.unitPriceText)
      const perLitre = !/max|maks/i.test(unitText) ? unitText.match(/(?:liter|litre)\s+([\d]+[,.]?\d*)/i)?.[1] : undefined
      found.push({ id: 'netto-' + text(item.id), name, detail, store: 'Netto+', kind, price: Number(item.price),
        perLitre: perLitre ? Number(perLitre.replace(',','.')) : undefined, start, end, url: 'https://netto.dk/netto-plus/', localOnly: false, membership: true })
      return
    }
    for (const child of Object.values(value)) visit(child, depth + 1)
  }
  // Decode public Next.js payloads as JSON data; never evaluate publisher scripts.
  for (const match of html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)) {
    try {
      const packet = JSON.parse(match[1])
      if (typeof packet[1] !== 'string') continue
      for (const line of packet[1].split('\n')) {
        try { visit(JSON.parse(line.slice(line.indexOf(':') + 1))) } catch { /* Non-JSON Flight records. */ }
      }
    } catch { /* Other page scripts are irrelevant. */ }
  }
  if (!recognized) throw new Error('Retailer format changed')
  return found
}
export type StoreCoverage = { id: string; store: string; status: 'ok' | 'empty' | 'unavailable'; count: number; sourceUrl: string }
export type OffersData = { offers: AlcoholOffer[]; checked: string; unavailable: string[]; sources: string[]; coverage?: StoreCoverage[]; query?: string }
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const text = (value: unknown) => typeof value === 'string' ? value : ''
const positive = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined

export function drinkKind(category: string): DrinkKind | null {
  const value = category.toLocaleLowerCase('da')
  if (/alkoholfri|alcohol.free/.test(value)) return null
  if (['ol', 'special-ol'].includes(value) || /^(øl|specialøl)$/.test(value)) return 'beer'
  if (/^(rodvin|hvidvin|rosevin|mousserende-vin|hedvinaperitif)$/.test(value)) return 'wine'
  if (/cider|ready-to-drink/.test(value)) return 'cider'
  if (/spiritus|whisky|vodka|gin-rom/.test(value)) return 'spirits'
  return null
}

export function parseRemaOffers(html: string, today: string): AlcoholOffer[] {
  const payload = html.match(/<script\b[^>]*\bid="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!payload) throw new Error('Retailer format changed')
  const parsed: unknown = JSON.parse(payload)
  if (!Array.isArray(parsed) || parsed.length > 100000) throw new Error('Invalid retailer data')
  const flat: unknown[] = parsed
  function resolve(ref: unknown, depth = 0): unknown {
    if (typeof ref !== 'number' || ref < 0 || !Number.isInteger(ref) || depth > 12) return null
    const value: unknown = flat[ref]
    if (Array.isArray(value)) return value.map(item => resolve(item, depth + 1))
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item, depth + 1)]))
    return value
  }
  return flat.flatMap((item, index) => {
    const entry = record(item)
    if (!('prices' in entry) || !('name' in entry)) return []
    const product = record(resolve(index)), category = record(product.category)
    const kind = drinkKind(text(category.slug))
    if (!kind || typeof product.id !== 'number' || !text(product.name)) return []
    const prices = Array.isArray(product.prices) ? product.prices.map(record) : []
    const active = prices.filter(price => price.is_campaign === true &&
      /^\d{4}-\d{2}-\d{2}T/.test(text(price.starting_at)) && /^\d{4}-\d{2}-\d{2}T/.test(text(price.ending_at)) &&
      text(price.starting_at).slice(0, 10) <= today && text(price.ending_at).slice(0, 10) >= today && positive(price.price))
      .sort((a, b) => Number(a.price) - Number(b.price))[0]
    if (!active) return []
    const slug = text(category.slug)
    if (!/^[a-z0-9-]+$/.test(slug)) return []
    const sourceLink = [...html.matchAll(/href="(\/varer\/drikkevarer\/[a-z0-9-]+\/(\d+)-[^"<>]+)"/g)].find(match => match[2] === String(product.id))?.[1]
    return [{ id: 'rema-' + product.id, name: text(product.name), detail: text(product.underline), store: 'REMA 1000', kind,
      price: Number(active.price), perLitre: ['ltr', 'l', 'liter'].includes(text(active.compare_unit)) ? positive(active.compare_unit_price) : undefined,
      deposit: positive(active.deposit), maxQuantity: positive(active.max_quantity), start: text(active.starting_at).slice(0, 10), end: text(active.ending_at).slice(0, 10),
      url: 'https://shop.rema1000.dk' + (sourceLink ?? '/varer/drikkevarer/' + slug + '?filters=avisvare'),
      localOnly: product.is_available_in_all_stores === false,
    }]
  })
}

export function searchOffers(offers: AlcoholOffer[], query: string, kind = 'all', sort = 'litre', today?: string) {
  const words = query.toLocaleLowerCase('da').trim().split(/\s+/).filter(Boolean)
  return [...new Map(offers.map(offer => [offer.id, offer])).values()]
    .filter(offer => (!today || offer.start <= today && offer.end >= today) && (kind === 'all' || offer.kind === kind) &&
      words.every(word => (offer.name + ' ' + offer.detail + ' ' + offer.store).toLocaleLowerCase('da').includes(word)))
    .sort((a, b) => (sort === 'price' ? a.price - b.price : sort === 'ending' ? a.end.localeCompare(b.end) : (a.perLitre ?? Infinity) - (b.perLitre ?? Infinity)) || a.name.localeCompare(b.name, 'da'))
}
