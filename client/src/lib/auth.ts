import { login as apiLogin, type LoginResponse } from './api';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(t: string) {
  localStorage.setItem('token', t);
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('auth:user');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
}

export function logout() {
  clearToken();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiLogin(email, password);
  if (data?.token) setToken(data.token);
  return data;
}

