'use client'
import { useState } from 'react'
import { type AlcoholOffer, type OffersData } from '../../lib/alcohol-offers'
import { activeOffer, comparablePrice, normalizeStore, productMatchKey, sortByComparison } from '../../lib/shopping-comparison'
import { supermarkets } from '../../lib/supermarkets'
import { useFeed } from '../../hooks/useFeed'
import { usePreferences } from '../ui/Shell'
import { ProductSearch } from './ProductSearch'

export function AlcoholOffers() {
  const { t, language, online } = usePreferences()
  const [draft,setDraft]=useState('øl'), [query,setQuery]=useState('øl'), [refine,setRefine]=useState('')
  const [kind,setKind]=useState('all'), [sort,setSort]=useState('litre'), [store,setStore]=useState('all')
  const [members,setMembers]=useState(false), [match,setMatch]=useState('all'), [visible,setVisible]=useState(8)
  const {data,loading,error,cached,retry}=useFeed<OffersData>('/api/offers?q='+encodeURIComponent(query),online,1800000)
  const money=(value:number)=>new Intl.NumberFormat(language==='da'?'da-DK':'en-DK',{style:'currency',currency:'DKK'}).format(value)
  const unitLabel=sort==='litre'?'/l':sort==='kg'?'/kg':sort==='item'?t('/stk.','/item'):''
  const unitText=(offer:AlcoholOffer)=>{
    const price=offer.unitPrice??offer.perLitre
    const unit=offer.unit??(offer.perLitre?'l':undefined)
    return price&&unit ? (offer.unitPriceIsMax?t('Op til ','Up to '):'')+money(price)+'/'+(unit==='item'?t('stk.','item'):unit) : t('Enhedspris ikke oplyst','Unit price unavailable')
  }
  const words=refine.toLocaleLowerCase('da').trim().split(/\s+/).filter(Boolean)
  const available=(data?.offers??[]).filter(offer=>activeOffer(offer)&&(!offer.membership||members)&&(kind==='all'||offer.kind===kind)&&words.every(word=>(offer.name+' '+offer.detail+' '+offer.store).toLocaleLowerCase('da').includes(word)))
  const groups=new Map<string,{name:string;stores:Set<string>}>()
  for(const offer of available){const key=productMatchKey(offer);if(key){const group=groups.get(key)??{name:offer.name,stores:new Set<string>()};group.stores.add(normalizeStore(offer.store));groups.set(key,group)}}
  const matches=[...groups].filter(([,group])=>group.stores.size>1)
  const compared=available.filter(offer=>match==='all'||productMatchKey(offer)===match)
  const offers=sortByComparison(compared.filter(offer=>store==='all'||normalizeStore(offer.store)===normalizeStore(store)),sort)
  const ranked=offers.filter(offer=>comparablePrice(offer,sort)!==undefined)
  const cheapest=ranked[0]
  const bestPrice=cheapest?comparablePrice(cheapest,sort):undefined
  const coverage=data?.coverage??[]
  const checkedStores=coverage.filter(row=>row.status!=='unavailable').length
  function searchProduct(value:string) {
    if(!online||!value.trim()) return
    setQuery(value.trim());setRefine('');setMatch('all');setStore('all');setKind('all');setVisible(8)
    if(value.trim()===query) retry()
  }
  return <section className="card stack alcohol-search" aria-labelledby="alcohol-title">
    <h2 id="alcohol-title">{t('Sammenlign tilbud fra 8 supermarkeder','Compare offers from 8 supermarkets')}</h2>
    <p className="muted">{t('Søg efter en vare eller et mærke. Vi søger hos Netto, REMA 1000, Lidl, 365discount, føtex, Bilka, SuperBrugsen og MENY via offentlige eTilbudsavis-opslag.','Search for a product or brand across Netto, REMA 1000, Lidl, 365discount, føtex, Bilka, SuperBrugsen, and MENY through public eTilbudsavis listings.')}</p>
    <form className="inline offer-search-form" onSubmit={event=>{event.preventDefault();searchProduct(draft)}}>
      <ProductSearch value={draft} onChange={setDraft} onSelect={searchProduct} productNames={(data?.offers??[]).filter(offer=>activeOffer(offer)).map(offer=>offer.name)}/>
      <button className="primary" type="submit" disabled={!online||!draft.trim()}>{t('Sammenlign priser','Compare prices')}</button>
    </form>
    <div className="form-grid">
      <label>{t('Filtrér resultater','Filter results')}<input type="search" value={refine} onChange={event=>{setRefine(event.target.value);setVisible(8);setMatch('all')}} placeholder={t('Mærke, variant eller butik…','Brand, variant, or store…')}/></label>
      <label>{t('Varetype','Product type')}<select aria-label={t('Varetype','Product type')} value={kind} onChange={event=>{setKind(event.target.value);setVisible(8);setMatch('all')}}>{[['all',t('Alle varer','All products')],['grocery',t('Andre dagligvarer','Other groceries')],['beer',t('Øl','Beer')],['wine',t('Vin','Wine')],['cider',t('Cider & færdigblandede','Cider & premixed')],['spirits',t('Spiritus','Spirits')]].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
      <label>{t('Sortér tilbud','Sort offers')}<select aria-label={t('Sortér tilbud','Sort offers')} value={sort} onChange={event=>setSort(event.target.value)}><option value="litre">{t('Laveste literpris','Lowest price per litre')}</option><option value="kg">{t('Laveste kilopris','Lowest price per kg')}</option><option value="item">{t('Laveste stykpris','Lowest price per item')}</option><option value="price">{t('Laveste pakkepris','Lowest package price')}</option><option value="ending">{t('Udløber først','Ending soonest')}</option></select></label>
      <label>{t('Butik','Store')}<select aria-label={t('Butik','Store')} value={store} onChange={event=>setStore(event.target.value)}><option value="all">{t('Alle 8 butikker','All 8 stores')}</option>{supermarkets.map(item=><option value={item.name} key={item.id}>{item.name}</option>)}</select></label>
    </div>
    <label className="inline sunday-filter"><input type="checkbox" checked={members} onChange={event=>{setMembers(event.target.checked);setMatch('all')}}/>{t('Medtag medlems- og apppriser','Include member and app prices')}</label>
    {matches.length>0&&<label>{t('Sammenlign samme angivne vare','Compare the same stated product')}<select aria-label={t('Sammenlign samme angivne vare','Compare the same stated product')} value={match} onChange={event=>setMatch(event.target.value)}><option value="all">{t('Alle matchende varer – varianter kan være forskellige','All matching products – variants may differ')}</option>{matches.map(([key,group])=><option key={key} value={key}>{group.name} · {group.stores.size} {t('butikker','stores')}</option>)}</select></label>}
    <div className="between"><p className="muted small" role="status">{loading?t('Henter tilbud fra butikkerne…','Checking supermarket offers…'):offers.length+' '+t('aktive tilbud fundet for','active offers found for')+' “'+query+'”'}</p><button className="secondary" type="button" onClick={retry} disabled={!online||loading}>{t('Opdatér tilbud','Refresh offers')}</button></div>
    {(cached||error)&&<p className="notice">{cached?t('Viser gemte resultater. Kontrollér pris og lager hos kilden.','Showing saved results. Check price and stock with the source.'):t('Tilbud kan ikke hentes lige nu. Butikkernes egne tilbudsaviser findes nedenfor.','Offers are unavailable right now. Retailer leaflets are linked below.')}</p>}
    {coverage.length>0&&<p className={checkedStores<8?'notice':'muted small'}>{checkedStores}/8 {t('butikskilder svarede. Se dækning for hver butik nedenfor.','store sources responded. See coverage for each store below.')}{checkedStores<8?' '+t('Sammenligningen er ufuldstændig, fordi nogle kilder ikke kunne hentes.','The comparison is incomplete because some sources could not be retrieved.'):''}</p>}
    {cheapest&&bestPrice!==undefined&&<div className="cheapest-offer" role="region" aria-label={t('Billigste sammenlignelige fund','Cheapest comparable result')}><span className="card-label">{t('LAVESTE PRIS BLANDT DE VISTE FUND','LOWEST PRICE AMONG SHOWN RESULTS')}</span><h3>{cheapest.store} · {cheapest.name}</h3><strong>{money(bestPrice)}{unitLabel}</strong><p className="small">{match==='all'?t('Matcher din søgning; mærker og varianter kan være forskellige.','Matches your search; brands and variants may differ.'):t('Matcher samme angivne varenavn og pakningstype. Kontrollér varianten hos butikken.','Matches the same stated product name and packaging type. Verify the variant with the retailer.')}{sort==='price'?' '+t('Pakkepriser sammenligner ikke mængder.','Package prices do not compare quantities.'):''}</p></div>}
    {!loading&&!cheapest&&offers.length>0&&sort!=='ending'&&<p className="notice">{t('Ingen entydige priser for den valgte enhed. Tilbud med prisintervaller kan ses nedenfor, men får ikke et billigst-mærke.','No unambiguous prices for the selected unit. Ranged offers appear below but do not receive a cheapest label.')}</p>}
    <div className="store-comparison-scroll" role="region" aria-label={t('Prissammenligning pr. butik','Price comparison by store')} tabIndex={0}><table className="store-comparison"><caption>{sort==='ending'?t('Butiksdækning og tilbud der udløber først','Store coverage and offers ending soonest'):t('Butiksdækning og laveste sammenlignelige pris pr. butik','Store coverage and lowest comparable price per store')}</caption><thead><tr><th scope="col">{t('Butik','Store')}</th><th scope="col">{t('Fund / status','Results / status')}</th><th scope="col">{sort==='ending'?t('Udløber først','Ending soonest'):t('Laveste fund','Lowest result')}</th></tr></thead><tbody>{supermarkets.map(item=>{
      const rows=sortByComparison(compared.filter(offer=>normalizeStore(offer.store)===normalizeStore(item.name)),sort)
      const best=sort==='ending'?rows[0]:rows.find(offer=>comparablePrice(offer,sort)!==undefined)
      const value=best?comparablePrice(best,sort):undefined
      const state=coverage.find(row=>row.id===item.id)
      const sourceUrl=state?.sourceUrl??item.offers
      return <tr key={item.id}><th scope="row"><a className="text-link" href={sourceUrl} target="_blank" rel="noopener noreferrer">{item.name}</a></th><td>{rows.length?rows.length+' '+t('matchende tilbud','matching offers'):state?.status==='unavailable'?t('Kilden utilgængelig','Source unavailable'):state?t('Ingen aktive match fundet','No active matches found'):t('Ikke kontrolleret','Not checked')}{state?.status==='unavailable'&&rows.length>0&&<span className="event-place">{t('Gemte resultater','Saved results')}</span>}</td><td>{best&&sort==='ending'?<><strong>{best.end}</strong><span className="event-place">{best.name}</span></>:best&&value!==undefined?<><strong>{money(value)}{unitLabel}</strong><span className="event-place">{best.name}{best.membership?' · '+t('medlemspris','member price'):''}</span></>:rows.length?t('Ingen entydig pris for valgte enhed','No unambiguous price for selected unit'):'—'}</td></tr>
    })}</tbody></table></div>
    <ul className="offer-results">{offers.slice(0,visible).map(offer=><li key={offer.id} className="offer-result">
      <div className="stack"><span className="source-label">{offer.store}{bestPrice!==undefined&&comparablePrice(offer,sort)===bestPrice?' · '+t('laveste viste pris','lowest shown price'):''}</span><h3>{offer.name}</h3><p className="muted small">{offer.detail}</p><p className="small">{t('Gælder','Valid')} {offer.start} – {offer.end}</p>{offer.membership&&<p className="small">{t('Kræver medlemskab eller app','Requires membership or an app')}</p>}{offer.mixed&&<p className="muted small">{t('Flere varianter eller pakningsstørrelser – tjek indholdet','Multiple variants or pack sizes – check contents')}</p>}{offer.priceIsFrom&&<p className="small">{t('Se prisvilkår hos kilden','Check pricing conditions at source')}</p>}{offer.localOnly&&<p className="muted small">{t('Findes ikke i alle butikker','Not available in all stores')}</p>}{offer.maxQuantity&&<p className="small">{t('Maks.','Max.')} {offer.maxQuantity} {t('til tilbudspris','at offer price')}</p>}</div>
      <div className="stack offer-price"><strong>{money(offer.price)}</strong><span className="muted small">{unitText(offer)}</span><span className="muted small">{offer.deposit?'+ '+money(offer.deposit)+' '+t('pant','deposit'):t('Pant og øvrige vilkår: se kilden','Deposit and other conditions: check source')}</span><a className="secondary fit" href={offer.url} target="_blank" rel="noopener noreferrer">{t('Se tilbud og kilde','View offer and source')}</a>{offer.source&&<span className="muted small">{t('Kilde','Source')}: {offer.source}</span>}</div>
    </li>)}</ul>
    {offers.length>visible&&<button className="secondary fit" type="button" onClick={()=>setVisible(visible+8)}>{t('Vis flere tilbud','Show more offers')} ({offers.length-visible})</button>}
    {!loading&&!offers.length&&!error&&<p className="muted">{t('Ingen aktive tilbud matcher. Prøv en ny søgning, fjern filtre eller medtag medlemspriser.','No active offers match. Try a new search, remove filters, or include member prices.')}</p>}
    <p className="muted small">{t('Sammenligningen omfatter et udvalg af offentligt viste tilbud fra de 8 kæder, ikke hele sortimentet eller alle danske supermarkeder. Tomme eller utilgængelige kilder betyder ikke, at butikken er dyrere. Maksimumpriser, prisintervaller og ukendte enhedspriser udelades fra sammenligning pr. enhed. Kildesider opdateres normalt hver 30. minut.','Comparison covers a selection of public offers from these 8 chains, not their entire stock or every Danish supermarket. Empty or unavailable sources do not mean a store is more expensive. Maximum prices, price ranges, and unknown unit prices are excluded from unit-price comparison. Source pages normally refresh every 30 minutes.')}{data&&<> {t('Hentet','Retrieved')}: {new Date(data.checked).toLocaleString(language==='da'?'da-DK':'en-DK',{timeZone:'Europe/Copenhagen'})}.</>}</p>
  </section>
}
