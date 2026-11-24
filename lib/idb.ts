function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ugen', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('data')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Cache blocked'))
  })
}
export async function readCache<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openCache()
    try {
      return await new Promise<T | undefined>((resolve, reject) => {
        const request = db.transaction('data').objectStore('data').get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } finally { db.close() }
  } catch { return undefined }
}
export async function writeCache(key: string, value: unknown) {
  try {
    const db = await openCache()
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('data', 'readwrite')
        tx.objectStore('data').put(value, key)
        tx.oncomplete = () => resolve()
        tx.onabort = () => reject(tx.error)
      })
    } finally { db.close() }
  } catch { /* An unavailable cache should not prevent online use. */ }
}
