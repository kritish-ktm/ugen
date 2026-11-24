import type { Journey, TravelResponse } from '../../../lib/travel'

type Stop = { extId?: string; id?: string; name?: string; time?: string }
type ProviderLeg = { Origin?: Stop; Destination?: Stop; Product?: { line?: string; name?: string }[]; type?: string; name?: string }
const fallback: TravelResponse = { kind: 'fallback', journeys: [] }

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams
  const from = input.get('from')?.trim(), to = input.get('to')?.trim()
  const date = input.get('date') ?? '', time = input.get('time') ?? ''
  if (!from || !to || from.length > 120 || to.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return Response.json({ error: 'Invalid trip' }, { status: 400 })
  const key = process.env.REJSEPLANEN_API_KEY
  if (!key) return Response.json(fallback)
  const base = (process.env.REJSEPLANEN_API_URL ?? 'https://www.rejseplan.dk/api').replace(/\/$/, '')
  async function provider<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(base + '/' + path)
    url.search = new URLSearchParams({ ...params, accessId: key!, format: 'json' }).toString()
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(6500) })
    if (!response.ok) throw new Error('Journey planner unavailable')
    return response.json()
  }
  async function stop(name: string) {
    const result = await provider<{ stopLocationOrCoordLocation?: { StopLocation?: Stop; stopLocation?: Stop }[] }>('location.name', { input: name, maxNo: '5' })
    const stops = result.stopLocationOrCoordLocation?.flatMap(item => item.StopLocation ?? item.stopLocation ?? []) ?? []
    const match = stops.find(item => item.name?.toLocaleLowerCase('da') === name.toLocaleLowerCase('da')) ?? (stops.length === 1 ? stops[0] : undefined)
    return match?.id ?? match?.extId
  }
  try {
    const [originId, destId] = await Promise.all([stop(from), stop(to)])
    if (!originId || !destId) return Response.json(fallback)
    const result = await provider<{ Trip?: { duration?: string; LegList?: { Leg?: ProviderLeg[] } }[] }>('trip', { originId, destId, date, time, numF: '3' })
    const journeys: Journey[] = (result.Trip ?? []).slice(0, 4).flatMap(trip => {
      const legs = (trip.LegList?.Leg ?? []).flatMap(leg => {
        if (!leg.Origin?.name || !leg.Destination?.name || !leg.Origin.time || !leg.Destination.time) return []
        return [{
          from: leg.Origin.name, to: leg.Destination.name, departure: leg.Origin.time.slice(0, 5), arrival: leg.Destination.time.slice(0, 5),
          line: leg.Product?.[0]?.line || leg.Product?.[0]?.name || (leg.type === 'WALK' ? 'WALK' : leg.name || '—'),
        }]
      })
      return legs.length ? [{ duration: trip.duration ?? '', legs }] : []
    })
    return Response.json({ kind: 'live', journeys } satisfies TravelResponse)
  } catch {
    return Response.json(fallback)
  }
}

