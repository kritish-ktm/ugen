import { dateFromWeek } from './iso-week.ts'

// Invalid shared links fall back to today's calendar, rather than throwing.
export function readWeekLink(params: URLSearchParams) {
  const year = params.get('year')
  const week = params.get('week')
  if (year === null && week === null) return { date: null, invalid: false }
  if (!/^\d{4}$/.test(year ?? '') || !/^\d{1,2}$/.test(week ?? '')) return { date: null, invalid: true }
  try { return { date: dateFromWeek(Number(year), Number(week)), invalid: false } }
  catch { return { date: null, invalid: true } }
}
