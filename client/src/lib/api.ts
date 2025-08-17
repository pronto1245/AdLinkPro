import { AuthResponse, getUserFromToken, isTokenExpired } from './auth';

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || '') : '';

export type LoginResponse = AuthResponse;

export async function api<T>(path: string, init?: RequestInit & { skipAuth?: boolean }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (!init?.skipAuth) {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (await res.json()) as T : ({} as T);
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const data: any = await api('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  
  // Handle both token-only and token+user responses
  const token = data?.token ?? data?.data?.token;
  if (!token) {
    throw new Error('No token received from server');
  }
  
  // Check if token is valid
  if (isTokenExpired(token)) {
    throw new Error('Received expired token');
  }
  
  // Save token to localStorage immediately
  localStorage.setItem('token', token);
  
  // If user data is provided, use it; otherwise extract from token
  let user = data.user;
  if (!user) {
    user = getUserFromToken(token);
    if (!user) {
      throw new Error('Unable to extract user information from token');
    }
  }
  
  return { token, user };
}
