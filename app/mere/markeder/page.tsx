import { connection } from 'next/server'
import type { Metadata } from 'next'
import { EventsExplorer } from '../../../components/events/EventsExplorer'
import { danishToday } from '../../../lib/iso-week'
export const metadata: Metadata = { title: 'Markeder' }
export default async function MarketsPage() {
  await connection()
  return <EventsExplorer key="markets" initialToday={danishToday()} marketsOnly />
}
