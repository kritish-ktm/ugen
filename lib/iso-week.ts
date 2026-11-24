import { addWeeks, getISOWeek, getISOWeekYear, getISOWeeksInYear, startOfISOWeek } from 'date-fns'

export const isoWeek = (date: Date) => ({ week: getISOWeek(date), year: getISOWeekYear(date) })
export const weeksInYear = (year: number) => getISOWeeksInYear(new Date(year, 6, 1))
export function dateFromWeek(year: number, week: number) {
  if (!Number.isInteger(year) || year < 100 || year > 9999 || !Number.isInteger(week) || week < 1 || week > weeksInYear(year)) throw new RangeError('Invalid ISO week')
  return addWeeks(startOfISOWeek(new Date(year, 0, 4, 12)), week - 1)
}
export function danishToday(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}
export function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}
