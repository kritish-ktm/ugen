'use client'

import { useState } from 'react'
import { usePreferences } from '../ui/Shell'

export function NewsThumbnail({ src, url, source }: { src?: string; url: string; source: string }) {
  const { t } = usePreferences()
  const [attempt, setAttempt] = useState(src ? 0 : 1)
  const image = attempt === 0 ? src : '/api/news/image?url=' + encodeURIComponent(url)
  return <span className="news-thumbnail" aria-hidden="true">
    {attempt < 2
      ? <img src={image} alt="" width={112} height={72} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setAttempt(attempt + 1)} />
      : <span className={'news-thumbnail-placeholder publisher-cover publisher-' + (source === 'DR' ? 'dr' : source === 'Politiken' ? 'politiken' : 'tv2')}><strong>{source}</strong><span>{t('Udgiver', 'Publisher')}</span></span>}
  </span>
}
