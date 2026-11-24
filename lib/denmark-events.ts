import { addDays, previousSunday } from 'date-fns'
import { easterSunday } from './easter.ts'
import { dateKey } from './holidays.ts'

export type DenmarkEvent = {
  da: string
  en: string
  city: string
  start: string
  end: string
  url: string
}

const odenseMarket = {
  da: 'H.C. Andersen Julemarkedet',
  en: 'H.C. Andersen Christmas Market',
  city: 'Odense',
  url: 'https://www.visitodense.dk/hc-andersen-julemarkedet-i-odense-gdk612848',
}

const listings: DenmarkEvent[] = [
  ...[
    ['2026-11-28', '2026-11-29'],
    ['2026-12-05', '2026-12-06'],
    ['2026-12-12', '2026-12-13'],
  ].map(([start, end]) => ({ ...odenseMarket, start, end })),
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
    ...listings.filter(event => event.start <= prefix + '-12-31' && event.end >= prefix + '-01-01'),
    ...annual.map(([date, da, en, url]) => {
      const key = dateKey(date)
      return { da, en, city: '', start: key, end: key, url }
    }),
  ].sort((a, b) => a.start.localeCompare(b.start))
}

export function eventsBetween(events: DenmarkEvent[], start: string, end = start) {
  return events.filter(event => event.start <= end && event.end >= start)
}
