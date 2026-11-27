// Callers supply fixed publisher URLs, never a URL supplied by the browser.
export async function publicPage(url: string, revalidate = 1800) {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(7000), next: { revalidate } })
  if (!response.ok) throw new Error('Publisher unavailable')
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Empty response')
  const decoder = new TextDecoder()
  let size = 0, html = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 1_500_000) throw new Error('Publisher response too large')
      html += decoder.decode(value, { stream: true })
    }
    return html + decoder.decode()
  } finally { await reader.cancel() }
}
