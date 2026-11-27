'use client'

import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { eventKind, type DenmarkEvent } from '../../lib/denmark-events'
import { fromDateKey } from '../../lib/iso-week'
import { locales } from '../../lib/i18n'
import { UgenLink, usePreferences } from '../ui/Shell'
import { DayImage } from './DayImage'

export function DenmarkEventList({ events }: { events: DenmarkEvent[] }) {
  const { t, language } = usePreferences()
  const date = (key: string) => format(fromDateKey(key), 'd. MMM', { locale: locales[language] })

  return <ul className="danish-events" role="list">{events.map(event => <li key={event.start + event.da}>
    <a href={event.url} target="_blank" rel="noopener noreferrer" className="between">
      <span><strong>{event[language]}</strong><span className="muted small">
        <time dateTime={event.start}>{date(event.start)}</time>
        {event.end !== event.start && <> – <time dateTime={event.end}>{date(event.end)}</time></>}
        {' · '}{event.city ? t(event.city, event.city === 'København' ? 'Copenhagen' : event.city) : t('Dansk tradition', 'Danish tradition')}
        {event.time && <> · {event.time}</>}
        {event.place && <span className="event-place">{event.place}</span>}
        {event.schedule && <span className="event-place">{t('Efter sæsonplan · tjek arrangørens kalender', 'Seasonal schedule · check organiser calendar')}</span>}
        {event.discovered && <span className="event-place">{t('Fundet i VEGAs program · tjek status og tid', 'Found in VEGA’s programme · check status and time')}</span>}
      </span></span>
    </a>
  </li>)}</ul>
}

export function DenmarkEventsCard({ events, week }: { events: DenmarkEvent[]; week: number }) {
  const { t } = usePreferences()
  const [city, setCity] = useState('all')
  const [kind, setKind] = useState('all')
  const cities = ['København', 'Gentofte', 'Aarhus', 'Odense', 'Roskilde']
  const shown = events.filter(event => (city === 'all' || event.city === city || !event.city) && (kind === 'all' || eventKind(event) === kind))
  const illustratedDay = shown.find(event => eventKind(event) === 'tradition')?.start
  return <section className="card stack">
    <div className="between"><h2>{t('Det sker i Danmark', 'What’s on in Denmark')}</h2><span className="summary-icon"><CalendarDays size={18} aria-hidden="true" /></span></div>
    <p className="muted small">{t('Udvalgte arrangementer og traditioner i uge ', 'Selected events and traditions in week ')}{week}</p>
    <label>{t('Område', 'Area')}<select aria-label={t('Område', 'Area')} value={city} onChange={event => setCity(event.target.value)}><option value="all">{t('Hele Danmark', 'All Denmark')}</option>{cities.map(name => <option key={name}>{name}</option>)}</select></label>
    <label>{t('Arrangementstype', 'Event type')}<select aria-label={t('Arrangementstype', 'Event type')} value={kind} onChange={event => setKind(event.target.value)}>{[['all',t('Alle','All')],['market',t('Markeder','Markets')],['concert',t('Koncerter','Concerts')],['social',t('Socialt & kultur','Social & culture')],['tradition',t('Traditioner','Traditions')]].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    {illustratedDay && <DayImage key={illustratedDay} date={illustratedDay} compact />}
    {shown.length ? <DenmarkEventList events={shown} /> : <p className="muted">{t('Ingen udvalgte arrangementer her i denne uge. Find flere lokale oplevelser på KultuNaut.', 'No selected events here this week. Find more local activities on KultuNaut.')}</p>}
    <p className="muted small">{t('Et udvalgt overblik. Bekræft dato og billet hos arrangøren.', 'A curated selection. Confirm dates and tickets with the organiser.')}</p>
    <a className="secondary fit" href="https://www.kultunaut.dk/" target="_blank" rel="noopener noreferrer">{t('Find flere på KultuNaut', 'Find more on KultuNaut')}</a>
    <UgenLink className="secondary fit" href="/mere/oplevelser">{t('Find oplevelser & markeder', 'Find events & markets')}</UgenLink>
  </section>
}
