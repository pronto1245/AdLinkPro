const API_BASE = '';

function resolveUrl(path: string) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

async function api(path: string, init: RequestInit = {}) {
  const token =
    (typeof localStorage !== 'undefined' && (localStorage.getItem('token') || localStorage.getItem('auth:token'))) ||
    '';

  const headers: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(resolveUrl(path), { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

async function json(path: string, body?: unknown, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  const method = init.method || 'POST';
  return api(path, { ...init, method, headers, body: body !== undefined ? JSON.stringify(body) : init.body });
}

export { api, json, API_BASE };
export default api;

export async function login(email: string, password: string) {
  return json('/api/auth/login', { email, password });
}
