import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { decodeHeadline } from './news-title.ts'

export type Category = 'latest' | 'domestic' | 'world' | 'sport' | 'money'
export type Headline = {
  title: string; url: string; source: string; published: string; category: Category; imageUrl?: string
}
export type NewsData = { articles: Headline[]; unavailable: string[] }

type Media = { '@_url'?: string; '@_type'?: string; '@_medium'?: string }
type MediaGroup = { 'media:thumbnail'?: Media[]; 'media:content'?: Media[] }
type RssText = string | { '#text'?: string }
type Item = MediaGroup & {
  title?: RssText; link?: RssText; pubDate?: RssText; category?: RssText | RssText[]; 'dc:date'?: RssText
  enclosure?: Media[]; 'media:group'?: MediaGroup[]
}
const repeatedTags = new Set(['enclosure', 'media:thumbnail', 'media:content', 'media:group'])

function readText(value?: RssText) {
  return typeof value === 'string' ? value : value?.['#text'] ?? ''
}

function categoryOf(item: Item, url: URL): Category {
  const text = [...[item.category].flat().map(readText), url.hostname.startsWith('sport.') ? 'sport' : '', url.pathname].filter(Boolean).join(' ').toLowerCase()
  if (/sport|fodbold|haandbold/.test(text)) return 'sport'
  if (/penge|business|oekonomi|økonomi|erhverv/.test(text)) return 'money'
  if (/udland|international|verden|world/.test(text)) return 'world'
  if (/indland|samfund|politik|danmark|krimi/.test(text)) return 'domestic'
  return 'latest'
}

function articleImage(item: Item, article: URL) {
  const groups = [item, ...(item['media:group'] ?? [])]
  const thumbnails = groups.flatMap(group => group['media:thumbnail'] ?? [])
  const images = groups.flatMap(group => group['media:content'] ?? [])
    .filter(media => media['@_medium'] === 'image' || media['@_type']?.startsWith('image/'))
  const enclosures = (item.enclosure ?? []).filter(media => media['@_type']?.startsWith('image/'))

  for (const image of [...thumbnails, ...images, ...enclosures]) {
    const address = image['@_url']
    if (!address?.trim()) continue
    try {
      const url = new URL(address, article)
      if (url.protocol === 'https:' && !url.username && !url.password) return url.href
    } catch { /* Try the next publisher-provided image. */ }
  }
}

export function parseRss(xml: string, source: string): Headline[] {
  if (!xml.trimStart().startsWith('<') || /<!DOCTYPE/i.test(xml) || XMLValidator.validate(xml) !== true) throw new Error('Invalid RSS')
  const channel = new XMLParser({
    parseTagValue: false,
    ignoreAttributes: false,
    processEntities: true,
    isArray: (name, path) => path === 'rss.channel.item' || repeatedTags.has(name),
  }).parse(xml)?.rss?.channel
  if (!channel) throw new Error('RSS channel missing')
  return ((channel.item ?? []) as Item[]).slice(0, 40).flatMap(item => {
    try {
      const title = decodeHeadline(readText(item.title))
      const url = new URL(readText(item.link))
      if (!title || !['http:', 'https:'].includes(url.protocol)) return []
      const date = new Date(readText(item.pubDate ?? item['dc:date']))
      if (!Number.isFinite(+date)) return []
      const imageUrl = articleImage(item, url)
      return [{ title, url: url.href, source, published: date.toISOString(), category: categoryOf(item, url), ...(imageUrl ? { imageUrl } : {}) }]
    } catch { return [] }
  })
}
