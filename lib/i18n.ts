import { da, enGB } from 'date-fns/locale'
export type Language = 'da' | 'en'
export const locales = { da, en: enGB }
export const languageTags = { da: 'da-DK', en: 'en-GB' }
export const translate = (language: Language) => (danish: string, english: string) => language === 'da' ? danish : english
export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

