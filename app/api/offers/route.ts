import { type AlcoholOffer, type OffersData, type StoreCoverage } from '../../../lib/alcohol-offers'
import { offerSearchUrl, parsePublicOffers } from '../../../lib/shopping-comparison'
import { supermarkets } from '../../../lib/supermarkets'
import { publicPage } from '../../../lib/public-page'

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get('q') ?? 'øl').trim().replace(/\s+/g,' ')
  if (!query || query.length > 80 || [...query].some(char=>char.charCodeAt(0)<32)) return Response.json({error:'Invalid product search'}, {status:400})
  const offers: AlcoholOffer[] = [], coverage: StoreCoverage[] = []
  const now = new Date()
  // Fixed public-source hosts, bounded requests and cached pages; no ad scripts.
  for (let offset=0; offset<supermarkets.length; offset+=3) {
    await Promise.all(supermarkets.slice(offset,offset+3).map(async store=>{
      const sourceUrl=offerSearchUrl(store.name,query)
      try {
        const rows=parsePublicOffers(await publicPage(sourceUrl,1800),store.name,query,now)
        offers.push(...rows)
        coverage.push({id:store.id,store:store.name,status:rows.length?'ok':'empty',count:rows.length,sourceUrl})
      } catch { coverage.push({id:store.id,store:store.name,status:'unavailable',count:0,sourceUrl}) }
    }))
  }
  const unavailable=coverage.filter(row=>row.status==='unavailable').map(row=>row.store)
  const data: OffersData={offers,coverage,query,checked:now.toISOString(),unavailable,sources:['eTilbudsavis public offer listings']}
  // Keep coverage visible even when every source is unavailable.
  return Response.json(data,{headers:{'Cache-Control':'public, max-age=120'}})
}
