export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/,'');

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  let p = path.startsWith('/') ? path : `/${path}`;
  const baseHasApi = /\/api$/i.test(API_BASE);
  if (!p.startsWith('/api/')) p = `${baseHasApi ? '' : '/api'}${p}`;
  return `${API_BASE}${p}`;
}

export async function api(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem('token') || localStorage.getItem('auth:token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };
  const url = buildUrl(path);
  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') ?? '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const get = <T=any>(p: string, init?: RequestInit) =>
  api(p, { ...(init||{}), method: 'GET' }) as Promise<T>;

export const post = <T=any>(p: string, body?: any, init?: RequestInit) =>
  api(p, { ...(init||{}), method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }) as Promise<T>;

// совместимость, если где-то импортируется json()
export const json = api;
