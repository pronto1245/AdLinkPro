export const API_BASE = '/api';

export async function api(path: string, init: RequestInit = {}) {
  // убираем двойные префиксы: если пришло "/api/...", оставляем один
  const cleanPath =
    path.startsWith('/api/') ? path.slice(4) :
    path.startsWith('api/') ? path.slice(3) :
    path;

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('auth:token') ||
    undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  };

  const url = `${API_BASE}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  const res = await fetch(url, { ...init, headers, credentials: 'include' });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const ct = res.headers.get('content-type') ?? '';
  return ct.includes('application/json') ? res.json() : res.text();
}
