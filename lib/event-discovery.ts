import { decodeHeadline } from './news-title.ts'
import type { DenmarkEvent } from './denmark-events.ts'

export type EventsData = { events: DenmarkEvent[]; checked: string; unavailable: string[] }
export function validEventDate(key: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  const date = new Date(key + 'T12:00:00Z')
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === key
}

export function discoverVega(html: string): DenmarkEvent[] {
  const events = new Map<string, DenmarkEvent>()
  for (const match of html.matchAll(/href="((?:\/beyond)?\/event\/([a-z0-9-]+)-(\d{4}-\d{2}-\d{2}))"/g)) {
    const [, path, slug, day] = match
    if (!validEventDate(day)) continue
    const name = slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
    events.set(path, { da: decodeHeadline(name) + ' · VEGA', en: decodeHeadline(name) + ' · VEGA', city: 'København', start: day, end: day, kind: path.includes('/beyond/') ? 'social' : 'concert', place: 'VEGA · se lokale og tidspunkt hos arrangøren', url: 'https://vega.dk' + path, discovered: true })
  }
  if (!events.size) throw new Error('Event source format changed')
  return [...events.values()]
}
