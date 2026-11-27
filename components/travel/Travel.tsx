'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownUp, ArrowUpRight, BriefcaseBusiness, Home, MapPin, TrainFront } from 'lucide-react'
import { useLocal } from '../../hooks/useLocal'
import { danishToday } from '../../lib/iso-week'
import { demoJourney, travelLink, type Journey, type JourneyInput, type TravelResponse } from '../../lib/travel'
import { LoadingLines } from '../ui/LoadingLines'
import { PageTitle } from '../ui/PageTitle'
import { usePreferences } from '../ui/Shell'
import { DanishTransport } from './DanishTransport'

const initial = { from: '', to: '', date: '', time: '' }
const savedRoutes: Record<string, JourneyInput> = {}

function clock() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date())
}

export function Travel() {
  const { t, language, online } = usePreferences()
  const [form, setForm] = useState<JourneyInput>(initial)
  const [saved, setSaved] = useLocal('ugen-saved-routes', savedRoutes)
  const [swaps, setSwaps] = useState(0)
  const [result, setResult] = useState<{ query: JourneyInput; response?: TravelResponse } | null>(null)
  const [demo, setDemo] = useState(false)
  const pending = useRef<AbortController | null>(null)
  useEffect(() => () => pending.current?.abort(), [])

  const complete = () => ({ ...form, from: form.from.trim(), to: form.to.trim(), date: form.date || danishToday(), time: form.time || clock() })
  const canSearch = Boolean(form.from.trim() && form.to.trim() && form.from.trim().toLowerCase() !== form.to.trim().toLowerCase())
  const update = (field: keyof JourneyInput, value: string) => setForm({ ...form, [field]: value })

  async function search() {
    if (!canSearch) return
    const query = complete()
    pending.current?.abort()
    const abort = new AbortController()
    pending.current = abort
    setDemo(false)
    setResult({ query })
    let response: TravelResponse = { kind: 'fallback', journeys: [] }
    try {
      if (online) {
        const fetched = await fetch('/api/travel?' + new URLSearchParams(query), { signal: abort.signal })
        if (fetched.ok) response = await fetched.json()
      }
    } catch { /* The official link is still available. */ }
    if (!abort.signal.aborted) setResult({ query, response })
  }

  return <>
    <PageTitle index={t('PÅ VEJ', 'ON THE MOVE')} title={t('Rejse', 'Travel')} description={t('Fra A til B med offentlig transport.', 'Get from A to B by public transport.')} />
    <DanishTransport />
    <div className="dashboard">
      <section className="card stack"><div className="between"><div><p className="card-label">{t('REJSEPLAN', 'JOURNEY PLAN')}</p><h2>{t('Hvor skal du hen?', 'Where are you going?')}</h2></div><div className="summary-icon"><TrainFront size={21} /></div></div>
        <form className="stack" onSubmit={event => { event.preventDefault(); void search() }}>
          <div className="travel-fields">
            <label>{t('Fra', 'From')}<input required maxLength={120} placeholder={t('Station eller adresse', 'Station or address')} value={form.from} onChange={event => update('from', event.target.value)} /></label>
            <label>{t('Til', 'To')}<input required maxLength={120} placeholder={t('Station eller adresse', 'Station or address')} value={form.to} onChange={event => update('to', event.target.value)} /></label>
            <motion.button type="button" className="icon-button travel-swap" onClick={() => { setForm({ ...form, from: form.to, to: form.from }); setSwaps(swaps + 1) }} aria-label={t('Byt fra og til', 'Swap origin and destination')}><motion.span animate={{ rotate: swaps * 180 }}><ArrowDownUp size={18} /></motion.span></motion.button>
          </div>
          <div className="form-grid"><label>{t('Afrejsedato', 'Departure date')}<input type="date" value={form.date} onChange={event => update('date', event.target.value)} /></label><label>{t('Afrejsetid', 'Departure time')}<input type="time" value={form.time} onChange={event => update('time', event.target.value)} /></label></div>
          <p className="muted small">{t('Udfyld dato og tid for en senere afgang. Ellers søger vi fra nu.', 'Enter a date and time for a later departure. Otherwise, search from now.')}</p>
          <button type="submit" className="primary fit" disabled={!canSearch}><TrainFront size={16} />{t('Find rejse', 'Find journey')}</button>
        </form>
      </section>
      <section className="card stack"><div><p className="card-label">{t('GENVEJE', 'SHORTCUTS')}</p><h2>{t('Gemte ruter', 'Saved routes')}</h2></div>
        {([['home', 'Hjem', 'Home', Home], ['work', 'Arbejde', 'Work', BriefcaseBusiness]] as const).map(([id, da, en, Icon]) => {
          return <div className="saved-route stack" key={id}>
            <h3 className="inline"><Icon size={17} />{t(da, en)}</h3>
            {saved[id] && <p className="muted small">{saved[id].from} → {saved[id].to}</p>}
            <div className="chip-row">
              {saved[id] && <button className="secondary" type="button" onClick={() => setForm({ ...saved[id], date: '', time: '' })}>{t('Brug rute', 'Use route')}</button>}
              <button className="secondary" type="button" disabled={!canSearch} onClick={() => setSaved(items => ({ ...items, [id]: complete() }))}>{saved[id] ? t('Overskriv', 'Replace') : t('Gem rute', 'Save route')}</button>
            </div>
          </div>
        })}
      </section>
    </div>
    <section className="card stack travel-results" aria-label={t('Rejseresultater', 'Journey results')}>
      <h2>{t('Rejseresultater', 'Journey results')}</h2>
      {result && !result.response ? <div role="status" aria-label={t('Finder rejser', 'Finding journeys')}><LoadingLines /></div> : result?.response ? <>
        {result.response.kind === 'fallback' ? <p className="muted">{t('Se aktuelle forbindelser på Rejseplan med din rute udfyldt.', 'See current connections on Rejseplan with your route prefilled.')}</p> : !result.response.journeys.length ? <p className="muted">{t('Ingen forbindelser fundet.', 'No connections found.')}</p> : result.response.journeys.map((journey, i) => <Timeline key={i} journey={journey} />)}
        <a className="primary fit" href={travelLink(result.query, language)} target="_blank" rel="noopener noreferrer">{t('Åbn Rejseplan', 'Open Rejseplan')}<ArrowUpRight size={16} /></a>
      </> : <p className="empty"><MapPin size={21} />{t('Indtast din rute for at finde forbindelser.', 'Enter your route to find connections.')}</p>}
      {demo ? <div className="stack"><p className="notice">{t('Eksempel · fiktive afgange', 'Example · fictional departures')}</p><Timeline journey={demoJourney} /></div> : <button className="secondary fit" type="button" onClick={() => setDemo(true)}>{t('Se eksempel', 'See example')}</button>}
    </section>
  </>
}

function Timeline({ journey }: { journey: Journey }) {
  const { t } = usePreferences()
  const duration = journey.duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/)
  return <div className="timeline stack">
    {duration && <p className="card-label">{[duration[1] && duration[1] + ' t', duration[2] && duration[2] + ' min'].filter(Boolean).join(' ')}</p>}
    <ol>{journey.legs.map((leg, i) => <li key={i}>
      <span className="line-badge">{leg.line === 'WALK' ? t('Gang', 'Walk') : leg.line}</span>
      <div><strong>{leg.departure} · {leg.from}</strong><p className="muted small">{leg.arrival} · {leg.to}</p></div>
    </li>)}</ol>
  </div>
}




