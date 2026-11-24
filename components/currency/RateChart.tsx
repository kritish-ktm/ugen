'use client'

import { useId, useState } from 'react'
import { type RatePoint } from '../../lib/currency'
import { languageTags } from '../../lib/i18n'
import { usePreferences } from '../ui/Shell'

const width = 320
const height = 144
const inset = 6
const bottom = height - inset

export function RateChart({ points, base, quote }: { points: RatePoint[]; base: string; quote: string }) {
  const { t, language } = usePreferences()
  const [active, setActive] = useState<number | null>(null)
  const gradient = useId()
  const locale = languageTags[language]
  const number = new Intl.NumberFormat(locale, { maximumSignificantDigits: 8 })
  const percentage = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero' })
  const shortDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const values = points.map(point => base === 'DKK' ? point.rate : 1 / point.rate)
  const first = values[0]
  const last = values.length - 1
  const current = Math.min(active ?? last, last)
  const low = Math.min(...values), high = Math.max(...values)
  const margin = Math.max((high - low) * .12, high * .000005)
  const floor = Math.max(0, low - margin), ceiling = high + margin
  const x = (index: number) => last ? inset + (width - 2 * inset) * index / last : width / 2
  const y = (value: number) => bottom - (bottom - inset) * (value - floor) / (ceiling - floor)
  const trace = values.map((value, index) => x(index) + ',' + y(value)).join(' ')
  const ticks = [ceiling, (ceiling + floor) / 2, floor]
  const valueLabel = points[current].date + ' · ' + number.format(values[current]) + ' ' + quote +
    (points[current].carried ? t(' · senest kendte kurs', ' · last known rate') : '')
  const change = values[last] / first - 1

  function select(clientX: number, chart: SVGSVGElement) {
    const box = chart.getBoundingClientRect()
    const position = (clientX - box.left) / box.width * width
    setActive(Math.max(0, Math.min(last, Math.round((position - inset) / (width - 2 * inset) * last))))
  }

  return <>
    <div className="rate-summary between">
      <p className="muted small">1 {base} → {quote}</p>
      {last > 0 && <p className="rate-change"><strong>{percentage.format(change)}</strong> {t('i perioden', 'over the period')}</p>}
    </div>
    <p className="rate-tooltip">{valueLabel}</p>
    <div className="rate-figure">
      <div className="rate-axis" aria-hidden="true">{ticks.map(value => <span key={value}>{number.format(value)}</span>)}</div>
      <svg className="rate-chart" role="img" aria-label={t('Kurshistorik for ', 'Exchange rate history for ') + base + ' / ' + quote}
        viewBox={'0 0 ' + width + ' ' + height} preserveAspectRatio="none"
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId)
          select(event.clientX, event.currentTarget)
        }}
        onPointerMove={event => {
          if (event.pointerType === 'mouse' || event.currentTarget.hasPointerCapture(event.pointerId)) select(event.clientX, event.currentTarget)
        }}>
        <defs><linearGradient id={gradient} x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".17" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient></defs>
        {ticks.map(value => <line key={value} className="rate-gridline" x1={inset} x2={width - inset} y1={y(value)} y2={y(value)} />)}
        <polygon points={x(0) + ',' + bottom + ' ' + trace + ' ' + x(last) + ',' + bottom} fill={'url(#' + gradient + ')'} />
        <polyline className="rate-line" points={trace} />
        <line className="rate-guide" x1={x(current)} x2={x(current)} y1={inset} y2={bottom} />
        <circle className="rate-point" cx={x(current)} cy={y(values[current])} r="4" />
      </svg>
      <div className="rate-dates between" aria-hidden="true">
        <span>{shortDate.format(new Date(points[0].date))}</span>
        {last > 0 && <span>{shortDate.format(new Date(points[last].date))}</span>}
      </div>
    </div>
    {last > 0 && <label className="muted small">{t('Undersøg kurs pr. dag', 'Explore rate by day')}<input type="range" min={0} max={last} value={current} aria-valuetext={valueLabel} onChange={event => setActive(+event.target.value)} /></label>}
  </>
}
