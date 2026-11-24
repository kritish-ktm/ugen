'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, CalendarDays, CloudSun, Coins, Flag, Pause, Play } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { useFeed } from '../../hooks/useFeed'
import type { RateData } from '../../lib/currency'
import { nextHoliday } from '../../lib/holidays'
import { danishToday, fromDateKey, isoWeek } from '../../lib/iso-week'
import { locales } from '../../lib/i18n'
import { Sheet } from '../ui/Sheet'
import { usePreferences } from '../ui/Shell'
import { useWeather } from '../more/WeatherCard'

const topics = [
  { da: 'Vejr', en: 'Weather', icon: CloudSun },
  { da: 'Ugen', en: 'Week', icon: CalendarDays },
  { da: 'Valuta', en: 'Currency', icon: Coins },
  { da: 'Helligdage', en: 'Holidays', icon: Flag },
]
const duration = 6500

export function Stories() {
  const { t } = usePreferences()
  const [index, setIndex] = useState<number | null>(null)
  const close = useCallback(() => setIndex(null), [])
  return <>
    <section className="card stack"><div><p className="card-label">{t('KORTE GLIMT', 'QUICK LOOK')}</p><h2>{t('Historier', 'Stories')}</h2></div>
      <div className="stories">{topics.map(({ da, en, icon: Icon }, i) => <button type="button" key={da} className="story-avatar" onClick={() => setIndex(i)}>
        <span className="story-icon"><Icon size={23} strokeWidth={1.7} /></span><span>{t(da, en)}</span>
      </button>)}</div>
    </section>
    {index !== null && <StoryViewer index={index} setIndex={setIndex} onClose={close} />}
  </>
}

function StoryViewer({ index, setIndex, onClose }: { index: number; setIndex: (index: number) => void; onClose: () => void }) {
  const { t, language, online } = usePreferences()
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const startY = useRef(0)
  const story = topics[index]
  const StoryIcon = story.icon
  const { data: forecast } = useWeather()
  const { data: rates } = useFeed<RateData>('/api/rates?currency=EUR', online)
  const today = fromDateKey(danishToday())
  const next = nextHoliday(today)
  const values = [
    forecast ? forecast.temperature + '°C' : '—',
    t('Uge ', 'Week ') + isoWeek(today).week,
    rates ? '100 DKK ≈ ' + new Intl.NumberFormat(language, { style: 'currency', currency: 'EUR' }).format(100 * rates.rate) : '—',
    next[language],
  ]
  const detail = [
    forecast ? t('Prognose fra DMI', 'Forecast from DMI') : t('Ingen prognose tilgængelig', 'Forecast unavailable'),
    format(today, 'EEEE d. MMMM', { locale: locales[language] }),
    rates ? 'ECB · ' + rates.date : t('Ingen valutakurs tilgængelig', 'Exchange rate unavailable'),
    format(next.date, 'd. MMMM', { locale: locales[language] }) + ' · ' + next.remaining + ' ' + t('dage', 'days'),
  ]
  const advance = () => index === topics.length - 1 ? onClose() : setIndex(index + 1)
  useEffect(() => {
    if (paused || reduced) return
    const timeout = setTimeout(() => index === topics.length - 1 ? onClose() : setIndex(index + 1), duration)
    return () => clearTimeout(timeout)
  }, [index, paused, reduced, onClose, setIndex])
  return <Sheet full title={t(story.da, story.en)} onClose={onClose}>
    <div className="story-progress" aria-hidden>{topics.map((topic, i) => <span key={topic.da}><i key={index + '-' + i + '-' + paused} className={i < index ? 'complete' : i === index && !paused && !reduced ? 'playing' : ''} /></span>)}</div>
    <button className="story-slide" type="button" onClick={advance} onTouchStart={event => { startY.current = event.touches[0].clientY }} onTouchEnd={event => {
      if (event.changedTouches[0].clientY - startY.current > 70) { event.preventDefault(); onClose() }
    }} aria-label={values[index] + '. ' + detail[index] + '. ' + t('Næste historie', 'Next story')}>
      <span className="story-art" aria-hidden="true"><StoryIcon size={68} strokeWidth={1.4} /></span>
      <strong>{values[index]}</strong><span>{detail[index]}</span>
    </button>
    <div className="between">
      <button className="icon-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label={t('Forrige historie', 'Previous story')}><ArrowLeft size={18} /></button>
      {!reduced && <button className="icon-button" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? t('Afspil', 'Play') : t('Pause', 'Pause')}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>}
      <button className="icon-button" type="button" onClick={advance} aria-label={t('Fortsæt', 'Continue')}><ArrowRight size={18} /></button>
    </div>
  </Sheet>
}
