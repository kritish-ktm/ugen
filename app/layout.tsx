import type { Metadata, Viewport } from 'next'
import { Shell } from '../components/ui/Shell'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Ugen · Din uge, samlet', template: '%s · Ugen' },
  description: 'Dansk ugekalender med helligdage, planlægning og små værktøjer til din hverdag.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/ugen.svg', apple: '/icon-192.png' },
  appleWebApp: { capable: true, title: 'Ugen', statusBarStyle: 'default' },
}
export const viewport: Viewport = { themeColor: '#edf2f9' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="da" suppressHydrationWarning><body><Shell>{children}</Shell></body></html>
}
