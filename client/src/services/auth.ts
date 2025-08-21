// Authentication service
import { secureStorage } from '../lib/security';

export interface LoginResponse {
  token: string;
  role: string;
  email: string;
  user?: any;
}

export const normalizeRole = (role?: string): string => {
  if (!role) return '';
  
  const roleMapping: Record<string, string> = {
    'partner': 'partner/affiliate',
    'affiliate': 'partner/affiliate',
    'PARTNER': 'partner/affiliate',
    'AFFILIATE': 'partner/affiliate',
    'advertiser': 'advertiser',
    'ADVERTISER': 'advertiser',
    'owner': 'owner',
    'OWNER': 'owner',
    'super_admin': 'super_admin',
    'SUPER_ADMIN': 'super_admin',
    'staff': 'staff',
    'STAFF': 'staff'
  };
  
  return roleMapping[role] || role;
};

export const saveToken = (data: LoginResponse): void => {
  if (data.token) {
    // Use unified secure storage instead of direct localStorage
    secureStorage.setToken(data.token);
  }
  if (data.role) {
    localStorage.setItem('role', normalizeRole(data.role));
  }
  if (data.email) {
    localStorage.setItem('email', data.email);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

export const getStoredAuth = (): { token: string | null; role: string | null; email: string | null; user: any } => {
  return {
    // Use unified secure storage for token retrieval
    token: secureStorage.getToken(),
    role: localStorage.getItem('role'),
    email: localStorage.getItem('email'),
    user: (() => {
      try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch {
        return null;
      }
    })()
  };
};

export const clearAuth = (): void => {
  // Use unified secure storage for comprehensive token clearing
  secureStorage.clearToken();
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.removeItem('user');
};