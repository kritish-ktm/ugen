// Gregorian Meeus/Jones/Butcher computus.
export function easterSunday(year: number) {
  const a = year % 19
  const century = Math.floor(year / 100)
  const remainder = year % 100
  const correction = Math.floor((century - Math.floor((century + 8) / 25) + 1) / 3)
  const moon = (19 * a + century - Math.floor(century / 4) - correction + 15) % 30
  const weekday = (32 + 2 * (century % 4) + 2 * Math.floor(remainder / 4) - moon - remainder % 4) % 7
  const total = moon + weekday - 7 * Math.floor((a + 11 * moon + 22 * weekday) / 451) + 114
  return new Date(year, Math.floor(total / 31) - 1, total % 31 + 1, 12)
}
