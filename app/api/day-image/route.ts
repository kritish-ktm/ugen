import { validEventDate } from '../../../lib/event-discovery'
import { publicPage } from '../../../lib/public-page'
import { creditText, wikimediaImage, type DayImageData } from '../../../lib/day-image'
import { denmarkEvents } from '../../../lib/denmark-events'

type CalendarDay = { date?: string; wikiLink?: string }
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get('date') ?? ''
  if (!validEventDate(date)) return Response.json({ error:'Invalid date' }, { status:400 })
  const data: DayImageData = { image:null }
  try {
    const year = Number(date.slice(0,4))
    const special = denmarkEvents(year).find(event => event.start === date && !event.city)
    const traditions: Record<string,string> = { 'Luciadag':'Luciadag', 'Sankt Hans aften':'Sankt_Hans', 'Fastelavn':'Fastelavn', 'Mortensaften':'Mortensaften' }
    let topic = special ? traditions[special.da] : undefined
    if (!topic) {
      const days: unknown = JSON.parse(await publicPage('https://api.kalendarium.dk/CalendarList/' + year, 86400))
      if (Array.isArray(days)) topic = (days as CalendarDay[]).find(day => day.date === date && day.wikiLink)?.wikiLink
    }
    if (topic) {
      topic = decodeURIComponent(topic).replaceAll('_',' ')
      if (topic.length > 160 || /[/?#]/.test(topic)) throw new Error('Invalid article')
      const article = JSON.parse(await publicPage('https://api.kalendarium.dk/Wikipedia/' + encodeURIComponent(topic), 86400))
      const image = wikimediaImage(article.imageUrl)
      if (image) {
        const query = new URLSearchParams({ action:'query',format:'json',prop:'imageinfo',iiprop:'extmetadata',titles:'File:' + image.file })
        const metadata = JSON.parse(await publicPage('https://commons.wikimedia.org/w/api.php?' + query, 86400))
        const pages = Object.values(metadata.query?.pages ?? {}) as { imageinfo?: { extmetadata?: Record<string,{value?:string}> }[] }[]
        const credit = pages[0]?.imageinfo?.[0]?.extmetadata
        const license = creditText(credit?.LicenseShortName?.value)
        // Only show pictures with retrievable licensing and attribution details.
        if (license) data.image = { title:creditText(article.title) || topic, imageUrl:image.url, articleUrl:'https://da.wikipedia.org/wiki/' + encodeURIComponent(topic.replaceAll(' ','_')), fileUrl:image.fileUrl,
          artist:creditText(credit?.Artist?.value) || 'Wikimedia Commons', license,
          licenseUrl: /^https:\/\/(?:creativecommons\.org|www\.gnu\.org)\//.test(credit?.LicenseUrl?.value ?? '') ? credit!.LicenseUrl.value! : image.fileUrl }
      }
    }
  } catch { /* Day information stays usable when image sources are unavailable. */ }
  return Response.json(data, { headers:{'Cache-Control':data.image ? 'public, max-age=86400' : 'public, max-age=600'} })
}
