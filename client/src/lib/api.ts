const API_BASE = import.meta.env.VITE_API_URL || ''; // пусто => /api/* пойдут через Netlify proxy

function jsonOrEmpty<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return Promise.resolve({} as T);
  return res.json() as Promise<T>;
}

export async function api<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  // На /api/auth/* НЕ добавляем Authorization (логин/рефреш)
  const needsAuth = !/^\/?api\/auth\//.test(path.replace(/^\//, ''));
  if (needsAuth) {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    // Важно: не шлём куки/креды — они нам не нужны, мы на JWT
    credentials: 'omit',
    mode: 'cors',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return jsonOrEmpty<T>(res);
}

export async function login(username: string, password: string) {
  type LoginResponse = { user: { id: number; username: string; role: string }; token: string };
  const data = await api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    // на всякий случай явно:
    credentials: 'omit',
  });
  localStorage.setItem('token', data.token);
  return data;
}
