'use client'
import { RotateCcw } from 'lucide-react'
import { PageTitle } from '../components/ui/PageTitle'
import { usePreferences } from '../components/ui/Shell'
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = usePreferences()
  return <><PageTitle index={t('FEJL', 'ERROR')} title={t('Noget gik galt', 'Something went wrong')} description={t('Prøv at åbne siden igen.', 'Try opening the page again.')} /><button className="secondary fit" type="button" onClick={reset}><RotateCcw size={16} />{t('Prøv igen', 'Retry')}</button></>
}
