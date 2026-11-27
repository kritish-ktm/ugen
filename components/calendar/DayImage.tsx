'use client'
import { useState } from 'react'
import { useFeed } from '../../hooks/useFeed'
import type { DayImageData } from '../../lib/day-image'
import { usePreferences } from '../ui/Shell'

export function DayImage({ date, compact = false }: { date: string; compact?: boolean }) {
  const { t, online } = usePreferences()
  const { data } = useFeed<DayImageData>('/api/day-image?date=' + date, online)
  const [failed, setFailed] = useState(false)
  if (!data?.image || failed) return null
  const picture = data.image
  return <figure className={'day-picture' + (compact ? ' compact' : '')}>
    <img src={picture.imageUrl} alt={t('Illustration af ', 'Illustration of ') + picture.title} width="640" height="360" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    <figcaption><span>{picture.title} · {t('illustration, beskåret', 'illustration, cropped')}</span><span>{picture.artist} · <a href={picture.licenseUrl} target="_blank" rel="noopener noreferrer">{picture.license}</a> · <a href={picture.fileUrl} target="_blank" rel="noopener noreferrer">{t('Billedkilde', 'Image source')}</a></span><span><a href={picture.articleUrl} target="_blank" rel="noopener noreferrer">Wikipedia</a> · <a href="https://www.kalendarium.dk/" target="_blank" rel="noopener noreferrer">Kalendarium</a></span></figcaption>
  </figure>
}
