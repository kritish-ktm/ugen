import { fetchArticleImage, publisherArticle } from '../../../../lib/news-image'

export async function GET(request: Request) {
  const article = new URL(request.url).searchParams.get('url') ?? ''
  if (article.length > 2048 || !publisherArticle(article)) return new Response(null, { status: 400 })
  try {
    const image = await fetchArticleImage(article)
    if (image) return new Response(null, { status: 307, headers: { Location: image, 'Cache-Control': 'public, max-age=21600' } })
  } catch { /* Publisher unavailable: the client shows its labeled cover. */ }
  return new Response(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=1800' } })
}
