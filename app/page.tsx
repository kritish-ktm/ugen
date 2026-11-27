import { connection } from 'next/server'
import { Calendar } from '../components/calendar/Calendar'
import { danishToday } from '../lib/iso-week'
import { readWeekLink } from '../lib/week-link'
import { dateKey } from '../lib/holidays'
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection()
  const query = await searchParams
  const params = new URLSearchParams()
  for (const key of ['year', 'week']) if (query[key] !== undefined) params.set(key, String(query[key]))
  const selection = readWeekLink(params)
  return <Calendar initialToday={danishToday()} initialSelection={selection.date ? dateKey(selection.date) : null} initialInvalid={selection.invalid} />
}
