import type { Metadata } from 'next'
import { CompanyDirectory } from '../../components/directory/CompanyDirectory'
export const metadata: Metadata = { title:'Find job' }
export default function JobsPage() { return <CompanyDirectory /> }
