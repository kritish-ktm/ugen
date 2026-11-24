export const currencies = [
  ['EUR', '🇪🇺'], ['USD', '🇺🇸'], ['GBP', '🇬🇧'], ['SEK', '🇸🇪'], ['NOK', '🇳🇴'],
  ['CHF', '🇨🇭'], ['JPY', '🇯🇵'], ['CAD', '🇨🇦'], ['AUD', '🇦🇺'], ['PLN', '🇵🇱'],
  ['CZK', '🇨🇿'], ['ISK', '🇮🇸'], ['NZD', '🇳🇿'], ['INR', '🇮🇳'], ['CNY', '🇨🇳'],
  ['BRL', '🇧🇷'], ['HKD', '🇭🇰'], ['HUF', '🇭🇺'], ['IDR', '🇮🇩'], ['ILS', '🇮🇱'],
  ['KRW', '🇰🇷'], ['MXN', '🇲🇽'], ['MYR', '🇲🇾'], ['PHP', '🇵🇭'], ['RON', '🇷🇴'],
  ['SGD', '🇸🇬'], ['THB', '🇹🇭'], ['TRY', '🇹🇷'], ['ZAR', '🇿🇦'],
] as const
export type CurrencyCode = typeof currencies[number][0]
export type RatePoint = { date: string; rate: number; carried: boolean }
export type RateData = { rate: number; date: string; updated: string; history: RatePoint[] }

export function convert(amount: number, rate: number, reverse = false) {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) return null
  const value = reverse ? amount / rate : amount * rate
  return Number.isFinite(value) ? value : null
}
export function amountValue(text: string) { return Number(text.replace(',', '.')) }

