import data from './name-days.json'
const names: Record<string, string> = data
export const nameDay = (date: string) => names[date.slice(5)] ?? null

