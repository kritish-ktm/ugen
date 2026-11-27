import { decodeHeadline } from './news-title.ts'

const publishers = new Set(['www.dr.dk', 'dr.dk', 'politiken.dk', 'www.politiken.dk', 'nyheder.tv2.dk', 'sport.tv2.dk'])
export function publisherArticle(address: string) {
  try {
    const url = new URL(address)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && publishers.has(url.hostname) ? url : null
  } catch { return null }
}

export function previewImage(html: string, article: URL) {
  const head = html.split(/<\/head\s*>/i)[0]
  const candidates: { key: string; value: string }[] = []
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = new Map([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => [match[1].toLowerCase(), match[2] ?? match[3]]))
    candidates.push({ key: (attributes.get('property') ?? attributes.get('name') ?? '').toLowerCase(), value: attributes.get('content') ?? '' })
  }
  for (const key of ['og:image:secure_url', 'og:image', 'twitter:image']) {
    for (const candidate of candidates.filter(item => item.key === key && item.value)) {
      try {
        const value = decodeHeadline(candidate.value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'"))
        const url = new URL(value, article)
        // Images are loaded by the browser; the server never fetches this URL.
        if (url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hostname.includes(':') && !/^\d+(\.\d+){3}$/.test(url.hostname) && url.hostname.includes('.') && !url.hostname.endsWith('.local')) return url.href
      } catch { /* Try another publisher-supplied preview. */ }
    }
  }
  return null
}

export async function fetchArticleImage(address: string, request: typeof fetch = fetch) {
  let url = publisherArticle(address)
  if (!url) return null
  const signal = AbortSignal.timeout(4500)
  for (let redirects = 0; redirects <= 3; redirects++) {
    const response: Response = await request(url, { redirect: 'manual', signal, next: { revalidate: 21600 }, headers: { Accept: 'text/html' } } as RequestInit)
    if (response.status >= 300 && response.status < 400) {
      const location: string | null = response.headers.get('location')
      await response.body?.cancel()
      url = location ? publisherArticle(new URL(location, url).href) : null
      if (!url) return null
      continue
    }
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) { await response.body?.cancel(); return null }
    const reader = response.body?.getReader()
    if (!reader) return null
    const decoder = new TextDecoder()
    let html = '', size = 0
    try {
      while (size < 524288) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        html += decoder.decode(value.subarray(0, Math.max(0, 524288 - (size - value.byteLength))), { stream: true })
        if (/<\/head\s*>/i.test(html)) break
      }
    } finally { await reader.cancel() }
    return previewImage(html, url)
  }
  return null
}
