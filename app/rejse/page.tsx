import type { Metadata } from 'next'
import { Travel } from '../../components/travel/Travel'
export const metadata: Metadata = { title: 'Rejse' }
export default function TravelPage() { return <Travel /> }

