const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || '';

type HttpInit = RequestInit & { headers?: Record<string, string> };

async function api(path: string, init: HttpInit = {}): Promise<any> {
  const token = localStorage.getItem('token') || localStorage.getItem('auth:token') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };
  const res = await fetch(API_BASE + path, { ...init, headers, credentials: 'include' });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.url = API_BASE + path;
    try {
      err.body = ct.includes('application/json') ? await res.clone().text() : await res.text();
    } catch {}
    throw err;
  }
  return ct.includes('application/json') ? res.json() : res.text();
}

function json(path: string, body?: any, init: HttpInit = {}): Promise<any> {
  return api(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...init });
}

export { api, json, API_BASE };

export type LoginResponse = {
  success?: boolean;
  requires2FA?: boolean;
  token?: string;
  user?: { sub: number; email: string; role: string; username: string };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  return json('/api/auth/login', { email, password });
}

export async function me(): Promise<any> {
  return api('/api/me');
}

export async function getMenu(): Promise<any> {
  try {
    return await api('/api/menu/data');
  } catch (e: any) {
    const r = await fetch('/menu-default.json', { credentials: 'include' });
    return r.json();
  }
}

