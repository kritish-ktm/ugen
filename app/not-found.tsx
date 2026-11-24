'use client'
import { ArrowLeft } from 'lucide-react'
import { PageTitle } from '../components/ui/PageTitle'
import { usePreferences, UgenLink } from '../components/ui/Shell'
export default function NotFound() {
  const { t } = usePreferences()
  return <><PageTitle index="404" title={t('Siden findes ikke', 'Page not found')} description={t('Find tilbage til din uge.', 'Find your way back to your week.')} /><UgenLink className="secondary fit" href="/"><ArrowLeft size={16} />{t('Til kalenderen', 'Back to calendar')}</UgenLink></>
}
