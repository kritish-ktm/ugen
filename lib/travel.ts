export type JourneyInput = { from: string; to: string; date: string; time: string }
export type Leg = { from: string; to: string; departure: string; arrival: string; line: string }
export type Journey = { duration: string; legs: Leg[] }
export type TravelResponse = { kind: 'live' | 'fallback'; journeys: Journey[] }

export function travelLink(input: JourneyInput, language: string) {
  const url = new URL('https://www.rejseplan.dk/')
  url.search = new URLSearchParams({
    S: input.from, Z: input.to, date: input.date.split('-').reverse().join('.'), time: input.time,
    ...(language === 'en' ? { language: 'en' } : {}),
  }).toString()
  return url.href
}
export const demoJourney: Journey = {
  duration: 'PT40M',
  legs: [
    { from: 'København H', to: 'Høje Taastrup St.', departure: '10:06', arrival: '10:20', line: 'RE' },
    { from: 'Høje Taastrup St.', to: 'Roskilde St.', departure: '10:33', arrival: '10:46', line: 'IC' },
  ],
}

