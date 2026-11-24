import { addDays, format } from 'date-fns'
import { currencies, type RatePoint } from '../../../lib/currency'

const root = 'https://api.frankfurter.dev/v1'
type Latest = { date: string; rates: Record<string, number> }
type History = { rates: Record<string, Record<string, number>> }
async function fetchRates<T>(path: string, currency: string): Promise<T> {
  const url = new URL(root + '/' + path)
  url.search = new URLSearchParams({ base: 'DKK', symbols: currency }).toString()
  const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(9000) })
  if (!response.ok) throw new Error('Frankfurter unavailable')
  return response.json()
}

export async function GET(request: Request) {
  const currency = new URL(request.url).searchParams.get('currency') ?? 'EUR'
  if (!currencies.some(([code]) => code === currency)) return Response.json({ error: 'Unknown currency' }, { status: 400 })
  try {
    const now = new Date()
    const first = format(addDays(now, -37), 'yyyy-MM-dd')
    const last = format(now, 'yyyy-MM-dd')
    const [latest, series] = await Promise.all([fetchRates<Latest>('latest', currency), fetchRates<History>(first + '..' + last, currency).catch(() => null)])
    const rate = latest.rates[currency]
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('Missing rate')
    const byDate = { ...series?.rates, [latest.date]: latest.rates }
    const history: RatePoint[] = []
    let previous: number | undefined
    for (let offset = 37; offset >= 0; offset--) {
      const date = format(addDays(now, -offset), 'yyyy-MM-dd')
      const current = byDate[date]?.[currency]
      if (current > 0) previous = current
      if (offset < 30 && previous !== undefined && series) history.push({ date, rate: previous, carried: !current })
    }
    return Response.json({ rate, date: latest.date, updated: now.toISOString(), history })
  } catch {
    return Response.json({ error: 'Rates unavailable' }, { status: 503 })
  }
}
