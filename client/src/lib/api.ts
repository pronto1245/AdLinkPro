// client/src/lib/api.ts

const API_BASE = 'https://central-matelda-pronto12-95b8129d.koyeb.app'; // твой сабдомен — всегда

function buildHeaders(init?: RequestInit, withAuth = true) {
  const h = new Headers(init?.headers);
  if (!h.has('Content-Type')) h.set('Content-Type', 'application/json');
  h.set('Accept', 'application/json');
  if (withAuth) {
    const t = (typeof localStorage !== 'undefined') ? localStorage.getItem('token') : null;
    if (t) h.set('Authorization', `Bearer ${t}`);
  }
  return h;
}

async function parseJsonSafely<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  // если вдруг текст/пусто
  const txt = await res.text().catch(() => '');
  return (txt ? (JSON.parse(txt) as T) : ({} as T));
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // на логин НЕ подмешиваем старый токен
  const isLogin = /\/api\/auth\/login$/.test(path);
  const headers = buildHeaders(init, !isLogin);

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers, mode: 'cors' });

  if (!res.ok) {
    // попытаемся вынуть текст ошибки из JSON
    try {
      const err: any = await parseJsonSafely<any>(res);
      const msg = err?.message || err?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  return await parseJsonSafely<T>(res);
}

export function setToken(token: string | null) {
  if (typeof localStorage === 'undefined') return;
  if (!token) localStorage.removeItem('token');
  else localStorage.setItem('token', token);
}

export async function login(username: string, password: string) {
  type LoginResp =
    | { user?: any; token?: string; success?: boolean; message?: string }
    | { success?: boolean; message?: string; data?: { user?: any; token?: string } }
    | any;

  const res = await api<LoginResp>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // поддерживаем оба формата
  const token = res?.token ?? res?.data?.token;
  const user  = res?.user  ?? res?.data?.user;

  if (!token || !user) {
    throw new Error(res?.message || 'Login response shape invalid');
  }

  setToken(token);
  return { user, token };
}

