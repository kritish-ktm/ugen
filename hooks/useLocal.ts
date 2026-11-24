'use client'
import { useCallback, useSyncExternalStore } from 'react'

function subscribe(listener: () => void) {
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}

export function useLocal<T>(key: string, fallback: T) {
  const snapshot = useSyncExternalStore(subscribe, () => {
    try { return localStorage.getItem(key) } catch { return null }
  }, () => null)
  let value = fallback
  try { if (snapshot !== null) value = JSON.parse(snapshot) as T } catch { /* Use default. */ }

  const set = useCallback((next: T | ((current: T) => T)) => {
    try {
      const stored = localStorage.getItem(key)
      const current = stored === null ? fallback : JSON.parse(stored) as T
      localStorage.setItem(key, JSON.stringify(typeof next === 'function' ? (next as (current: T) => T)(current) : next))
      window.dispatchEvent(new Event('storage'))
    } catch { /* Storage can be disabled. */ }
  }, [key, fallback])

  return [value, set] as const
}
