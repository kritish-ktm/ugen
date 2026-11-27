export type DayPicture = { title: string; imageUrl: string; articleUrl: string; fileUrl: string; artist: string; license: string; licenseUrl: string }
export type DayImageData = { image: DayPicture | null }

export function wikimediaImage(address: unknown) {
  if (typeof address !== 'string') return null
  try {
    const url = new URL(address)
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !['upload.wikimedia.org','thumb.wikimedia.org'].includes(url.hostname)) return null
    const parts = url.pathname.split('/').filter(Boolean)
    const commons = parts.indexOf('commons')
    if (commons < 0) return null
    const file = decodeURIComponent(parts[commons + 1] === 'thumb' ? parts[commons + 4] ?? '' : parts.at(-1) ?? '')
    if (!file || file.length > 240 || file.includes('/')) return null
    url.search = ''
    return { url: url.href, file, fileUrl: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file) }
  } catch { return null }
}

export function creditText(value: unknown) {
  return typeof value === 'string' ? value.replace(/<[^>]*>/g,'').replaceAll('&amp;','&').replaceAll('&quot;','"').replace(/\s+/g,' ').trim().slice(0,220) : ''
}
