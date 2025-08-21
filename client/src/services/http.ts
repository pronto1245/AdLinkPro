const RAW_BASE = (import.meta.env.VITE_API_URL ?? '').trim()
const API_BASE = (() => {
  if (!RAW_BASE) return '/api'
  const base = RAW_BASE.replace(/\/+$/, '')
  return base.endsWith('/api') ? base : `${base}/api`
})()
function buildUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}
function getToken(): string {
  return localStorage.getItem('token') || localStorage.getItem('auth:token') || ''
}
export async function api(path: string, init: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as any),
  }
  const res = await fetch(buildUrl(path), { ...init, headers, credentials: 'include' })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const ct = res.headers.get('content-type') ?? ''
  return ct.includes('application/json') ? res.json() : res.text()
}
export async function json(path: string, body?: unknown, init: RequestInit = {}) {
  return api(path, {
    method: init.method ?? 'POST',
    body: body !== undefined ? JSON.stringify(body) : init.body,
    ...init,
  })
}
export { API_BASE }
