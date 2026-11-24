'use client'

import { format } from 'date-fns'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import type { DenmarkEvent } from '../../lib/denmark-events'
import { fromDateKey } from '../../lib/iso-week'
import { locales } from '../../lib/i18n'
import { usePreferences } from '../ui/Shell'

export function DenmarkEventList({ events }: { events: DenmarkEvent[] }) {
  const { t, language } = usePreferences()
  const date = (key: string) => format(fromDateKey(key), 'd. MMM', { locale: locales[language] })

  return <ul className="danish-events" role="list">{events.map(event => <li key={event.start + event.da}>
    <a href={event.url} target="_blank" rel="noopener noreferrer" className="between">
      <span><strong>{event[language]}</strong><span className="muted small">
        <time dateTime={event.start}>{date(event.start)}</time>
        {event.end !== event.start && <> – <time dateTime={event.end}>{date(event.end)}</time></>}
        {' · '}{event.city ? t(event.city, event.city === 'København' ? 'Copenhagen' : event.city) : t('Dansk tradition', 'Danish tradition')}
      </span></span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  </li>)}</ul>
}

export function DenmarkEventsCard({ events }: { events: DenmarkEvent[] }) {
  const { t } = usePreferences()
  return <section className="card stack">
    <div className="between"><h2>{t('Det sker i Danmark', 'What’s on in Denmark')}</h2><span className="summary-icon"><CalendarDays size={18} aria-hidden="true" /></span></div>
    <p className="muted small">{t('Udvalgte arrangementer og danske traditioner', 'Selected events and Danish traditions')}</p>
    <DenmarkEventList events={events} />
    <a className="secondary fit" href="https://www.kultunaut.dk/">{t('Find flere på KultuNaut', 'Find more on KultuNaut')}<ArrowUpRight size={15} aria-hidden="true" /></a>
  </section>
}
