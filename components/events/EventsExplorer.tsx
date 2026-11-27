'use client'
import { useState } from 'react'
import { addDays } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useFeed } from '../../hooks/useFeed'
import { dateKey } from '../../lib/holidays'
import { fromDateKey } from '../../lib/iso-week'
import { denmarkEvents, eventKind, eventsBetween, mergeEvents, type DenmarkEvent } from '../../lib/denmark-events'
import { validEventDate, type EventsData } from '../../lib/event-discovery'
import { marketGuides } from '../../lib/markets'
import { DenmarkEventList } from '../calendar/DenmarkEvents'
import { PageTitle } from '../ui/PageTitle'
import { UgenLink, usePreferences } from '../ui/Shell'

export function EventsTeaser() {
  const { t } = usePreferences()
  return <section className="card stack"><CalendarDays size={24} aria-hidden="true" /><h2>{t('Ud i byen', 'Out and about')}</h2><p className="muted">{t('Søndagsmarkeder, koncerter og små oplevelser i Danmark.', 'Sunday markets, concerts, and things to do in Denmark.')}</p><UgenLink className="secondary fit" href="/mere/oplevelser">{t('Find oplevelser & markeder', 'Find events & markets')}</UgenLink></section>
}

export function EventsExplorer({ initialToday, marketsOnly = false }: { initialToday: string; marketsOnly?: boolean }) {
  const { t, language, online } = usePreferences()
  const [start, setStart] = useState(initialToday), [end, setEnd] = useState(dateKey(addDays(fromDateKey(initialToday), 90)))
  const [query, setQuery] = useState(''), [city, setCity] = useState('all'), [kind, setKind] = useState(marketsOnly ? 'market' : 'all'), [sunday, setSunday] = useState(false)
  const [visible, setVisible] = useState(24)
  const valid = validEventDate(start) && validEventDate(end) && start <= end && Date.parse(end) - Date.parse(start) <= 366 * 86400000
  // Keep the last valid request while a date input is being edited.
  const [requested, setRequested] = useState({ start: initialToday, end: dateKey(addDays(fromDateKey(initialToday), 90)) })
  const { data, cached, loading, error, retry } = useFeed<EventsData>('/api/events?start=' + requested.start + '&end=' + requested.end + (marketsOnly ? '&kind=market' : ''), online)
  const curated: DenmarkEvent[] = []
  for (let year = Number(requested.start.slice(0,4)); year <= Number(requested.end.slice(0,4)); year++) curated.push(...denmarkEvents(year))
  const all = eventsBetween(mergeEvents([...(data?.events ?? []), ...curated]), requested.start, requested.end)
  const words = query.toLocaleLowerCase('da').trim().split(/\s+/).filter(Boolean)
  const shown = all.filter(event => (!marketsOnly || eventKind(event) === 'market') && (city === 'all' || event.city === city) && (kind === 'all' || eventKind(event) === kind) &&
    (!sunday || eventKind(event) === 'market' && dateKey(addDays(fromDateKey(event.start), (7 - fromDateKey(event.start).getDay()) % 7)) <= event.end) &&
    words.every(word => [event.da,event.en,event.city,event.place ?? ''].join(' ').toLocaleLowerCase('da').includes(word)))
  return <>
    <UgenLink className="text-link back-link" href="/mere">{t('Tilbage til Mere', 'Back to More')}</UgenLink>
    <PageTitle index={t('DET SKER I DANMARK', 'WHAT’S ON IN DENMARK')} title={marketsOnly ? t('Markeder', 'Markets') : t('Ud i byen', 'Out and about')} description={marketsOnly ? t('Find loppemarkeder, søndagsfund og sæsonens markeder.', 'Find flea markets, Sunday finds, and seasonal markets.') : t('Find den næste koncert, et søndagsmarked eller en ny tradition.', 'Find your next concert, a Sunday market, or a new tradition.')} />
    <section className="card stack event-explorer" aria-label={t('Find arrangementer', 'Find events')}>
      <form className="stack" onSubmit={event => { event.preventDefault(); if (valid) setRequested({ start, end }) }}>
        <div className="form-grid"><label>{t('Fra dato', 'From date')}<input type="date" value={start} onChange={event => setStart(event.target.value)} required /></label><label>{t('Til dato', 'To date')}<input type="date" value={end} onChange={event => setEnd(event.target.value)} required /></label></div>
        {!valid && <p role="status">{t('Vælg en gyldig periode på højst 366 dage.', 'Choose a valid range of at most 366 days.')}</p>}
        <button className="secondary fit" type="submit" disabled={!valid}>{t('Vis perioden', 'Show date range')}</button>
      </form>
      <div className="form-grid"><label>{t('Søg efter oplevelse', 'Search events')}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Lucia, VEGA, loppemarked…" /></label>
        <label>{t('By', 'City')}<select aria-label={t('By', 'City')} value={city} onChange={event => setCity(event.target.value)}><option value="all">{t('Hele Danmark', 'All Denmark')}</option>{['København','Gentofte','Aarhus','Odense','Roskilde'].map(value=><option key={value}>{value}</option>)}</select></label>
        {!marketsOnly && <label>{t('Arrangementstype', 'Event type')}<select aria-label={t('Arrangementstype', 'Event type')} value={kind} onChange={event => setKind(event.target.value)}>{[['all',t('Alle','All')],['market',t('Markeder','Markets')],['concert',t('Koncerter','Concerts')],['social',t('Socialt & kultur','Social & culture')],['tradition',t('Traditioner','Traditions')]].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>}
      </div>
      <label className="inline sunday-filter"><input type="checkbox" checked={sunday} onChange={event => { setSunday(event.target.checked); if(event.target.checked) setKind('market') }} />{t('Kun søndagsmarkeder', 'Sunday markets only')}</label>
      <div className="between"><p className="muted small" role="status">{shown.length} {t('arrangementer', 'events')} · {requested.start} – {requested.end}</p><button className="secondary" type="button" onClick={retry} disabled={!online || loading}>{t('Opdatér', 'Refresh')}</button></div>
      {loading && <p className="muted small">{marketsOnly ? t('Henter markeder…', 'Loading markets…') : t('Henter nye koncerter fra VEGA…', 'Checking new concerts from VEGA…')}</p>}
      {(error || cached || data?.unavailable.length) ? <p className="notice">{marketsOnly ? t('Viser gemte markeder og kendte sæsondatoer. Tjek aktuelle åbningstider hos arrangøren.', 'Showing saved markets and known season dates. Check current hours with the organiser.') : t('Viser det tilgængelige overblik. Nye VEGA-opslag kan være utilgængelige eller gemte.', 'Showing available listings. New VEGA listings may be unavailable or cached.')}</p> : null}
      <p className="muted small">{marketsOnly ? t('Udvalgte markeder med daterede opslag og kendte sæsonplaner. Tjek åbningstider, aflysninger og eventuel entré hos arrangøren.', 'Selected markets with dated listings and known seasonal schedules. Check opening hours, cancellations, and any admission fees with the organiser.') : t('Daterede markeder og kuraterede oplevelser, suppleret med offentlige VEGA-opslag. Ikke en komplet Danmarkskalender. Tjek åbningstid, aflysninger og billetter hos arrangøren.', 'Dated markets and curated events, supplemented with public VEGA listings. Coverage is a selection across Denmark. Check hours, cancellations, and tickets with the organiser.')}</p>
      {shown.length ? <DenmarkEventList events={shown.slice(0, visible)} /> : <p className="empty">{t('Ingen arrangementer matcher perioden og filtrene. Prøv flere byer eller se markedsguiden nedenfor.', 'No events match the dates and filters. Try more cities or browse the market guide below.')}</p>}
      {shown.length > visible && <button className="secondary fit" type="button" onClick={() => setVisible(visible + 24)}>{t('Vis flere arrangementer', 'Show more events')} ({shown.length - visible})</button>}
    </section>
    <section className="stack market-guide" aria-labelledby="market-guide-title"><h2 id="market-guide-title">{t('Søndagsmarkeder, der er værd at kende', 'Sunday markets worth knowing')}</h2><p className="muted">{t('Sæsoner og faste steder – også når markedet holder vinterpause. Kun kendte sæsondatoer vises i kalenderen.', 'Seasons and regular locations, including markets on a winter break. Only known season dates appear in the calendar.')}</p>
      <div className="supermarket-grid">{marketGuides.filter(guide => city === 'all' || guide.city === city).map(guide=><article className="card stack" key={guide.name}><h3>{guide.name}</h3><p>{guide.place}</p><p className="muted">{guide[language]}</p><a className="secondary fit" href={guide.url} target="_blank" rel="noopener noreferrer">{t('Se markedets kalender', 'View market calendar')}</a></article>)}</div>
    </section>
  </>
}
