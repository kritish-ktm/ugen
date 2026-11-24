import { addDays, differenceInCalendarDays, format } from 'date-fns'
import { easterSunday } from './easter.ts'

export type Holiday = { date: Date; da: string; en: string; public: boolean; flag: boolean }
export const dateKey = (date: Date) => format(date, 'yyyy-MM-dd')
const fixed: [number, number, string, string, boolean, boolean][] = [
  [1, 1, 'Nytårsdag', 'New Year’s Day', true, true],
  [2, 5, 'Dronning Marys fødselsdag', 'Queen Mary’s birthday', false, true],
  [2, 6, 'Prinsesse Maries fødselsdag', 'Princess Marie’s birthday', false, true],
  [4, 9, 'Danmarks besættelse', 'Occupation of Denmark', false, true],
  [4, 16, 'Dronning Margrethes fødselsdag', 'Queen Margrethe’s birthday', false, true],
  [4, 21, 'Prinsesse Isabellas fødselsdag', 'Princess Isabella’s birthday', false, true],
  [4, 29, 'Prinsesse Benediktes fødselsdag', 'Princess Benedikte’s birthday', false, true],
  [5, 5, 'Danmarks befrielse', 'Liberation Day', false, true],
  [5, 26, 'Kong Frederiks fødselsdag', 'King Frederik’s birthday', false, true],
  [6, 5, 'Grundlovsdag', 'Constitution Day', false, true],
  [6, 7, 'Prins Joachims fødselsdag', 'Prince Joachim’s birthday', false, true],
  [6, 15, 'Valdemarsdag og genforeningsdag', 'Valdemar’s Day and Reunification Day', false, true],
  [6, 21, 'Grønlands nationaldag', 'Greenland National Day', false, true],
  [7, 29, 'Ólavsøka', 'Faroe Islands National Day', false, true],
  [9, 5, 'Flagdag for Danmarks udsendte', 'Flag Day for deployed personnel', false, true],
  [10, 15, 'Kronprins Christians fødselsdag', 'Crown Prince Christian’s birthday', false, true],
  [12, 24, 'Juleaften', 'Christmas Eve', false, false],
  [12, 25, 'Juledag', 'Christmas Day', true, true],
  [12, 26, '2. juledag', 'Boxing Day', true, false],
]
const movable: [number, string, string, boolean][] = [
  [-3, 'Skærtorsdag', 'Maundy Thursday', false], [-2, 'Langfredag', 'Good Friday', true],
  [0, 'Påskedag', 'Easter Sunday', true], [1, '2. påskedag', 'Easter Monday', false],
  [39, 'Kristi himmelfartsdag', 'Ascension Day', true], [49, 'Pinsedag', 'Whit Sunday', true],
  [50, '2. pinsedag', 'Whit Monday', false],
]
export function holidays(year: number): Holiday[] {
  const easter = easterSunday(year)
  const days = fixed.map(([month, day, da, en, publicDay, flag]) => ({ date: new Date(year, month - 1, day, 12), da, en, public: publicDay, flag }))
  days.push(...movable.map(([offset, da, en, flag]) => ({ date: addDays(easter, offset), da, en, public: true, flag })))
  if (year < 2024) days.push({ date: addDays(easter, 26), da: 'Store bededag', en: 'Great Prayer Day', public: true, flag: false })
  return days.sort((a, b) => +a.date - +b.date)
}
export function nextHoliday(date: Date) {
  const year = date.getFullYear()
  const upcoming = [...holidays(year), ...holidays(year + 1)].find(item => item.public && differenceInCalendarDays(item.date, date) > 0)!
  return { ...upcoming, remaining: differenceInCalendarDays(upcoming.date, date) }
}








