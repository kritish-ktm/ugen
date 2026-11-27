'use client'
import { useState } from 'react'
import { addDays, addWeeks, format, startOfISOWeek } from 'date-fns'
import { ArrowRight, Bell, CalendarRange, ChevronLeft, ChevronRight, Download, Plus, Settings } from 'lucide-react'
import { useLocal } from '../../hooks/useLocal'
import { dateKey } from '../../lib/holidays'
import { danishToday, fromDateKey, isoWeek } from '../../lib/iso-week'
import { capitalize, locales } from '../../lib/i18n'
import { ReminderForm, ReminderList, useReminders } from '../calendar/Reminders'
import { PageTitle } from '../ui/PageTitle'
import { Sheet } from '../ui/Sheet'
import { usePreferences, UgenLink } from '../ui/Shell'
import { WeatherCard } from './WeatherCard'
import { ShoppingTeaser } from '../shopping/Supermarkets'
import { EventsTeaser } from '../events/EventsExplorer'
import { DirectoryTeaser } from '../directory/CompanyDirectory'

export function More() {
  const { t, language, setLanguage, theme, setTheme, install } = usePreferences()
  const [week, setWeek] = useState(0)
  const [reminderDate, setReminderDate] = useState<string | null>(null)
  const [reminders] = useReminders()
  const [notifications, setNotifications] = useLocal('ugen-notifications', false)
  const [status, setStatus] = useState('')
  const [installHelp, setInstallHelp] = useState(false)
  const [today, setToday] = useState<string | null>(null)
  const [showPlanner, setShowPlanner] = useState(false)
  const start = today ? addWeeks(startOfISOWeek(fromDateKey(today)), week) : null
  async function toggleNotifications() {
    if (notifications) { setNotifications(false); setStatus(''); return }
    if (!('Notification' in window)) { setStatus(t('Browseren understøtter ikke notifikationer.', 'This browser does not support notifications.')); return }
    try {
      const permission = await Notification.requestPermission()
      setNotifications(permission === 'granted')
      setStatus(permission === 'granted' ? t('Notifikationer er aktiveret.', 'Notifications enabled.') : t('Tillad notifikationer i browseren.', 'Allow notifications in your browser.'))
    } catch { setStatus(t('Notifikationer er ikke tilgængelige.', 'Notifications are unavailable.')) }
  }
  function togglePlanner() {
    setToday(danishToday())
    setShowPlanner(!showPlanner)
  }
  return <>
    <PageTitle index={t('DIN HVERDAG', 'YOUR EVERYDAY')} title={t('Mere', 'More')} description={t('Små værktøjer og indstillinger til din uge.', 'Little tools and settings for your week.')} />
    <div className="dashboard">
      <div className="stack">
        <WeatherCard />
        <ShoppingTeaser />
        <EventsTeaser />
        <DirectoryTeaser />
        <section className="card stack"><div className="between"><div><p className="card-label">{t('PLANLÆGNING', 'PLANNING')}</p><h2>{t('Ugeplan', 'Weekly planner')}</h2></div><div className="summary-icon"><CalendarRange size={19} /></div></div>
          <button type="button" className="secondary fit" onClick={togglePlanner} aria-expanded={showPlanner}>{showPlanner ? t('Skjul ugeplan', 'Hide weekly planner') : t('Åbn ugeplan', 'Open weekly planner')}</button>
          {start && showPlanner && <>
            <div className="between"><strong>{t('Uge ', 'Week ')}{isoWeek(start).week} · {isoWeek(start).year}</strong><div className="inline">
              <button type="button" className="icon-button" aria-label={t('Forrige uge', 'Previous week')} onClick={() => setWeek(week - 1)}><ChevronLeft size={18} /></button>
              <button type="button" className="icon-button" aria-label={t('Næste uge', 'Next week')} onClick={() => setWeek(week + 1)}><ChevronRight size={18} /></button>
            </div></div>
            <ul className="planner">{Array.from({ length: 7 }, (_, i) => {
              const date = addDays(start, i)
              const key = dateKey(date)
              const label = capitalize(format(date, 'EEEE d. MMM', { locale: locales[language] }))
              const entries = reminders.filter(item => item.date === key)
              return <li key={key}><div className="between"><strong>{label}</strong><button type="button" className="icon-button" aria-label={t('Tilføj påmindelse ', 'Add reminder ') + label} onClick={() => setReminderDate(key)}><Plus size={16} /></button></div>{entries.length > 0 && <ReminderList items={entries} />}</li>
            })}</ul>
          </>}
        </section>
        <section className="card stack"><div className="between"><div><p className="card-label">{t('HUSK DET', 'REMEMBER IT')}</p><h2>{t('Påmindelser', 'Reminders')}</h2></div><div className="summary-icon"><Bell size={19} /></div></div><ReminderList items={reminders} dates /><button type="button" className="secondary fit" onClick={() => setReminderDate(danishToday())}><Plus size={16} />{t('Ny påmindelse', 'New reminder')}</button></section>
      </div>
      <aside className="stack">
        <section className="card stack">
          <div className="between"><div><p className="card-label">{t('TILPAS UGEN', 'MAKE IT YOURS')}</p><h2>{t('Indstillinger', 'Settings')}</h2></div><div className="summary-icon"><Settings size={19} /></div></div>
          <label>{t('Sprog', 'Language')}<select value={language} onChange={event => setLanguage(event.target.value === 'en' ? 'en' : 'da')}><option value="da">Dansk</option><option value="en">English</option></select></label>
          <label>{t('Farvetema', 'Theme')}<select aria-label={t('Farvetema', 'Theme')} value={theme} onChange={event => {
            const value = event.target.value
            setTheme(value === 'dark' || value === 'light' ? value : 'system')
          }}><option value="system">{t('Følg systemet', 'Use system theme')}</option><option value="light">{t('Lys', 'Light')}</option><option value="dark">{t('Mørk', 'Dark')}</option></select></label>
          <div className="stack"><button className="secondary fit" type="button" aria-pressed={notifications} onClick={() => void toggleNotifications()}><Bell size={16} />{t('Notifikationer', 'Notifications')} · {notifications ? t('Til', 'On') : t('Fra', 'Off')}</button><p className="muted small">{t('Tidsbestemte påmindelser vises, mens Ugen er åben.', 'Timed reminders appear while Ugen is open.')}</p>{status && <p className="muted small" role="status">{status}</p>}</div>
        </section>
        <section className="card stack"><div><p className="card-label">{t('PÅ DIN ENHED', 'ON YOUR DEVICE')}</p><h2>{t('Ugen som app', 'Ugen as an app')}</h2></div>
          <p className="muted small">{t('Åbn kalenderen fra din hjemmeskærm, også offline.', 'Open the calendar from your home screen, even offline.')}</p>
          <button type="button" className="secondary fit" onClick={() => {
            if (install) void install.prompt().catch(() => setInstallHelp(true))
            else setInstallHelp(true)
          }}><Download size={17} />{t('Installér app', 'Install app')}</button>
          {installHelp && <p className="muted small" role="status">{t('Brug browserens menu til at installere Ugen eller føje den til hjemmeskærmen.', 'Use the browser menu to install Ugen or add it to your home screen.')}</p>}
          <UgenLink className="secondary fit" href="/mere/om">{t('Om Ugen', 'About Ugen')}<ArrowRight size={15} /></UgenLink>
        </section>
      </aside>
    </div>
    {reminderDate && <Sheet title={t('Ny påmindelse', 'New reminder')} onClose={() => setReminderDate(null)}><ReminderForm date={reminderDate} onSave={() => setReminderDate(null)} /></Sheet>}
  </>
}




