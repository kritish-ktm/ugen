'use client'
import { useEffect } from 'react'
import { useLocal } from './useLocal'
import { danishToday } from '../lib/iso-week'
import { emptyReminders } from '../lib/reminders'

export function useReminderAlerts() {
  const [enabled] = useLocal('ugen-notifications', false)
  const [reminders] = useLocal('ugen-reminders', emptyReminders)
  const reminderData = JSON.stringify(reminders)
  useEffect(() => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return
    const items = JSON.parse(reminderData) as typeof emptyReminders
    function tick() {
      const now = new Date()
      const date = danishToday(now)
      const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
      for (const reminder of items) {
        const marker = 'ugen-notified-' + reminder.id
        if (reminder.date !== date || reminder.time !== time) continue
        try {
          if (localStorage.getItem(marker)) continue
          localStorage.setItem(marker, date)
          if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.getRegistration().then(registration => {
              if (registration) return registration.showNotification(reminder.title, { body: reminder.notes, tag: reminder.id, icon: '/icon-192.png' })
              new Notification(reminder.title, { body: reminder.notes, tag: reminder.id })
            }).catch(() => {})
          } else new Notification(reminder.title, { body: reminder.notes, tag: reminder.id })
        } catch { /* Notifications may be disabled while Ugen is open. */ }
      }
    }
    tick()
    const timer = setInterval(tick, 15000)
    return () => clearInterval(timer)
  }, [enabled, reminderData])
}
