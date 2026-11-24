import { parseRss, type Headline, type NewsData } from '../../../lib/rss'

const feeds = [
  { name: 'DR', url: 'https://www.dr.dk/nyheder/service/feeds/senestenyt' },
  { name: 'TV 2', url: process.env.TV2_RSS_URL },
  { name: 'Politiken', url: 'https://politiken.dk/rss/senestenyt.rss' },
]

export async function GET() {
  const results = await Promise.allSettled(feeds.map(async ({ name, url }) => {
    if (!url) throw new Error('RSS feed not configured')
    const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(6500) })
    if (!response.ok) throw new Error('RSS unavailable')
    const bytes = await response.arrayBuffer()
    if (bytes.byteLength > 2_000_000) throw new Error('RSS response too large')
    const preamble = new TextDecoder().decode(bytes.slice(0, 150))
    const charset = preamble.match(/encoding=["']([^"']+)/i)?.[1] ?? 'utf-8'
    return parseRss(new TextDecoder(charset).decode(bytes), name)
  }))
  const entries = new Map<string, Headline>()
  const unavailable: string[] = []
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') result.value.forEach(article => entries.set(article.url, article))
    else unavailable.push(feeds[index].name)
  })
  if (unavailable.length === feeds.length) return Response.json({ error: 'News unavailable' }, { status: 503 })
  const data: NewsData = { articles: [...entries.values()].sort((a, b) => b.published.localeCompare(a.published)).slice(0, 70), unavailable }
  return Response.json(data)
}
