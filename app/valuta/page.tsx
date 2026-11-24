import type { Metadata } from 'next'
import { Converter } from '../../components/currency/Converter'
export const metadata: Metadata = { title: 'Valuta' }
export default function CurrencyPage() { return <Converter /> }

