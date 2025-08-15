const API_BASE = (import.meta as any).env?.VITE_API_URL ?? '';

async function safeError(res: Response) {
  try {
    const data = await res.json();
    return (data && (data.error || data.message)) || '';
  } catch {
    return '';
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  // ВАЖНО: не шлём Authorization на /api/auth/*
  if (!path.startsWith('/api/auth/')) {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const ct = res.headers.get('content-type') ?? '';
  return (ct.includes('application/json') ? await res.json() : ({} as T));
}

export type LoginResponse = {
  user: { id: number; username: string; role: string };
  token: string;
};

export function login(username: string, password: string) {
  return api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
