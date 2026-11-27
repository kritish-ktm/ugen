'use client'
import { useState } from 'react'
import { BriefcaseBusiness, Heart, House } from 'lucide-react'
import { directoryEntries } from '../../lib/directories'
import { useLocal } from '../../hooks/useLocal'
import { PageTitle } from '../ui/PageTitle'
import { UgenLink, usePreferences } from '../ui/Shell'

export function DirectoryTeaser() {
  const {t}=usePreferences()
  return <section className="card stack"><h2>{t('Næste skridt i Danmark', 'Your next step in Denmark')}</h2><p className="muted">{t('Find rekrutteringsbureauer og steder at søge bolig. Samlet uden annoncer i Ugen.', 'Find recruitment agencies and places to search for a home. Collected without ads in Ugen.')}</p><div className="chip-row"><UgenLink className="secondary" href="/job"><BriefcaseBusiness size={17}/>{t('Find job', 'Find work')}</UgenLink><UgenLink className="secondary" href="/bolig"><House size={17}/>{t('Find bolig', 'Find a home')}</UgenLink></div></section>
}

export function CompanyDirectory({ housing = false }: { housing?: boolean }) {
  const {t,language,online}=usePreferences()
  const [query,setQuery]=useState(''), [type,setType]=useState('all'), [onlyFavorites,setOnlyFavorites]=useState(false)
  const [favorites,setFavorites]=useLocal<string[]>('ugen-directory-favorites',[])
  const base=directoryEntries.filter(entry=>housing ? entry.kind!=='recruitment' : entry.kind==='recruitment')
  const words=query.toLocaleLowerCase('da').trim().split(/\s+/).filter(Boolean)
  const shown=base.filter(entry=>(type==='all'||entry.kind===type)&&(!onlyFavorites||favorites.includes(entry.id))&&words.every(word=>(entry.name+' '+entry.da+' '+entry.en).toLocaleLowerCase('da').includes(word))).sort((a,b)=>a.name.localeCompare(b.name,'da'))
  return <>
    <PageTitle index={t('LIVET I DANMARK', 'LIFE IN DENMARK')} title={housing?t('Find bolig', 'Find a home'):t('Find job', 'Find work')} description={housing?t('10 steder at begynde, når du vil leje eller købe bolig.', '10 places to start when renting or buying a home.'):t('10 rekrutteringsbureauer til dit næste job i Danmark.', '10 recruitment companies for your next job in Denmark.')} />
    <section className="card stack directory-intro"><div className="inline">{housing?<House size={24}/>:<BriefcaseBusiness size={24}/>}<h2>{t('Et roligt sted at begynde', 'A clear place to start')}</h2></div>
      <p>{t('Et kurateret udvalg i alfabetisk rækkefølge. Ingen annoncer, betalte placeringer eller affiliatelinks i Ugen.', 'A curated selection in alphabetical order. No ads, paid placements, or affiliate links in Ugen.')}</p>
      <p className="muted small">{housing?t('Søg aktuelle boliger hos udbyderen. Ventelister, medlemskab og vilkår varierer. Ugen viser ikke liveboliger eller priser.', 'Search current properties with each provider. Waiting lists, membership, and terms vary. Ugen does not display live property listings or prices.'):t('Udvalget dækker forskellige typer job og rekruttering. Det er ikke en rangliste. Se aktuelle stillinger og krav på firmaets officielle side.', 'The selection covers different job and recruitment services. It is not a ranking. View current vacancies and requirements on each company’s official site.')}</p>
    </section>
    <section className="stack" aria-label={housing?t('Boligudbydere', 'Housing providers'):t('Rekrutteringsbureauer', 'Recruitment companies')}>
      <label className="store-search">{t('Søg i oversigten', 'Search the directory')}<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={housing?'København, leje, EDC…':'IT, lager, Randstad…'} /></label>
      {housing&&<div className="chip-row" role="group" aria-label={t('Boligtype', 'Housing type')}>{[['all',t('Alle','All')],['rent',t('Lej bolig','Rent a home')],['buy',t('Køb bolig','Buy a home')]].map(([id,name])=><button type="button" className="chip" key={id} aria-pressed={type===id} onClick={()=>setType(id)}>{name}</button>)}</div>}
      <label className="inline sunday-filter"><input type="checkbox" checked={onlyFavorites} onChange={event=>setOnlyFavorites(event.target.checked)}/>{t('Kun mine favoritter', 'Only my favourites')}</label>
      <p className="muted small" role="status">{shown.length} {t('steder', 'places')} · {t('Officielle links kontrolleret 27. november 2026', 'Official links checked 27 November 2026')}</p>
      {!online&&<p className="notice">{t('Oversigten og dine favoritter virker offline. De eksterne sider kræver internet.', 'The directory and favourites work offline. External sites need an internet connection.')}</p>}
      <div className="directory-grid">{shown.map(entry=><article className="card stack directory-card" key={entry.id}>
        <div className="between"><span className="source-label">{entry.kind==='recruitment'?t('Rekruttering', 'Recruitment'):entry.kind==='rent'?t('Leje', 'Rent'):t('Køb', 'Buy')}</span><button className="icon-button" type="button" aria-label={t('Gem ', 'Save ')+entry.name} aria-pressed={favorites.includes(entry.id)} onClick={()=>setFavorites(favorites.includes(entry.id)?favorites.filter(id=>id!==entry.id):[...favorites,entry.id])}><Heart size={18} fill={favorites.includes(entry.id)?'currentColor':'none'}/></button></div>
        <h2>{entry.name}</h2><p className="muted">{entry[language]}</p><a className="secondary fit" href={entry.url} target="_blank" rel="noopener noreferrer">{entry.kind==='recruitment'?t('Se jobmuligheder', 'See job opportunities'):entry.kind==='rent'?t('Søg lejebolig', 'Search rental homes'):t('Søg bolig til salg', 'Search homes for sale')}<span className="sr-only"> · {entry.name}</span></a><span className="muted small">{new URL(entry.url).hostname.replace(/^www\./,'')}</span>
      </article>)}</div>
      {!shown.length&&<p className="card muted">{onlyFavorites?t('Ingen gemte steder matcher. Gem et sted med hjertet.', 'No saved places match. Save a place with the heart.'):t('Ingen steder matcher din søgning.', 'No places match your search.')}</p>}
    </section>
  </>
}
