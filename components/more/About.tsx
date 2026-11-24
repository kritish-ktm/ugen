'use client'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { PageTitle } from '../ui/PageTitle'
import { usePreferences, UgenLink } from '../ui/Shell'

const sources = [
  ['DMI Frie Data', 'https://www.dmi.dk/friedata/'],
  ['Frankfurter', 'https://frankfurter.dev/v1/'],
  ['Rejseplan', 'https://www.rejseplan.dk/'],
  ['Dansk Kalender API', 'https://www.kalendarium.dk/'],
  ['Københavns Kommune', 'https://www.kk.dk/borger/dagtilbud-og-skole/skole-og-fritid/vejledende-ferieplan-for-skoleaaret-i-koebenhavns-kommune'],
]
export function About() {
  const { t } = usePreferences()
  return <>
    <PageTitle index={t('EN LILLE APP TIL DANMARK', 'A LITTLE APP FOR DENMARK')} title={t('Om Ugen', 'About Ugen')} description={t('Bygget omkring den danske uge.', 'Built around the Danish week.')} />
    <section className="card stack">
      <h2>{t('Din uge, samlet', 'Your week in one place')}</h2>
      <p className="muted">{t('Ugen samler kalender, helligdage, valuta, nyheder og rejser. Ugenumrene følger ISO 8601 med mandag som ugens første dag.', 'Ugen brings together your calendar, public holidays, currency, news and travel. Week numbers follow ISO 8601 with Monday as the first day.')}</p>
      <p className="muted">{t('Påmindelser, gemte ruter og indstillinger gemmes i din browser. Forespørgsler om rejser sendes til Rejseplan, når du søger.', 'Reminders, saved routes and preferences are stored in your browser. Trip details are sent to Rejseplan when you search.')}</p>
      <h3>{t('Datakilder', 'Data sources')}</h3>
      <div className="chip-row">{sources.map(([label, href]) => <a key={label} className="secondary" href={href}>{label}<ArrowUpRight size={14} /></a>)}</div>
      <UgenLink href="/mere" className="secondary fit"><ArrowLeft size={16} />{t('Tilbage til Mere', 'Back to More')}</UgenLink>
    </section>
  </>
}

