import { addDays, getISOWeek } from 'date-fns'
import { dateKey } from './holidays.ts'
import { fromDateKey } from './iso-week.ts'
import type { DenmarkEvent } from './denmark-events.ts'

export const marketGuides = [
  { name: 'Veras Market under Buen', city: 'København', place: 'Bispeengen 20, Frederiksberg', da: 'Søndage april–november, 10–15. Lukket i uge 28–30. Se arrangørens kalender.', en: 'Sundays April–November, 10–15. Closed in weeks 28–30. Check the organiser’s calendar.', url: 'https://verasvintage.dk/market/koebenhavn/' },
  { name: 'Gentofte Loppemarked', city: 'Gentofte', place: 'Bregnegårdsvej 2A, Charlottenlund', da: 'Søndage 12. april–4. oktober 2026, 08–14. Sæsonen er slut; se nye datoer hos arrangøren.', en: 'Sundays 12 April–4 October 2026, 08–14. The season has ended; check new dates with the organiser.', url: 'https://www.gentofteloppemarked.dk/' },
  { name: 'Loppemarked i Bella', city: 'København', place: 'Bella Center, Ørestad', da: 'Udvalgte weekender. Bekræftet: 5.–6. december 2026. Søndag 10–16. Se kommende datoer hos arrangøren.', en: 'Selected weekends. Confirmed: 5–6 December 2026. Sunday 10–16. Check upcoming dates with the organiser.', url: 'https://loppemarkedibella.dk/' },
  { name: 'Veras Market · Storms Pakhus', city: 'Odense', place: 'Lerchesgade 4, Odense', da: 'Udvalgte søndage februar–maj og august–november, 11–16. Tjek konkrete datoer.', en: 'Selected Sundays February–May and August–November, 11–16. Check individual dates.', url: 'https://verasvintage.dk/market/odense/' },
  { name: 'Loppemarked Odense', city: 'Odense', place: 'Edisonsvej, Odense C', da: 'Søndage 12. april–4. oktober 2026, 09–15. Se næste sæson hos arrangøren.', en: 'Sundays 12 April–4 October 2026, 09–15. Check next season with the organiser.', url: 'https://loppemarked-odense.dk/' },
] as const

// Expand only the researched 2026 seasons; never assume next year's dates.
export function sundayMarkets(year: number): DenmarkEvent[] {
  if (year !== 2026) return []
  const events: DenmarkEvent[] = []
  function season(first: string, last: string, guide: typeof marketGuides[number], time: string, closedWeeks: number[] = []) {
    for (let date = fromDateKey(first); dateKey(date) <= last; date = addDays(date, 7)) {
      if (closedWeeks.includes(getISOWeek(date))) continue
      const key = dateKey(date)
      events.push({ da: guide.name, en: guide.name, city: guide.city, start: key, end: key, url: guide.url, kind: 'market', time, place: guide.place, schedule: true })
    }
  }
  season('2026-04-05', '2026-11-29', marketGuides[0], '10:00–15:00', [28,29,30])
  season('2026-04-12', '2026-10-04', marketGuides[1], '08:00–14:00')
  season('2026-04-12', '2026-10-04', marketGuides[4], '09:00–15:00')
  return events
}
