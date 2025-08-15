const API_BASE = import.meta.env.VITE_API_URL ?? '';

function shouldSkipAuth(path: string) {
  // На /api/auth/* токен НЕ отправляем
  return path.startsWith('/api/auth/');
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && !shouldSkipAuth(path)) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return {} as T;
  return (await res.json()) as T;
}

export async function login(username: string, password: string) {
  type LoginResponse = { user: { id: number; username: string; role: string }; token: string };
  return api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
