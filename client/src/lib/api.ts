const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || '') : '';

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

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: any;
  requires2FA?: boolean;
  tempToken?: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const data: any = await api('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  
  const token = data?.token ?? data?.data?.token;
  if (token) {
    localStorage.setItem('token', token);
    return {
      success: true,
      token,
      user: data?.user ?? data?.data?.user
    };
  }
  
  return data;
}

export async function loginV2(username: string, password: string): Promise<LoginResponse> {
  const data: any = await api('/api/auth/v2/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  
  // Handle 2FA required response
  if (data?.requires2FA) {
    return {
      success: false,
      requires2FA: true,
      tempToken: data.tempToken
    };
  }
  
  const token = data?.token ?? data?.data?.token;
  if (token) {
    localStorage.setItem('token', token);
    return {
      success: true,
      token,
      user: data?.user ?? data?.data?.user
    };
  }
  
  return data;
}
