import { connection } from 'next/server'
import type { Metadata } from 'next'
import { EventsExplorer } from '../../../components/events/EventsExplorer'
import { danishToday } from '../../../lib/iso-week'
export const metadata: Metadata = { title: 'Oplevelser & søndagsmarkeder' }
export default async function EventsPage() {
  await connection()
  return <EventsExplorer initialToday={danishToday()} />
}
