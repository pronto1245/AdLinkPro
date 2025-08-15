export type ApiInit = RequestInit & { skipAuth?: boolean };

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  if (!init.skipAuth && !path.startsWith('/api/auth/')) {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.delete('Authorization');
  }

  const res = await fetch(path, { ...init, headers });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : {};
  if (!res.ok) throw Object.assign(new Error('HTTP '+res.status), { data, status: res.status });
  return data as T;
}

export async function login(username: string, password: string) {
  const data: any = await api('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  const token = data?.token ?? data?.data?.token;
  if (token) localStorage.setItem('token', token);
  return data;
}
