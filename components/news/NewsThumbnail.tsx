'use client'

import { useState } from 'react'
import { Newspaper } from 'lucide-react'

export function NewsThumbnail({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false)
  return <span className="news-thumbnail" aria-hidden="true">
    {src && !failed
      ? <img src={src} alt="" width={112} height={72} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      : <Newspaper className="news-thumbnail-placeholder" size={22} strokeWidth={1.6} />}
  </span>
}
