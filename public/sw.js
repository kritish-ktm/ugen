/* global caches, clients, self */
const shell = 'ugen-shell-v11'
const pages = ['/', '/nyheder', '/valuta', '/rejse', '/mere', '/mere/om', '/mere/tilbud', '/mere/oplevelser', '/mere/markeder', '/job', '/bolig']
const assets = ['/offline.html', '/paper-grain.svg', '/ugen.svg', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/icon-maskable.png']

async function cachePage(cache, path) {
  const response = await fetch(path, { cache: 'reload' })
  if (!response.ok) throw new Error('Page unavailable')
  const html = await response.clone().text()
  const staticFiles = [...new Set(html.match(/\/_next\/static\/[^"'<>\s\\]+\.(?:js|css)(?=["'<>\s\\])/g) ?? [])]
  await cache.addAll(staticFiles)
  await cache.put(path, response)
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(shell)
    await cache.addAll(assets)
    await cachePage(cache, '/')
    await Promise.allSettled(pages.slice(1).map(path => cachePage(cache, path)))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).filter(key => key.startsWith('ugen-shell-') && key !== shell).map(key => caches.delete(key)))
    await clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(shell)
      try {
        const response = await fetch(request)
        if (response.ok && pages.includes(url.pathname)) await cache.put(url.pathname, response.clone())
        return response
      } catch {
        return await cache.match(url.pathname) ?? await cache.match('/offline.html') ?? Response.error()
      }
    })())
  } else if (url.pathname.startsWith('/_next/static/') || assets.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(shell)
      const hit = await cache.match(request)
      if (hit) return hit
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    })())
  }
})
