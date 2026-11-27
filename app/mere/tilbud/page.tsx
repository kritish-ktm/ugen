import type { Metadata } from 'next'
import { Supermarkets } from '../../../components/shopping/Supermarkets'
export const metadata: Metadata = { title: 'Supermarkeder & tilbud' }
export default function OffersPage() { return <Supermarkets /> }
