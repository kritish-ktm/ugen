import { denmarkEvents, eventKind, eventsBetween, mergeEvents } from '../../../lib/denmark-events'
import { discoverVega, validEventDate, type EventsData } from '../../../lib/event-discovery'
import { publicPage } from '../../../lib/public-page'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams
  const start = query.get('start') ?? '', end = query.get('end') ?? ''
  if (!validEventDate(start) || !validEventDate(end) || start > end || Date.parse(end) - Date.parse(start) > 366 * 86400000) return Response.json({ error: 'Invalid date range' }, { status: 400 })
  const events = [], unavailable: string[] = []
  const marketsOnly = query.get('kind') === 'market'
  if (!marketsOnly) {
    try { events.push(...discoverVega(await publicPage('https://vega.dk/', 3600))) }
    catch { unavailable.push('VEGA') }
  }
  for (let year = Number(start.slice(0,4)); year <= Number(end.slice(0,4)); year++) events.push(...denmarkEvents(year))
  const data: EventsData = { events: eventsBetween(mergeEvents(events), start, end).filter(event => !marketsOnly || eventKind(event) === 'market'), checked: new Date().toISOString(), unavailable }
  return Response.json(data, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
