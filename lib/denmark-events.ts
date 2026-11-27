import { addDays, previousSunday } from 'date-fns'
import { easterSunday } from './easter.ts'
import { dateKey } from './holidays.ts'
import { sundayMarkets } from './markets.ts'

export type EventKind = 'concert' | 'social' | 'market' | 'tradition'

export type DenmarkEvent = {
  da: string
  en: string
  city: string
  start: string
  end: string
  url: string
  kind?: EventKind
  time?: string
  place?: string
  schedule?: boolean
  discovered?: boolean
}

const odenseMarket = {
  da: 'H.C. Andersen Julemarkedet',
  en: 'H.C. Andersen Christmas Market',
  city: 'Odense',
  url: 'https://www.visitodense.dk/hc-andersen-julemarkedet-i-odense-gdk612848',
}

const listings: DenmarkEvent[] = [
  { da: 'Lucia i Kajak', en: 'Lucia kayak parade', city: 'København', start: '2026-12-13', end: '2026-12-13', time: '17:00–19:00', place: 'Kayak Bar · Københavns kanaler', kind: 'social', url: 'https://visitorservice.kk.dk/en/events/lucia-in-kayak?language=en' },
  { da: 'Luciaoptog i kajak · Aarhus', en: 'Lucia kayak parade · Aarhus', city: 'Aarhus', start: '2026-12-13', end: '2026-12-13', time: '18:00', place: 'Kystpromenaden 4 · Aarhus Havn', kind: 'social', url: 'https://www.visitaarhus.com/aarhus-region/plan-your-trip/saint-lucys-procession-in-kayaks-in-aarhus-gdk1106248' },
  { da: 'ROYA · Store VEGA', en: 'ROYA · Store VEGA', city: 'København', start: '2026-12-05', end: '2026-12-05', kind: 'concert', place: 'Store VEGA, Enghavevej 40', url: 'https://vega.dk/event/roya-2026-12-05' },
  { da: 'Chris Burton · Lille VEGA', en: 'Chris Burton · Lille VEGA', city: 'København', start: '2026-12-08', end: '2026-12-08', kind: 'concert', place: 'Lille VEGA, Enghavevej 40', url: 'https://vega.dk/event/chris-burton-2026-12-08' },
  { da: 'Loppemarked i Bella · lørdag', en: 'Bella flea market · Saturday', city: 'København', start: '2026-12-05', end: '2026-12-05', kind: 'market', time: '10:00–17:00', place: 'Bella Center, Ørestad', url: 'https://loppemarkedibella.dk/' },
  { da: 'Loppemarked i Bella · søndag', en: 'Bella flea market · Sunday', city: 'København', start: '2026-12-06', end: '2026-12-06', kind: 'market', time: '10:00–16:00', place: 'Bella Center, Ørestad', url: 'https://loppemarkedibella.dk/' },
  ...[
    ['2026-11-28', '2026-11-29'],
    ['2026-12-05', '2026-12-06'],
    ['2026-12-12', '2026-12-13'],
  ].map(([start, end]) => ({ ...odenseMarket, start, end, kind: 'market' as const })),
  { da: 'Jul i Tivoli', en: 'Christmas in Tivoli', city: 'København', start: '2026-11-13', end: '2027-01-03', url: 'https://www.tivoli.dk/aabningstider-og-saesoner/jul-i-tivoli' },
  { da: 'Påske i Tivoli', en: 'Easter in Tivoli', city: 'København', start: '2027-03-19', end: '2027-03-29', url: 'https://www.tivoli.dk/aabningstider-og-saesoner' },
  { da: 'Roskilde Festival', en: 'Roskilde Festival', city: 'Roskilde', start: '2027-06-26', end: '2027-07-03', url: 'https://www.roskilde-festival.dk/nyheder/tak-for-i-aar-vi-ses-i-2027' },
  { da: 'Aarhus Festuge', en: 'Aarhus Festival', city: 'Aarhus', start: '2027-08-27', end: '2027-09-05', url: 'https://www.aarhusfestuge.dk/open-call-aarhus-festuge-2027-byrummet/' },
]

export function denmarkEvents(year: number) {
  const traditions = 'https://www.norden.org/da/info-norden/helligdage-i-danmark'
  const annual: [Date, string, string, string][] = [
    [addDays(easterSunday(year), -49), 'Fastelavn', 'Fastelavn carnival', traditions],
    [new Date(year, 5, 23, 12), 'Sankt Hans aften', 'Midsummer Eve', 'https://www.visitdenmark.dk/danmark/explore/sankt-hans-aften-gdk1100650'],
    [new Date(year, 10, 10, 12), 'Mortensaften', 'St Martin’s Eve', traditions],
    [addDays(previousSunday(new Date(year, 11, 25, 12)), -21), 'Første søndag i advent', 'First Sunday of Advent', 'https://www.folkekirken.dk/aarets-hoejtider/jul-og-advent/julens-dage'],
    [new Date(year, 11, 13, 12), 'Luciadag', 'St Lucia’s Day', 'https://www.folkekirken.dk/aarets-hoejtider/jul-og-advent/lucia'],
  ]
  const prefix = String(year).padStart(4, '0')
  return [
    ...sundayMarkets(year),
    ...listings.filter(event => event.start <= prefix + '-12-31' && event.end >= prefix + '-01-01'),
    ...annual.map(([date, da, en, url]) => {
      const key = dateKey(date)
      return { da, en, city: '', start: key, end: key, url }
    }),
  ].sort((a, b) => a.start.localeCompare(b.start))
}

export const eventKind = (event: DenmarkEvent): EventKind => event.kind ?? (event.city ? /Festival/.test(event.da) ? 'concert' : 'social' : 'tradition')

export function mergeEvents(events: DenmarkEvent[]) {
  // Curated entries take priority over a discovered listing of the same source/date.
  return [...new Map(events.map(event => [event.url.replace(/\?.*$/, '').replace(/\/$/, '') + event.start, event])).values()]
    .sort((a, b) => a.start.localeCompare(b.start) || (a.time ?? '').localeCompare(b.time ?? '') || a.da.localeCompare(b.da, 'da'))
}

export function eventsBetween(events: DenmarkEvent[], start: string, end = start) {
  return events.filter(event => event.start <= end && event.end >= start)
}
