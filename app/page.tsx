import { connection } from 'next/server'
import { Calendar } from '../components/calendar/Calendar'
import { danishToday } from '../lib/iso-week'
export default async function Home() {
  await connection()
  return <Calendar initialToday={danishToday()} />
}
