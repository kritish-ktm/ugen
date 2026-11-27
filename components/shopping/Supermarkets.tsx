'use client'
import { useState } from 'react'
import { Heart, ShoppingBasket } from 'lucide-react'
import { supermarkets } from '../../lib/supermarkets'
import { useLocal } from '../../hooks/useLocal'
import { PageTitle } from '../ui/PageTitle'
import { UgenLink, usePreferences } from '../ui/Shell'
import { AlcoholOffers } from './AlcoholOffers'

export function ShoppingTeaser() {
  const { t } = usePreferences()
  return <section className="card stack shopping-teaser">
    <ShoppingBasket size={24} aria-hidden="true" />
    <h2>{t('Godt indkøbt.', 'A good shop.')}</h2>
    <p className="muted">{t('Find ugens tilbud hos dine danske supermarkeder. Lidt mere overblik før indkøbsturen.', 'Find weekly offers at supermarkets in Denmark. A little planning before your next shop.')}</p>
    <div className="retailer-strip" aria-hidden="true"><span>Netto</span><span>REMA 1000</span><span>Lidl</span></div>
    <UgenLink className="secondary fit" href="/mere/tilbud">{t('Se supermarkeder & tilbud', 'Browse supermarkets & offers')}</UgenLink>
  </section>
}

export function Supermarkets() {
  const { t, language, online } = usePreferences()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [favorites, setFavorites] = useLocal<string[]>('ugen-supermarkets', [])
  const shown = supermarkets.filter(store => store.name.toLocaleLowerCase('da').includes(search.toLocaleLowerCase('da')) &&
    (filter === 'all' || filter === store.kind || filter === 'favorites' && favorites.includes(store.id)))
  return <>
    <UgenLink href="/mere" className="text-link back-link">{t('Tilbage til Mere', 'Back to More')}</UgenLink>
    <PageTitle index={t('INDKØB I DANMARK', 'SHOPPING IN DENMARK')} title={t('Ugens indkøb', 'This week’s shop')} description={t('Dine supermarkeder. Deres aktuelle tilbud. Ét sted at begynde.', 'Your supermarkets. Their current offers. One place to start.')} />
    <section className="shopping-intro card stack">
      <div className="inline"><ShoppingBasket size={23} aria-hidden="true" /><h2>{t('Kig i avisen, før du handler', 'Check the leaflet before you shop')}</h2></div>
      <p>{t('Åbn butikkens egen tilbudsavis eller tilbudsside for aktuelle varer og priser. Gem dine favoritter med hjertet, så de er nemme at finde næste gang.', 'Open the retailer’s own leaflet or offers page for current products and prices. Save your favourites with the heart to find them easily next time.')}</p>
      <p className="muted small">{t('Tilbuddene åbnes hos butikkerne og følger deres egne datoer, også når du ser en anden uge i kalenderen. Medlemspriser kræver medlemskab; lokale forskelle kan forekomme.', 'Offers open on the retailers’ sites and follow their own validity dates, including when another calendar week is selected. Member prices require membership; local differences may apply.')}</p>
    </section>
    <AlcoholOffers />
    <section className="stack supermarket-section" aria-label={t('Supermarkeder og tilbudsaviser', 'Supermarkets and offer leaflets')}>
      <label className="store-search">{t('Find et supermarked', 'Find a supermarket')}<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t('Søg efter navn…', 'Search by name…')} /></label>
      <div className="chip-row" role="group" aria-label={t('Butikstype', 'Store type')}>{[
        ['all', t('Alle butikker', 'All stores')], ['favorites', t('Mine favoritter', 'My favourites')], ['discount', 'Discount'], ['supermarket', t('Supermarkeder', 'Supermarkets')],
      ].map(([id, name]) => <button key={id} type="button" className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{name}</button>)}</div>
      {!online && <p className="notice">{t('Butikkernes tilbud kræver internet. Dine favoritter er gemt på denne enhed.', 'Retailer offers need an internet connection. Your favourites are saved on this device.')}</p>}
      <p className="muted small" role="status">{shown.length} {t('butikker', 'stores')}</p>
      <div className="supermarket-grid">{shown.map(store => <article className="card store-card stack" key={store.id}>
        <div className="between"><span className={'store-wordmark store-' + store.id}>{store.name}</span><button className="icon-button" type="button" aria-label={t('Favorit ', 'Favourite ') + store.name} aria-pressed={favorites.includes(store.id)} onClick={() => setFavorites(favorites.includes(store.id) ? favorites.filter(id => id !== store.id) : [...favorites, store.id])}><Heart size={19} fill={favorites.includes(store.id) ? 'currentColor' : 'none'} /></button></div>
        <div><h2>{store.name}</h2><p className="muted">{store[language]}</p></div>
        <a className="secondary fit" href={store.offers} target="_blank" rel="noopener noreferrer" aria-label={t('Se aktuelle tilbud hos ', 'View current offers at ') + store.name}>{t('Se aktuelle tilbud', 'View current offers')}</a>
        <span className="muted small">{t('Åbner butikkens officielle side', 'Opens the retailer’s official site')}</span>
      </article>)}</div>
      {!shown.length && <p className="card muted">{filter === 'favorites' ? t('Gem en butik med hjertet for at se den her.', 'Save a store with the heart to see it here.') : t('Ingen butikker matcher din søgning.', 'No stores match your search.')}</p>}
    </section>
  </>
}
