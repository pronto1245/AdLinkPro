// Re-export from new modular API structure for backward compatibility
export { authApi } from './api/auth';
export { userApi } from './api/user';  
export { apiClient } from './api/client';

// Legacy API functions for backward compatibility
import { authApi } from './api/auth';
import { apiClient } from './api/client';

export const API_BASE: string =
  (import.meta as { env?: Record<string, unknown> })?.env?.VITE_API_BASE as string || '';

// Generic API function for backward compatibility
export async function api<T>(url: string): Promise<T> {
  return apiClient.get<T>(url);
}

// Legacy function wrappers
export async function login(email: string, password: string) {
  return authApi.login({ email, password });
}

export async function me() {
  return authApi.me();
}

export async function getMenu(): Promise<any> {
  try {
    return await apiClient.get('/api/menu/data');
  } catch {
    const r = await fetch('/menu-default.json', { credentials: 'include' });
    return r.json();
  }
}

// Export types for backward compatibility
export type LoginResponse = {
  success?: boolean;
  token?: string;
  user?: { sub?: number; id?: string; email: string; role: string; username: string };
  requires2FA?: boolean;
};
