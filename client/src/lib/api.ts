const API = import.meta.env.VITE_API_URL || '';

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) throw new Error(`http_${res.status}`);
  return res.json();
}

export type LoginResponse = {
  token: string;
  user: { sub: number; email: string; role: string; username: string };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('login_failed');
  return res.json();
}
