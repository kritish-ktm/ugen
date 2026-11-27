'use client'
import { usePreferences } from '../ui/Shell'

export function WeekExplainer() {
  const { t } = usePreferences()
  return <section className="card stack week-explainer" aria-labelledby="why-weeks">
    <span className="flag" aria-hidden="true" />
    <h2 id="why-weeks">{t('“Skal vi sige uge 7?”', '“Shall we say week 7?”')}</h2>
    <p>{t('I Danmark er ugenummeret en fælles genvej, når vi taler om skoleferier, aktiviteter og planer. Vinterferien ligger for eksempel ofte i uge 7 eller 8. Et ugenummer gør det let at tale om hele ugen, også når den går på tværs af to måneder.', 'In Denmark, week numbers are a familiar shorthand for school holidays, activities, and plans. Winter school holidays, for example, often fall in week 7 or 8. A week number makes it easy to refer to a whole week, even when it spans two months.')}</p>
    <div className="week-rule"><strong>{t('Mandag til søndag', 'Monday to Sunday')}</strong><p>{t('Ugen følger ISO-kalenderen: uge 1 indeholder årets første torsdag. Derfor har et år 52 eller 53 uger, og de første januardage kan høre til sidste års ugenummer.', 'Weeks follow the ISO calendar: week 1 contains the year’s first Thursday. A year has 52 or 53 weeks, and the first days of January can belong to the previous week-year.')}</p></div>
    <p className="muted small">{t('Læs mere:', 'Read more:')} <a className="text-link" href="https://www.visitdenmark.com/faq/school-holidays" target="_blank" rel="noopener noreferrer">VisitDenmark</a> · <a className="text-link" href="https://www.timeanddate.com/date/weeknumber-help.html" target="_blank" rel="noopener noreferrer">ISO {t('ugenumre', 'week numbers')}</a></p>
  </section>
}
