'use client'
import { Bell, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useLocal } from '../../hooks/useLocal'
import { emptyReminders, type Reminder } from '../../lib/reminders'
import { usePreferences } from '../ui/Shell'

export function useReminders() { return useLocal('ugen-reminders', emptyReminders) }

export function ReminderList({ items, dates = false }: { items: Reminder[]; dates?: boolean }) {
  const [, setItems] = useReminders()
  const { t } = usePreferences()
  if (!items.length) return <p className="muted small inline"><Bell size={16} />{t('Ingen påmindelser endnu', 'No reminders yet')}</p>
  return <ul className="reminder-list">{[...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(item => <li className="between" key={item.id}>
    <div><strong>{item.title}</strong><p className="muted small">{[dates ? item.date : '', item.time, item.notes].filter(Boolean).join(' · ')}</p></div>
    <button type="button" className="icon-button" onClick={() => setItems(previous => previous.filter(value => value.id !== item.id))} aria-label={t('Slet ', 'Delete ') + item.title}><Trash2 size={16} /></button>
  </li>)}</ul>
}

export function ReminderForm({ date, onSave }: { date: string; onSave?: () => void }) {
  const { t } = usePreferences()
  const [, setItems] = useReminders()
  const [title, setTitle] = useState('')
  const [selected, setSelected] = useState(date)
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  return <form className="stack reminder-form" onSubmit={event => {
    event.preventDefault()
    if (!title.trim()) return
    setItems(previous => [...previous, { id: crypto.randomUUID(), title: title.trim(), date: selected, time, notes: notes.trim() }])
    setTitle(''); setNotes(''); setTime('')
    onSave?.()
  }}>
    <label>{t('Titel', 'Title')}<input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} /></label>
    <div className="form-grid">
      <label>{t('Dato', 'Date')}<input type="date" required value={selected} onChange={event => setSelected(event.target.value)} /></label>
      <label>{t('Tidspunkt', 'Time')}<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label>
    </div>
    <label>{t('Noter', 'Notes')}<textarea rows={2} maxLength={400} value={notes} onChange={event => setNotes(event.target.value)} /></label>
    <button type="submit" className="primary fit"><Plus size={16} />{t('Gem påmindelse', 'Save reminder')}</button>
  </form>
}
