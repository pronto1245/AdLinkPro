const BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? '') || '';

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function authHeaders(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let msg = '';
    try { msg = await res.text(); } catch {}
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return {} as T;

  return (await res.json()) as T;
}

export async function login(username: string, password: string) {
  type LoginResponse = { user: { id: number; username: string; role: string }; token: string };

  const data = await api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  setToken(data.token);
  return data;
}
