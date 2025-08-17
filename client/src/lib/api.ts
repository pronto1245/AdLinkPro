const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || '') : '';

export async function api<T>(path: string, init?: RequestInit & { skipAuth?: boolean }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (!init?.skipAuth) {
    // Use consistent token key across the app
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (await res.json()) as T : ({} as T);
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    language?: string;
    advertiserId?: string;
    isActive: boolean;
    createdAt: string;
  };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const data: any = await api('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  const token = data?.token ?? data?.data?.token;
  if (token) {
    // Use consistent token storage
    localStorage.removeItem('token'); // Clear old format
    localStorage.setItem('auth_token', token);
  }
  return data;
}
