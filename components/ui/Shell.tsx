'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Coins, Grid2X2, Moon, Newspaper, Sun, TrainFront, WifiOff } from 'lucide-react'
import { MotionConfig, motion } from 'framer-motion'
import { useLocal } from '../../hooks/useLocal'
import { useReminderAlerts } from '../../hooks/useReminderAlerts'
import { translate, type Language } from '../../lib/i18n'
import { Brand } from './Brand'

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
  { path: '/', icon: CalendarDays, da: 'Kalender', en: 'Calendar' },
  { path: '/nyheder', icon: Newspaper, da: 'Nyheder', en: 'News' },
  { path: '/valuta', icon: Coins, da: 'Valuta', en: 'Currency' },
  { path: '/rejse', icon: TrainFront, da: 'Rejse', en: 'Travel' },
  { path: '/mere', icon: Grid2X2, da: 'Mere', en: 'More' },
]

export function Shell({ children }: { children: React.ReactNode }) {
  useReminderAlerts()
  const path = usePathname()
  const [language, setLanguage] = useLocal<Language>('ugen-language', 'da')
  const [theme, setTheme] = useLocal<Theme>('ugen-theme', 'system')
  const [online, setOnline] = useState(true)
  const [compact, setCompact] = useState(false)
  const [install, setInstall] = useState<InstallPrompt | null>(null)
  const t = translate(language)

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
          {items.map(({ path: href, icon: Icon, da, en }) => {
            const active = href === '/' ? path === '/' : path.startsWith(href)
            return <UgenLink key={href} href={href} aria-current={active ? 'page' : undefined} className="tab">
              {active && <motion.span layoutId="active-tab" className="tab-pill" />}
              <Icon size={20} strokeWidth={1.75} /><span>{t(da, en)}</span>
            </UgenLink>
          })}
        </nav>
        <div className="side-bottom">
          <button className="side-theme" type="button" onClick={() => setTheme((theme === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark') ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}{t('Skift udseende', 'Toggle appearance')}</button>
          <p><span className="flag" aria-hidden />{t('En lille app til Danmark', 'A little app for Denmark')}</p>
        </div>
      </aside>
      <header className="mobile-header"><UgenLink href="/" aria-label="Ugen"><Brand /></UgenLink></header>
      {compact && <div className="compact-header" aria-hidden="true">{items.find(item => item.path === path)?.[language] ?? 'Ugen'}</div>}
      <main id="main" tabIndex={-1} className="main">
        {!online && <p className="notice" role="status"><WifiOff size={16} />{t('Du er offline', 'You are offline')}</p>}
        <div className="page-enter" key={path}>
          {children}
        </div>
      </main>
    </MotionConfig>
  </Preferences.Provider>
}










