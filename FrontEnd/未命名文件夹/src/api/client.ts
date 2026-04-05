/**
 * Build a full URL for backend calls.
 * - Dev: use paths starting with /api — Vite proxy forwards to Spring Boot (see vite.config.ts).
 * - Prod same host: keep VITE_API_BASE_URL empty; /api hits the same server as the SPA.
 * - Prod different host: set VITE_API_BASE_URL=https://your-api.example.com (enable CORS on Spring Boot).
 */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function apiPostJson<TBody extends object, TRes>(
  path: string,
  body: TBody,
  init?: RequestInit,
): Promise<TRes> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<TRes>
}
