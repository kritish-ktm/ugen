'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BriefcaseBusiness, CalendarDays, Coins, Grid2X2, House, Menu, Moon, Newspaper, ShoppingBasket, Store, Sun, Ticket, TrainFront, WifiOff } from 'lucide-react'
import { MotionConfig, motion } from 'framer-motion'
import { useLocal } from '../../hooks/useLocal'
import { useReminderAlerts } from '../../hooks/useReminderAlerts'
import { translate, type Language } from '../../lib/i18n'
import { Brand } from './Brand'
import { Sheet } from './Sheet'

export type Theme = 'system' | 'light' | 'dark'
type InstallPrompt = Event & { prompt: () => Promise<void> }
const Preferences = createContext({
  language: 'da' as Language, setLanguage: (() => {}) as (value: Language) => void,
  theme: 'system' as Theme, setTheme: (() => {}) as (value: Theme) => void,
  online: true, install: null as InstallPrompt | null, compact: false,
})
export function usePreferences() {
  const preferences = useContext(Preferences)
  return { ...preferences, t: translate(preferences.language) }
}
export function UgenLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { online } = useContext(Preferences)
  return online ? <Link href={href} prefetch={false} {...props}>{children}</Link> : <a href={href} {...props}>{children}</a>
}
const items = [
  { path: '/', icon: CalendarDays, da: 'Kalender', en: 'Calendar', extra: false },
  { path: '/nyheder', icon: Newspaper, da: 'Nyheder', en: 'News', extra: false },
  { path: '/valuta', icon: Coins, da: 'Valuta', en: 'Currency', extra: false },
  { path: '/rejse', icon: TrainFront, da: 'Rejse', en: 'Travel', extra: false },
  { path: '/mere/oplevelser', icon: Ticket, da: 'Oplevelser', en: 'Events', extra: true },
  { path: '/mere/markeder', icon: Store, da: 'Markeder', en: 'Markets', extra: true },
  { path: '/mere/tilbud', icon: ShoppingBasket, da: 'Butikker', en: 'Shops', extra: true },
  { path: '/job', icon: BriefcaseBusiness, da: 'Job', en: 'Jobs', extra: true },
  { path: '/bolig', icon: House, da: 'Bolig', en: 'Housing', extra: true },
  { path: '/mere', icon: Grid2X2, da: 'Mere', en: 'More', extra: false },
]

export function Shell({ children }: { children: React.ReactNode }) {
  useReminderAlerts()
  const path = usePathname()
  const [language, setLanguage] = useLocal<Language>('ugen-language', 'da')
  const [theme, setTheme] = useLocal<Theme>('ugen-theme', 'system')
  const [online, setOnline] = useState(true)
  const [compact, setCompact] = useState(false)
  const [install, setInstall] = useState<InstallPrompt | null>(null)
  const [menu, setMenu] = useState(false)
  const t = translate(language)
  const activeItem = [...items].sort((a,b) => b.path.length-a.path.length).find(item => item.path === '/' ? path === '/' : path === item.path || path.startsWith(item.path + '/'))

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dataset.theme = theme
  }, [language, theme])
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine)
    const scroll = () => setCompact(window.scrollY > 115)
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstall(event as InstallPrompt) }
    const installed = () => setInstall(null)
    connection()
    window.addEventListener('online', connection)
    window.addEventListener('offline', connection)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', installed)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    return () => {
      window.removeEventListener('online', connection)
      window.removeEventListener('offline', connection)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  return <Preferences.Provider value={{ language, setLanguage, theme, setTheme, online, install, compact }}>
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
      <a className="skip-link" href="#main">{t('Spring til indhold', 'Skip to content')}</a>
      <aside className="sidebar">
        <UgenLink href="/" className="brand-link" aria-label="Ugen"><Brand /></UgenLink>
        <div className="side-caption">{t('DIN HVERDAG', 'YOUR EVERYDAY')}</div>
        <nav className="tabs" aria-label={t('Hovedmenu', 'Main navigation')}>
          {items.map(({ path: href, icon: Icon, da, en, extra }) => {
            const active = activeItem?.path === href
            const sectionActive = href === '/mere' && activeItem?.extra
            return <UgenLink key={href} href={href} aria-current={active ? 'page' : undefined} data-section-active={sectionActive || undefined} className={'tab' + (extra ? ' desktop-extra' : '')}>
              {active && <motion.span layoutId="active-tab" className="tab-pill" />}
              {sectionActive && <span className="tab-pill mobile-section-pill" />}
              <Icon size={20} strokeWidth={1.75} /><span>{t(da, en)}</span>
            </UgenLink>
          })}
        </nav>
        <div className="side-bottom">
          <button className="side-theme" type="button" onClick={() => setTheme((theme === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark') ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}{t('Skift udseende', 'Toggle appearance')}</button>
          <p><span className="flag" aria-hidden />{t('En lille app til Danmark', 'A little app for Denmark')}</p>
        </div>
      </aside>
      <header className="mobile-header"><UgenLink href="/" aria-label="Ugen"><Brand /></UgenLink><button type="button" className="secondary menu-button" onClick={() => setMenu(true)} aria-haspopup="dialog" aria-expanded={menu}><Menu size={19} />Menu</button></header>
      {compact && <div className="compact-header" aria-hidden="true">{activeItem?.[language] ?? 'Ugen'}</div>}
      <main id="main" tabIndex={-1} className="main">
        {!online && <p className="notice" role="status"><WifiOff size={16} />{t('Du er offline', 'You are offline')}</p>}
        <div className="page-enter" key={path}>
          {children}
        </div>
      </main>
      {menu && <Sheet title="Menu" onClose={() => setMenu(false)}><nav className="menu-grid" aria-label={t('Alle sektioner', 'All sections')}>
        {items.map(({path:href,icon:Icon,da,en})=><UgenLink key={href} href={href} className="menu-entry" aria-current={activeItem?.path===href?'page':undefined} onClick={()=>setMenu(false)}><Icon size={21} /><span>{t(da,en)}</span></UgenLink>)}
      </nav></Sheet>}
    </MotionConfig>
  </Preferences.Provider>
}










