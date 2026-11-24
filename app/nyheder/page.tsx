import type { Metadata } from 'next'
import { News } from '../../components/news/News'
export const metadata: Metadata = { title: 'Nyheder' }
export default function NewsPage() { return <News /> }

