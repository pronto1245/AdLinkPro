import { json, api } from './http';

// Authentication service for simplified login without 2FA
export const auth = {
  // Login with email and password only (no 2FA)
  async login(email: string, password: string): Promise<{ token: string; user: any } | null> {
    try {
      const response = await json('/auth/v2/login', { email, password }) as { success: boolean; token?: string; user?: any; message?: string };

      if (response.success && response.token) {
        // Store token for future requests
        localStorage.setItem('auth_token', response.token);
        return { token: response.token, user: response.user || null };
      }

      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  // Get current user data
  async getCurrentUser(): Promise<any | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await api('/auth/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      }) as { success: boolean; user?: any };

      return response.success ? response.user : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Logout user
  logout() {
    localStorage.removeItem('auth_token');
  },

  // Save token (for login persistence)
  saveToken(token: string) {
    localStorage.setItem('auth_token', token);
  }
};

// User role management
export enum UserRole {
  OWNER = 'OWNER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  PUBLISHER = 'PUBLISHER',
  PARTNER = 'PARTNER',
  ADVERTISER = 'ADVERTISER',
  STAFF = 'STAFF'
}

// Check if user has specific role
export function normalizeRole(role: string): UserRole {
  const upperRole = role.toUpperCase();
  return Object.values(UserRole).includes(upperRole as UserRole) 
    ? (upperRole as UserRole) 
    : UserRole.PARTNER;
}

// Home route based on user role
export function homeByRole(role: UserRole): string {
  switch (role) {
    case UserRole.OWNER:
    case UserRole.SUPER_ADMIN:
      return '/dashboard/owner';
    case UserRole.PUBLISHER:
      return '/dashboard/publisher';
    case UserRole.PARTNER:
      return '/dashboard/partner';  
    case UserRole.ADVERTISER:
      return '/dashboard/advertiser';
    case UserRole.STAFF:
      return '/dashboard/staff';
    default:
      return '/dashboard';
  }
}