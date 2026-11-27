import type { Metadata } from 'next'
import { CompanyDirectory } from '../../components/directory/CompanyDirectory'
export const metadata: Metadata = { title:'Find bolig' }
export default function HousingPage() { return <CompanyDirectory key="housing" housing /> }
