'use client'
import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { usePreferences } from '../ui/Shell'

function Train({ intercity = false }: { intercity?: boolean }) {
  return <svg viewBox="0 0 520 105" fill="none" aria-hidden="true" focusable="false">
    <g className={intercity ? 'vehicle-intercity' : 'vehicle-stog'}>
      {[12, 170, 328].map((x, index) => <g key={x}>
        <path d={index === 2 ? `M${x} 27H470Q495 27 501 48L507 73Q508 83 498 83H${x}Z` : `M${x+9} 27H${x+143}Q${x+150} 27 ${x+150} 35V83H${x}V37Q${x} 27 ${x+9} 27Z`} className="vehicle-body" />
        <path d={`M${x} 67H${index===2 ? 504 : x+150}V76H${x}Z`} className="vehicle-stripe" />
        {[x+14,x+43,x+105].map(window => <rect key={window} x={window} y="35" width="24" height="23" rx="4" className="vehicle-window" />)}
        <rect x={x+75} y="32" width="23" height="47" rx="3" className="vehicle-door" />
        <path d={`M${x+86.5} 33V78`} stroke="currentColor" strokeOpacity=".35" />
        <rect x={x+79} y="37" width="15" height="20" rx="2" className="vehicle-window" />
        <rect x={x+14} y="81" width="115" height="5" rx="2" fill="#383b3e" />
        {[x+30,x+118].map(wheel => <g key={wheel}><circle cx={wheel} cy="87" r="8" fill="#282d32" /><circle cx={wheel} cy="87" r="3" fill="#a7acaf" /></g>)}
      </g>)}
      {[163,321].map(x=><rect key={x} x={x} y="34" width="6" height="45" rx="2" fill="#36393c" />)}
      <path d="M472 34Q489 35 494 51H473Z" className="vehicle-window" />
      <rect x="495" y="67" width="7" height="5" rx="2" fill="#fff1bd" />
      {!intercity && <><path d="M207 25L218 12H247L234 25M218 12L233 24" stroke="#59616a" strokeWidth="2" /><path d="M215 10H251" stroke="#59616a" strokeWidth="2" /><circle cx="451" cy="69" r="7" fill="#fff5ed" /><text x="451" y="72.5" textAnchor="middle" fill="#bd1631" fontSize="10" fontWeight="800" fontFamily="Arial, sans-serif">S</text></>}
      {intercity && <text x="452" y="71" textAnchor="middle" fill="#fff5ed" fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">IC</text>}
    </g>
  </svg>
}

function CityBus() {
  return <svg viewBox="0 0 310 105" fill="none" aria-hidden="true" focusable="false">
    <path d="M20 25H270Q287 25 289 43L293 78Q293 85 285 85H17Q10 85 10 78V36Q10 25 20 25Z" fill="#edbe39" />
    <rect x="19" y="31" width="255" height="33" rx="5" fill="#253c49" />
    {[26,66,106,146,186].map(x=><path key={x} d={`M${x} 33V62`} stroke="#eac758" strokeWidth="3" />)}
    <path d="M270 31Q282 34 283 51L285 63H265V31Z" fill="#314e5c" />
    <rect x="224" y="32" width="33" height="49" rx="2" fill="#344149" />
    <path d="M240 33V80" stroke="#bfced2" strokeWidth="1.5" />
    <rect x="227" y="35" width="27" height="24" rx="2" fill="#6f8e9c" />
    <path d="M11 73H220M260 73H291" stroke="#d1a029" strokeWidth="3" />
    <rect x="26" y="19" width="175" height="6" rx="3" fill="#c3c8c6" />
    <rect x="264" y="25" width="18" height="9" rx="2" fill="#1d2c35" />
    <rect x="285" y="67" width="7" height="5" rx="2" fill="#fff4c1" />
    {[57,259].map(x=><g key={x}><circle cx={x} cy="85" r="11" fill="#252b30" /><circle cx={x} cy="85" r="5" fill="#b3babd" /><circle cx={x} cy="85" r="2" fill="#65717a" /></g>)}
  </svg>
}

export function DanishTransport() {
  const { t } = usePreferences()
  const [paused, setPaused] = useState(false)
  return <section className="transport-scene" data-paused={paused} aria-label={t('Dansk transport i bevægelse', 'Danish transport in motion')}>
    <div className="transport-caption"><span>{t('Næste stop: din destination', 'Next stop: your destination')}</span><button type="button" className="transport-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)} aria-label={paused ? t('Afspil transportanimation', 'Play transport animation') : t('Sæt transportanimation på pause', 'Pause transport animation')}>{paused ? <Play size={14} /> : <Pause size={14} />}<span>{paused ? t('Afspil', 'Play') : t('Pause', 'Pause')}</span></button></div>
    <div className="transport-stage" aria-hidden="true">
      <div className="transport-skyline"><i /><i /><i /><i /><i /></div>
      <div className="transport-runner transport-s-train"><Train /></div>
      <div className="transport-runner transport-ic-train"><Train intercity /></div>
      <div className="transport-runner transport-city-bus"><CityBus /></div>
      <div className="transport-track" />
    </div>
  </section>
}
