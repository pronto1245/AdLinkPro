const API_BASE: string =
  (import.meta as { env?: Record<string, unknown> })?.env?.VITE_API_BASE as string || '';

type HttpInit = RequestInit & { headers?: Record<string, string> };

async function api<T = unknown>(path: string, init: HttpInit = {}): Promise<T> {
  const token =
    localStorage.getItem('token') || localStorage.getItem('auth:token') || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };

  const res = await fetch(API_BASE + path, { ...init, headers, credentials: 'include' });
  const ct = res.headers.get('content-type') || '';

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as Error & {
      status?: number;
      url?: string;
      body?: string;
    };
    err.status = res.status;
    err.url = API_BASE + path;
    try {
      err.body = ct.includes('application/json')
        ? await res.clone().text()
        : await res.text();
    } catch {
      // ignore parse errors
    }
    throw err;
  }

  return ct.includes('application/json') ? res.json() : res.text();
}

function json<T = unknown>(path: string, body?: unknown, init: HttpInit = {}): Promise<T> {
  return api<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });
}

export { api, json, API_BASE };

export type LoginResponse = {
  success?: boolean;
  token?: string;
  user?: { sub?: number; id?: string; email: string; role: string; username: string };
  requires2FA?: boolean; // оставлено для совместимости, но фактически 2FA отключено
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  return json('/api/auth/login', { email, password });
}

export async function me(): Promise<unknown> {
  return api('/api/me');
}

export async function getMenu(): Promise<any> {
  try {
    return await api('/api/menu/data');
  } catch {
    const r = await fetch('/menu-default.json', { credentials: 'include' });
    return r.json();
  }
}
