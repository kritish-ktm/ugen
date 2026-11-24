'use client'
import { useEffect, useState } from 'react'
import { readCache, writeCache } from '../lib/idb'

type State<T> = { url: string; data?: T; error: boolean; cached: boolean; loading: boolean }
export function useFeed<T>(url: string, online: boolean, refreshMs?: number) {
  const [state, setState] = useState<State<T>>({ url, error: false, cached: false, loading: true })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const abort = new AbortController()
    async function refresh() {
      const saved = await readCache<T>(url)
      if (abort.signal.aborted) return
      setState(previous => online && previous.url === url && previous.data
        ? { ...previous, error: false, loading: true }
        : { url, data: saved, error: !online && !saved, cached: Boolean(saved), loading: online })
      if (!online) return
      try {
        const response = await fetch(url, { signal: abort.signal })
        if (!response.ok) throw new Error('Data unavailable')
        const data: T = await response.json()
        if (!abort.signal.aborted) {
          setState({ url, data, error: false, cached: false, loading: false })
          void writeCache(url, data)
        }
      } catch {
        if (!abort.signal.aborted) setState({ url, data: saved, error: true, cached: Boolean(saved), loading: false })
      }
    }
    void refresh()
    return () => abort.abort()
  }, [url, online, retry])
  useEffect(() => {
    if (!online || !refreshMs) return
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') setRetry(value => value + 1)
    }, refreshMs)
    return () => clearInterval(timer)
  }, [online, refreshMs])
  return { ...(state.url === url ? state : { data: undefined, cached: false, error: false, loading: true }), retry: () => setRetry(value => value + 1) }
}
