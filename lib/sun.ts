export const cities = [
  { name: 'København', en: 'Copenhagen', lat: 55.6761, lon: 12.5683 },
  { name: 'Aarhus', en: 'Aarhus', lat: 56.1629, lon: 10.2039 },
  { name: 'Odense', en: 'Odense', lat: 55.4038, lon: 10.4024 },
  { name: 'Aalborg', en: 'Aalborg', lat: 57.0488, lon: 9.9217 },
  { name: 'Esbjerg', en: 'Esbjerg', lat: 55.4765, lon: 8.4594 },
]
const radians = Math.PI / 180

// NOAA fractional-year approximation. Calculate in UTC and display in Danish civil time.
export function sunTimes(date: Date, latitude: number, longitude: number) {
  const year = date.getFullYear()
  const midnight = Date.UTC(year, date.getMonth(), date.getDate())
  const day = (midnight - Date.UTC(year, 0, 1)) / 86400000
  const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000
  const gamma = 2 * Math.PI / days * day
  const eq = 229.18 * (.000075 + .001868 * Math.cos(gamma) - .032077 * Math.sin(gamma) - .014615 * Math.cos(2 * gamma) - .040849 * Math.sin(2 * gamma))
  const dec = .006918 - .399912 * Math.cos(gamma) + .070257 * Math.sin(gamma) - .006758 * Math.cos(2 * gamma) + .000907 * Math.sin(2 * gamma) - .002697 * Math.cos(3 * gamma) + .00148 * Math.sin(3 * gamma)
  const lat = latitude * radians
  const angle = Math.acos(Math.cos(90.833 * radians) / (Math.cos(lat) * Math.cos(dec)) - Math.tan(lat) * Math.tan(dec)) / radians
  const noon = 720 - 4 * longitude - eq
  const clock = new Intl.DateTimeFormat('da-DK', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit' })
  const time = (minutes: number) => Number.isFinite(minutes) ? clock.format(new Date(midnight + minutes * 60000)).replace('.', ':') : '—'
  return { sunrise: time(noon - 4 * angle), sunset: time(noon + 4 * angle) }
}
