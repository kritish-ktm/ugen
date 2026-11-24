'use client'
import { Cloud, CloudRain, ExternalLink, Sun } from 'lucide-react'
import { useFeed } from '../../hooks/useFeed'
import { useLocal } from '../../hooks/useLocal'
import { cities } from '../../lib/sun'
import { languageTags } from '../../lib/i18n'
import type { Weather } from '../../lib/weather'
import { LoadingLines } from '../ui/LoadingLines'
import { usePreferences } from '../ui/Shell'

const conditionIcons = { sun: Sun, cloud: Cloud, rain: CloudRain }

export function useWeather() {
  const { online } = usePreferences()
  const [city, setCity] = useLocal('ugen-sun-city', 0)
  return { ...useFeed<Weather>('/api/weather?city=' + city, online), city, setCity }
}

export function WeatherCard() {
  const { t, language, online } = usePreferences()
  const { data, loading, cached, city, setCity, retry } = useWeather()
  const location = cities[city] ?? cities[0]
  const ConditionIcon = conditionIcons[data?.condition ?? 'cloud']
  const description = data && { sun: t('Klart', 'Clear'), cloud: t('Overskyet', 'Cloudy'), rain: t('Regn', 'Rain') }[data.condition]
  return <section className="card stack">
    <div className="between"><div><p className="card-label">DMI · {t('VEJRUDSIGT', 'FORECAST')}</p><h2>{t(location.name, location.en)}</h2></div><div className="summary-icon"><Cloud size={20} /></div></div>
    {data ? <div className="weather-data between">
      <div><strong>{data.temperature}°</strong><p>{description}</p><p className="muted small">{new Intl.DateTimeFormat(languageTags[language], { timeZone: 'Europe/Copenhagen', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(data.time))}{cached ? ' · ' + t('Gemt prognose', 'Cached forecast') : ''}</p></div>
      <ConditionIcon className="weather-symbol" size={72} strokeWidth={1.4} aria-hidden="true" />
    </div> : loading ? <div role="status" aria-label={t('Henter vejr', 'Loading weather')}><LoadingLines /></div> : <div className="between"><p className="muted small" role="status">{t('Vejrudsigten er ikke tilgængelig.', 'The forecast is unavailable.')}</p>{online && <button type="button" className="secondary" onClick={retry}>{t('Prøv igen', 'Retry')}</button>}</div>}
    <label>{t('By', 'City')}<select value={city} onChange={event => setCity(+event.target.value)}>{cities.map((item, i) => <option value={i} key={item.name}>{t(item.name, item.en)}</option>)}</select></label>
    <a className="secondary fit" href="https://www.dmi.dk/">{t('Åbn DMI', 'Open DMI')}<ExternalLink size={15} /></a>
  </section>
}
