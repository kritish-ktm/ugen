'use client'
import { useEffect, useState } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'
import { ArrowDownUp, ArrowUpRight, ChevronDown, Coins, Delete, Info, RefreshCw, Star } from 'lucide-react'
import { useFeed } from '../../hooks/useFeed'
import { useLocal } from '../../hooks/useLocal'
import { amountValue, convert, currencies, type CurrencyCode, type RateData } from '../../lib/currency'
import { languageTags } from '../../lib/i18n'
import { LoadingLines } from '../ui/LoadingLines'
import { RateChart } from './RateChart'
import { PageTitle } from '../ui/PageTitle'
import { Sheet } from '../ui/Sheet'
import { usePreferences } from '../ui/Shell'

const defaults: CurrencyCode[] = ['EUR', 'USD', 'GBP', 'SEK', 'NOK']
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete']

function AnimatedValue({ value, locale }: { value: number; locale: string }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (reduced) return
    const controls = animate(shown, value, { type: 'spring', stiffness: 300, damping: 30, onUpdate: setShown })
    return () => controls.stop()
    // The previous animated value is only the start of the next animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced])
  return <span>{new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reduced ? value : Math.max(0, shown))}</span>
}

export function Converter() {
  const { language, t, online } = usePreferences()
  const [code, setCode] = useLocal<CurrencyCode>('ugen-currency', 'EUR')
  const [favorites, setFavorites] = useLocal('ugen-favorite-currencies', defaults)
  const [reverse, setReverse] = useState(false)
  const [amount, setAmount] = useState('100')
  const [picker, setPicker] = useState(false)
  const [search, setSearch] = useState('')
  const locale = languageTags[language]
  const names = new Intl.DisplayNames([locale], { type: 'currency' })
  const { data, loading, cached, error, retry } = useFeed<RateData>('/api/rates?currency=' + code, online, 5 * 60 * 1000)
  const converted = data ? convert(amountValue(amount), data.rate, reverse) : null
  const flag = currencies.find(([value]) => value === code)?.[1]
  const inputCode = reverse ? code : 'DKK'
  const outputCode = reverse ? 'DKK' : code
  const separator = language === 'da' ? ',' : '.'
  const updated = data && new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' }).format(new Date(data.updated))
  function press(key: string) {
    navigator.vibrate?.(8)
    if (key === 'delete') setAmount(amount.slice(0, -1))
    else if (key === '.' && !amount.includes('.')) setAmount((amount || '0') + '.')
    else if (key !== '.' && amount.length < 12) setAmount(amount === '0' ? key : amount + key)
  }
  const currencyButton = <button type="button" className="secondary" onClick={() => { setSearch(''); setPicker(true) }} aria-label={t('Vælg valuta', 'Choose currency') + ' · ' + code}><span aria-hidden>{flag}</span>{code}<ChevronDown size={15} /></button>
  return <>
    <PageTitle index={t('PENGE', 'MONEY')} title={t('Valuta', 'Currency')} description={t('Fra danske kroner til resten af verden.', 'From Danish kroner to the rest of the world.')} />
    <div className="dashboard currency-dashboard">
      <section className="card stack" aria-label={t('Valutaomregner', 'Currency converter')}>
        <div className="between"><div><p className="card-label">{t('OMREGNER', 'CONVERTER')}</p><h2>{t('Beregn beløb', 'Convert an amount')}</h2></div><div className="summary-icon"><Coins size={21} /></div></div>
        <div className="currency-field"><div><label htmlFor="amount">{t('Du sender', 'You send')} · {inputCode}</label><input id="amount" type="text" inputMode="decimal" value={amount.replace('.', separator)} onChange={event => {
          const next = event.target.value.replace(',', '.')
          if (/^\d{0,10}(\.\d{0,6})?$/.test(next)) setAmount(next)
        }} /></div>{reverse ? currencyButton : <span className="currency-code"><span className="flag" aria-hidden />DKK</span>}</div>
        <motion.button type="button" className="icon-button swap-button" onClick={() => {
          if (converted !== null && converted < 1e10) setAmount(String(+converted.toFixed(4)))
          setReverse(!reverse)
        }} aria-label={t('Byt valutaer', 'Swap currencies')}><motion.span animate={{ rotate: reverse ? 180 : 0 }}><ArrowDownUp size={19} /></motion.span></motion.button>
        <div className="currency-field"><div><p className="muted small">{t('Du får', 'You receive')} · {outputCode}</p><output aria-live="off" aria-label={t('Omregnet beløb', 'Converted amount')}>{converted === null ? '—' : <AnimatedValue value={converted} locale={locale} />}</output></div>{reverse ? <span className="currency-code"><span className="flag" aria-hidden />DKK</span> : currencyButton}</div>
        <div className="chip-row">{[100, 500, 1000].map(value => <button key={value} type="button" className="chip" onClick={() => setAmount(String(value))}>{new Intl.NumberFormat(locale, { useGrouping: 'always' }).format(value)}</button>)}</div>
        <div className="keypad" role="group" aria-label={t('Taltastatur', 'Numeric keypad')}>{keys.map(key => <motion.button key={key} whileTap={{ scale: .94 }} type="button" className="secondary" onClick={() => press(key)} aria-label={key === 'delete' ? t('Slet ciffer', 'Delete digit') : undefined}>{key === 'delete' ? <Delete size={20} /> : key === '.' ? separator : key}</motion.button>)}</div>
        {updated && <p className="muted small">{t('Opdateret kl.', 'Updated at')} {updated} · {data?.date}{cached ? ' · ' + t('Gemt kurs', 'Cached rate') : ''}</p>}
        {error && <div className="inline"><p className="muted small" role="status">{t('Nye kurser er ikke tilgængelige.', 'Fresh rates are unavailable.')}</p>{online && <button className="secondary" type="button" onClick={retry}>{t('Prøv igen', 'Retry')}</button>}</div>}
      </section>
      <aside className="stack">
        <section className="card stack"><div className="between"><div><p className="card-label">{t('KURSUDVIKLING', 'RATE HISTORY')}</p><h2>{t('Seneste 30 dage', 'Last 30 days')}</h2></div><div className="summary-icon"><ArrowUpRight size={20} /></div></div>
          {data?.history.length ? <RateChart key={code} points={data.history} base={inputCode} quote={outputCode} /> : loading ? <div role="status" aria-label={t('Henter kurser', 'Loading rates')}><LoadingLines /></div> : <p className="muted small">{t('Kurshistorikken er ikke tilgængelig.', 'Rate history is unavailable.')}</p>}
          <div className="between rate-source">
            <p className="muted small">{t('Daglige ECB-referencekurser via Frankfurter.', 'Daily ECB reference rates via Frankfurter.')}</p>
            <button className="icon-button" type="button" aria-label={t('Opdater kurser', 'Refresh rates')} disabled={!online || loading} onClick={retry}><RefreshCw size={16} /></button>
          </div>
        </section>
        <section className="card stack"><div className="inline"><Info size={19} /><h3>{t('Kronen og euroen', 'The krone and the euro')}</h3></div><p className="muted small">{t('Kronen er knyttet til euroen med en centralkurs på ca. 7,46 DKK pr. EUR i ERM II.', 'The Danish krone is pegged to the euro at a central rate of about 7.46 DKK per EUR in ERM II.')}</p><a className="secondary fit" href="https://www.nationalbanken.dk/da/ofte-stillede-spoergsmaal/spoergsmaal-om-fastkurspolitik">{t('Læs hos Nationalbanken', 'Read at Danmarks Nationalbank')}<ArrowUpRight size={15} /></a></section>
      </aside>
    </div>
    {picker && <Sheet title={t('Vælg valuta', 'Choose currency')} onClose={() => setPicker(false)}>
      <div className="stack"><label>{t('Søg efter valuta', 'Search currencies')}<input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <div className="chip-row" role="group" aria-label={t('Favoritter', 'Favorites')}>{favorites.map(value => <button type="button" className="chip" key={value} onClick={() => { setCode(value); setPicker(false) }}>{value}</button>)}</div>
        <ul className="currency-picker">{currencies.filter(([value]) => (value + ' ' + names.of(value)).toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale))).map(([value, icon]) => <li className="between" key={value}>
          <button type="button" className="currency-option" onClick={() => { setCode(value); setPicker(false) }}><span aria-hidden>{icon}</span><strong>{value}</strong><span className="muted">{names.of(value)}</span></button>
          <button type="button" className="icon-button" aria-label={t('Favorit ', 'Favorite ') + value} aria-pressed={favorites.includes(value)} onClick={() => setFavorites(items => items.includes(value) ? items.filter(item => item !== value) : [...items, value])}><Star size={17} fill={favorites.includes(value) ? 'currentColor' : 'none'} /></button>
        </li>)}</ul>
      </div>
    </Sheet>}
  </>
}
