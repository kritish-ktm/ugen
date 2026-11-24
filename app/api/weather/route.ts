import { cities } from '../../../lib/sun'
import type { Weather } from '../../../lib/weather'

type Forecast = {
  domain: { axes: { t: { values: string[] } } }
  ranges: Record<string, { values: (number | null)[] }>
}

export async function GET(request: Request) {
  const city = cities[Number(new URL(request.url).searchParams.get('city') ?? 0)]
  if (!city) return Response.json({ error: 'Unknown city' }, { status: 400 })
  const url = new URL('https://opendataapi.dmi.dk/v1/forecastedr/collections/harmonie_dini_sf/position')
  url.search = new URLSearchParams({
    coords: 'POINT(' + city.lon + ' ' + city.lat + ')', crs: 'crs84',
    'parameter-name': 'temperature-2m,fraction-of-cloud-cover,total-precipitation',
  }).toString()
  try {
    const response = await fetch(url, { next: { revalidate: 900 }, signal: AbortSignal.timeout(9000) })
    if (!response.ok) throw new Error('DMI unavailable')
    const forecast: Forecast = await response.json()
    const times = forecast.domain.axes.t.values
    const temperatures = forecast.ranges['temperature-2m'].values
    const index = times.findIndex((time, i) => Date.parse(time) >= Date.now() - 3600000 && typeof temperatures[i] === 'number')
    const kelvin = temperatures[index]
    if (index < 0 || typeof kelvin !== 'number' || !Number.isFinite(kelvin)) throw new Error('No current forecast')
    const clouds = forecast.ranges['fraction-of-cloud-cover']?.values[index] ?? 0
    const accumulated = forecast.ranges['total-precipitation']?.values ?? []
    const rain = (accumulated[index] ?? 0) - (accumulated[index - 1] ?? 0)
    const data: Weather = { temperature: Math.round(kelvin - 273.15), condition: rain > .15 ? 'rain' : clouds > .55 ? 'cloud' : 'sun', time: times[index] }
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Forecast unavailable' }, { status: 503 })
  }
}
