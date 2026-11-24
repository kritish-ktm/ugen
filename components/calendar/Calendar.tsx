'use client'
import { useEffect, useState } from 'react'
import { addDays, addMonths, addWeeks, endOfMonth, endOfISOWeek, format, getDayOfYear, startOfISOWeek, startOfMonth } from 'date-fns'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Bell, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Flag, Plus, Sunrise, Sunset } from 'lucide-react'
import { useLocal } from '../../hooks/useLocal'
import { capitalize, locales } from '../../lib/i18n'
import { danishToday, dateFromWeek, fromDateKey, isoWeek, weeksInYear } from '../../lib/iso-week'
import { dateKey, holidays, nextHoliday, type Holiday } from '../../lib/holidays'
import { denmarkEvents, eventsBetween, type DenmarkEvent } from '../../lib/denmark-events'
import { DenmarkEventsCard, DenmarkEventList } from './DenmarkEvents'
import { schoolHoliday } from '../../lib/school'
import { nameDay } from '../../lib/nameDays'
import { cities, sunTimes } from '../../lib/sun'
import { PageTitle } from '../ui/PageTitle'
import { Sheet } from '../ui/Sheet'
import { usePreferences } from '../ui/Shell'
import { ReminderForm, ReminderList, useReminders } from './Reminders'

type View = 'month' | 'week' | 'day'
const views: View[] = ['month', 'week', 'day']
const seven = (first: Date) => Array.from({ length: 7 }, (_, i) => addDays(first, i))
function monthRows(date: Date) {
  const last = endOfMonth(date)
  const rows: Date[][] = []
  for (let first = startOfISOWeek(startOfMonth(date)); first <= last; first = addWeeks(first, 1)) rows.push(seven(first))
  return rows
}

export function Calendar({ initialToday }: { initialToday: string }) {
  const { language, t } = usePreferences()
  const reduced = useReducedMotion()
  const [todayKey, setToday] = useState(initialToday)
  const [choice, setChoice] = useState<string | null>(null)
  const [view, setView] = useState<View>('month')
  const [detail, setDetail] = useState<string | null>(null)
  const [jump, setJump] = useState(false)
  const [reminders] = useReminders()
  const today = fromDateKey(todayKey)
  const selected = fromDateKey(choice ?? todayKey)
  const selectedKey = dateKey(selected)
  const locale = locales[language]
  const f = (date: Date, pattern: string) => format(date, pattern, { locale })
  const week = isoWeek(selected)
  const weekStart = startOfISOWeek(selected)
  const weekEnd = endOfISOWeek(selected)
  const days = seven(weekStart)
  const year = selected.getFullYear()
  const events = new Map<string, Holiday>()
  for (const item of [...holidays(year - 1), ...holidays(year), ...holidays(year + 1)]) {
    const key = dateKey(item.date)
    const sameDay = events.get(key)
    events.set(key, sameDay ? {
      ...item, da: sameDay.da + ' · ' + item.da, en: sameDay.en + ' · ' + item.en,
      public: sameDay.public || item.public, flag: sameDay.flag || item.flag,
    } : item)
  }
  const weekReminders = reminders.filter(item => item.date >= dateKey(weekStart) && item.date <= dateKey(weekEnd))
  const holidayCount = days.filter(day => events.get(dateKey(day))?.public).length
  const upcoming = nextHoliday(today)
  const hero = t('Uge ', 'Week ') + week.week
  const activeWeek = isoWeek(today).week === week.week && isoWeek(today).year === week.year
  const range = f(weekStart, 'd. MMM') + ' – ' + f(weekEnd, 'd. MMM')
  const month = selected.getMonth()
  const localEvents = [...denmarkEvents(year), ...denmarkEvents(year - 1).filter(event => event.end < year + '-01-01'), ...denmarkEvents(year + 1).filter(event => event.start >= (year + 1) + '-01-01')]
  const currentEvents = denmarkEvents(today.getFullYear())
  const upcomingEvents = [...currentEvents, ...denmarkEvents(today.getFullYear() + 1).filter(event => event.start > today.getFullYear() + '-12-31')]
    .filter(event => event.end >= todayKey).slice(0, 6)
  const selectedEvents = eventsBetween(localEvents, selectedKey)

  useEffect(() => {
    const refresh = () => setToday(danishToday())
    refresh()
    const id = setInterval(refresh, 30000)
    document.addEventListener('visibilitychange', refresh)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', refresh) }
  }, [])

  function step(direction: number) {
    const next = view === 'month' ? addMonths(selected, direction) : view === 'week' ? addWeeks(selected, direction) : addDays(selected, direction)
    setChoice(dateKey(next))
  }
  function showDay(key: string) { setChoice(key); setDetail(key) }
  function cell(date: Date) {
    const key = dateKey(date)
    const event = events.get(key)
    const isToday = key === todayKey
    const starts = localEvents.filter(item => item.start === key)
    const isSchool = schoolHoliday(key)
    const hasReminder = reminders.some(item => item.date === key)
    const label = [capitalize(f(date, 'EEEE d. MMMM yyyy')), event?.[language], ...starts.map(item => item[language]), event?.flag ? t('Flagdag', 'Flag day') : '', isSchool ? t('Skoleferie i København', 'Copenhagen school break') : '', hasReminder ? t('Påmindelse', 'Reminder') : ''].filter(Boolean).join(', ')
    return <motion.button key={key} type="button" layoutId={reduced ? undefined : 'day-' + key} className={'day-cell' + (isToday ? ' today' : '') + (isSchool ? ' school' : '') + (view === 'month' && date.getMonth() !== month ? ' outside' : '') + (selectedKey === key ? ' selected' : '')}
      aria-label={label} aria-current={isToday ? 'date' : undefined} onClick={() => showDay(key)}>
      <span>{date.getDate()}</span><span className="day-marks">{event?.public && <i className="holiday-dot" />}{event?.flag && <Flag size={10} />}{hasReminder && <i className="reminder-dot" />}{starts.length > 0 && <i className="event-dot" />}</span>
    </motion.button>
  }

  return <>
    <PageTitle index={t('UGEOVERBLIK', 'WEEK AT A GLANCE')} title={t('Kalender', 'Calendar')} description={t('Hele ugen. Lige ved hånden.', 'The whole week, at your fingertips.')} />
    <section className="hero" aria-labelledby="week-title">
      <span className="paper-flag" aria-hidden="true" />
      <p className="hero-label"><span className="section-dot" />{activeWeek ? t('DENNE UGE', 'THIS WEEK') : t('VALGT UGE', 'SELECTED WEEK')} · {week.year}</p>
      <h2 id="week-title" className="hero-number">{hero}</h2>
      <p className="hero-date">{activeWeek ? capitalize(f(today, 'EEEE d. MMMM')) : range}</p>
    </section>
    <div className="dashboard">
      <section className="card calendar-card stack" aria-label={t('Kalendervisning', 'Calendar view')}>
        <div className="between calendar-toolbar">
          <div><p className="card-label">{t('KALENDER', 'CALENDAR')}</p><h2>{view === 'month' ? capitalize(f(selected, 'MMMM yyyy')) : view === 'week' ? t('Uge ', 'Week ') + week.week : capitalize(f(selected, 'd. MMMM'))}</h2></div>
          <div className="inline">
            <button className="icon-button" type="button" onClick={() => step(-1)} aria-label={t('Forrige', 'Previous')}><ChevronLeft size={18} /></button>
            <button className="icon-button" type="button" onClick={() => step(1)} aria-label={t('Næste', 'Next')}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="between calendar-tools">
          <div className="segments" role="group" aria-label={t('Visning', 'View')}>{views.map((item, i) => <button key={item} type="button" aria-pressed={item === view} onClick={() => setView(item)}>
            {item === view && <motion.i layoutId="calendar-segment" />}{t(['Måned', 'Uge', 'Dag'][i], ['Month', 'Week', 'Day'][i])}
          </button>)}</div>
          <button type="button" className="secondary today-button" onClick={() => setChoice(null)}>{t('I dag', 'Today')}</button>
        </div>
        {view !== 'day' ? <div className="calendar-grid" data-view={view}>
          <div className="calendar-row calendar-head"><span>{t('UGE', 'WK')}</span>{seven(weekStart).map(day => <span key={day.getDay()}>{f(day, 'EEE')}</span>)}</div>
          <AnimatePresence initial={false}>
            {(view === 'month' ? monthRows(selected) : [days]).map(row => {
              const rowWeek = isoWeek(row[0])
              return <motion.div layout={reduced ? false : 'position'} exit={reduced ? { opacity: 0 } : { opacity: 0, scaleY: .78 }} key={dateKey(row[0])} className={'calendar-row' + (rowWeek.week === week.week && rowWeek.year === week.year ? ' current-row' : '')}>
                <button type="button" className="week-cell" aria-label={t('Vis uge ', 'Show week ') + rowWeek.week} onClick={() => { setChoice(dateKey(row[0])); setView('week') }}>{rowWeek.week}</button>
                {row.map(cell)}
              </motion.div>
            })}
          </AnimatePresence>
        </div> : <div className="day-overview stack">
          <div className="inline"><CalendarDays size={19} />{capitalize(f(selected, 'EEEE d. MMMM'))}</div>
          {events.get(selectedKey) && <p className="inline"><Flag size={16} />{events.get(selectedKey)?.[language]}</p>}
          {selectedEvents.length > 0 && <DenmarkEventList events={selectedEvents} />}
          <ReminderList items={reminders.filter(item => item.date === selectedKey)} />
          <button type="button" className="secondary fit" onClick={() => setDetail(selectedKey)}>{t('Se dagens detaljer', 'View day details')}<ArrowRight size={15} /></button>
        </div>}
        <div className="calendar-footer between">
          <div className="calendar-legend"><span><i className="holiday-dot" />{t('Helligdag', 'Holiday')}</span><span><Flag size={12} />{t('Flagdag', 'Flag day')}</span><span><i className="school-dot" />{t('Skoleferie', 'School break')}</span><span><i className="event-dot" />{t('Eventstart', 'Event starts')}</span></div>
          <button type="button" className="secondary jump-button" onClick={() => setJump(true)}><CalendarRange size={16} />{t('Gå til uge', 'Go to week')}</button>
        </div>
      </section>
      <aside className="stack">
        <section className="card stack week-summary">
          <div className="between"><div><p className="card-label">{t('UGENS OVERBLIK', 'WEEK SUMMARY')}</p><h2>{t('Uge ', 'Week ')}{week.week}</h2></div><div className="summary-icon"><CalendarRange size={20} /></div></div>
          <p className="muted small">{range}</p>
          <ol className="week-mini" role="list" aria-label={t('Ugens dage', 'Days of the week')}>
            {days.map(day => {
              const key = dateKey(day)
              const holiday = events.get(key)
              const hasReminder = weekReminders.some(item => item.date === key)
              return <li key={key} aria-current={key === todayKey ? 'date' : undefined}>
                <span aria-hidden="true">{f(day, 'EEEEE')}</span>
                <time dateTime={key} aria-label={capitalize(f(day, 'EEEE d. MMMM'))}>{day.getDate()}</time>
                <span className="week-marks">
                  {holiday?.public && <Flag size={12} aria-hidden="true" />}
                  {hasReminder && <Bell size={12} aria-hidden="true" />}
                  <span className="sr-only">{[holiday?.public ? holiday[language] : '', hasReminder ? t('Påmindelse', 'Reminder') : ''].filter(Boolean).join(' · ')}</span>
                </span>
              </li>
            })}
          </ol>
          <div className="summary-stat"><span className="inline"><Bell size={16} />{t('Påmindelser', 'Reminders')}</span><strong>{weekReminders.length}</strong></div>
          <div className="summary-stat"><span className="inline"><Flag size={16} />{t('Helligdage', 'Public holidays')}</span><strong>{holidayCount}</strong></div>
          <button type="button" className="secondary fit" onClick={() => setDetail(selectedKey)}><Plus size={16} />{t('Tilføj påmindelse', 'Add reminder')}</button>
        </section>
        <section className="card next-holiday">
          <div className="summary-icon"><Flag size={17} /></div><div><p className="card-label">{t('NÆSTE HELLIGDAG', 'NEXT PUBLIC HOLIDAY')}</p><h3>{upcoming[language]}</h3><p className="muted small">{f(upcoming.date, 'd. MMMM')} · {upcoming.remaining} {t('dage', 'days')}</p></div>
        </section>
        <DenmarkEventsCard events={upcomingEvents} />
      </aside>
    </div>
    {jump && <WeekJump initial={week} onClose={() => setJump(false)} onJump={date => { setChoice(dateKey(date)); setView('week'); setJump(false) }} />}
    {detail && <DaySheet key={detail} date={fromDateKey(detail)} holiday={events.get(detail)} localEvents={eventsBetween(localEvents, detail)} onClose={() => setDetail(null)} />}
  </>
}

function WeekJump({ initial, onClose, onJump }: { initial: { week: number; year: number }; onClose: () => void; onJump: (date: Date) => void }) {
  const { t } = usePreferences()
  const [year, setYear] = useState(initial.year)
  const [week, setWeek] = useState(initial.week)
  const years = Array.from({ length: 201 }, (_, i) => initial.year - 100 + i)
  return <Sheet title={t('Gå til uge', 'Go to week')} onClose={onClose}>
    <form className="stack" onSubmit={event => { event.preventDefault(); onJump(dateFromWeek(year, week)) }}>
      <div className="form-grid">
        <label>{t('År', 'Year')}<select aria-label={t('År', 'Year')} value={year} onChange={event => { const next = +event.target.value; setYear(next); setWeek(Math.min(week, weeksInYear(next))) }}>{years.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>{t('Ugenummer', 'Week number')}<select aria-label={t('Ugenummer', 'Week number')} value={week} onChange={event => setWeek(+event.target.value)}>{Array.from({ length: weeksInYear(year) }, (_, i) => <option key={i}>{i + 1}</option>)}</select></label>
      </div>
      <button className="primary fit" type="submit">{t('Vis uge', 'Go to selected week')}<ArrowRight size={16} /></button>
    </form>
  </Sheet>
}

function DaySheet({ date, holiday, localEvents, onClose }: { date: Date; holiday?: Holiday; localEvents: DenmarkEvent[]; onClose: () => void }) {
  const { t, language } = usePreferences()
  const [location, setLocation] = useLocal('ugen-sun-city', 0)
  const [reminders] = useReminders()
  const [adding, setAdding] = useState(false)
  const key = dateKey(date)
  const city = cities[location] ?? cities[0]
  const sun = sunTimes(date, city.lat, city.lon)
  const next = nextHoliday(date)
  const iso = isoWeek(date)
  return <Sheet title={capitalize(format(date, 'EEEE d. MMMM', { locale: locales[language] }))} onClose={onClose} sharedId={'day-' + key}>
    <div className="stack">
      {holiday && <p className="inline"><Flag size={17} />{holiday[language]}</p>}
      {schoolHoliday(key) && <p className="notice">{t('Vejledende skoleferie i København', 'Advisory Copenhagen school break')}</p>}
      {localEvents.length > 0 && <section><h3>{t('Arrangementer og traditioner', 'Events and traditions')}</h3><DenmarkEventList events={localEvents} /></section>}
      <dl className="detail-list">
        <div><dt>{t('Uge', 'Week')}</dt><dd>{iso.week} · {iso.year}</dd></div>
        <div><dt>{t('Årets dag', 'Day of year')}</dt><dd>{getDayOfYear(date)}</dd></div>
        <div><dt>{t('Navnedag', 'Name day')}</dt><dd>{nameDay(key) ?? '—'}</dd></div>
        <div><dt>{t('Næste helligdag', 'Next public holiday')}</dt><dd>{next[language]} · {next.remaining} {t('dage', 'days')}</dd></div>
        <div><dt className="inline"><Sunrise size={16} />{t('Solopgang', 'Sunrise')}</dt><dd>{sun.sunrise}</dd></div>
        <div><dt className="inline"><Sunset size={16} />{t('Solnedgang', 'Sunset')}</dt><dd>{sun.sunset}</dd></div>
      </dl>
      <label>{t('By for soltider', 'City for sun times')}<select value={location} onChange={event => setLocation(+event.target.value)}>{cities.map((item, index) => <option key={item.name} value={index}>{t(item.name, item.en)}</option>)}</select></label>
      <h3>{t('Påmindelser', 'Reminders')}</h3>
      <ReminderList items={reminders.filter(item => item.date === key)} />
      {adding ? <ReminderForm date={key} onSave={() => setAdding(false)} /> : <button className="secondary fit" type="button" onClick={() => setAdding(true)}><Plus size={16} />{t('Ny påmindelse', 'New reminder')}</button>}
    </div>
  </Sheet>
}

