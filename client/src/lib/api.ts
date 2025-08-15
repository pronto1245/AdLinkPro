const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || '') : '';

export async function api<T>(path: string, init?: RequestInit & { skipAuth?: boolean }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (!init?.skipAuth) {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (await res.json()) as T : ({} as T);
}

export async function login(username: string, password: string) {
  const data: any = await api('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  const token = data?.token ?? data?.data?.token;
  if (token) localStorage.setItem('token', token);
  return data;
}
// базовый URL: в проде ходим через /api (Netlify proxy), в деве — через VITE_API_URL
const API_BASE =
  import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || '');

type ApiInit = RequestInit & { skipAuth?: boolean };

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type','application/json');

  // ⬇️ КЛЮЧЕВОЕ: НЕ добавляем Authorization для /api/auth/*
  const skip = init.skipAuth || path.startsWith('/api/auth/');
  if (!skip) {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'omit', // куки не нужны
  });

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${body}`);
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json')
    ? (await res.json() as T)
    : ({} as T);
}

export async function login(username: string, password: string) {
  const data: any = await api('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  const token = data?.token ?? data?.data?.token;
  if (token) localStorage.setItem('token', token);
  return data;
}

