'use client'
import { useState } from 'react'
import { ArrowUpRight, Newspaper } from 'lucide-react'
import { useFeed } from '../../hooks/useFeed'
import { decodeHeadline } from '../../lib/news-title'
import { languageTags } from '../../lib/i18n'
import type { Category, NewsData } from '../../lib/rss'
import { LoadingLines } from '../ui/LoadingLines'
import { PageTitle } from '../ui/PageTitle'
import { usePreferences } from '../ui/Shell'
import { Stories } from './Stories'
import { NewsThumbnail } from './NewsThumbnail'

const categories = [
  ['latest', 'Seneste', 'Latest'], ['domestic', 'Indland', 'Denmark'],
  ['world', 'Udland', 'World'], ['sport', 'Sport', 'Sport'], ['money', 'Penge', 'Money'],
] as const
const sources = [
  ['DR', 'https://www.dr.dk/nyheder'], ['TV 2', 'https://nyheder.tv2.dk/'], ['Politiken', 'https://politiken.dk/'],
]

function relative(published: string, locale: string) {
  const minutes = Math.round((Date.parse(published) - Date.now()) / 60000)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute')
  if (Math.abs(minutes) < 1440) return formatter.format(Math.round(minutes / 60), 'hour')
  return formatter.format(Math.round(minutes / 1440), 'day')
}

export function News() {
  const { t, language, online } = usePreferences()
  const [category, setCategory] = useState<Category>('latest')
  const { data, cached, loading, error, retry } = useFeed<NewsData>('/api/news', online)
  const articles = data?.articles.filter(article => category === 'latest' || article.category === category) ?? []
  return <>
    <PageTitle index={t('DAGENS PULS', 'DAILY PULSE')} title={t('Nyheder', 'News')} description={t('Dagens historier og overskrifter fra danske medier.', 'Today’s stories and headlines from Danish publishers.')} />
    <div className="stack">
      <Stories />
      <section className="card stack">
        <div className="between"><div><p className="card-label">{t('DANSKE MEDIER', 'DANISH PUBLISHERS')}</p><h2>{t('Overskrifter', 'Headlines')}</h2></div><div className="summary-icon"><Newspaper size={20} /></div></div>
        <div className="chip-row" role="group" aria-label={t('Kategorier', 'Categories')}>{categories.map(([key, da, en]) => <button type="button" key={key} className="chip" aria-pressed={key === category} onClick={() => setCategory(key)}>{t(da, en)}</button>)}</div>
        {cached && <p className="muted small" role="status">{t('Viser gemte overskrifter.', 'Showing cached headlines.')}</p>}
        {error && <div className="inline"><p className="muted small" role="status">{t('Friske overskrifter er ikke tilgængelige.', 'Fresh headlines are unavailable.')}</p>{online && <button className="secondary" type="button" onClick={retry}>{t('Prøv igen', 'Retry')}</button>}</div>}
        {data?.unavailable.length ? <p className="muted small">{t('Feed utilgængeligt', 'Feed unavailable')} · {data.unavailable.join(', ')}</p> : null}
        {articles.length ? <ul className="headlines">{articles.map(item => <li key={item.url}><a className="headline-link" href={item.url} target="_blank" rel="noopener noreferrer">
          <NewsThumbnail key={item.imageUrl} src={item.imageUrl} />
          <span className="headline-copy"><span className="source-label">{item.source}</span><strong>{decodeHeadline(item.title)}</strong><time className="muted small" dateTime={item.published}>{relative(item.published, languageTags[language])}</time></span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </a></li>)}</ul> : loading ? <div role="status" aria-label={t('Henter overskrifter', 'Loading headlines')}><LoadingLines /></div> : !error && <p className="empty">{t('Ingen overskrifter i denne kategori lige nu.', 'There are no headlines in this category right now.')}</p>}
        <div className="chip-row">{sources.map(([name, href]) => <a key={name} href={href} className="secondary" target="_blank" rel="noopener noreferrer">{name}<ArrowUpRight size={14} /></a>)}</div>
      </section>
    </div>
  </>
}
