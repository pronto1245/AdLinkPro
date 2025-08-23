import { login as apiLogin, type LoginResponse } from './api';
import { tokenStorage } from './security';

export function getToken(): string | null {
  return tokenStorage.getToken();
}

export function setToken(t: string) {
  tokenStorage.setToken(t);
}

export function clearToken() {
  tokenStorage.clearToken();
}

export function logout() {
  clearToken();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiLogin(email, password);
  if (data?.token) {setToken(data.token);}
  return data;
}

