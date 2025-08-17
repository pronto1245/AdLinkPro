import { apiRequest } from './queryClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: 'affiliate' | 'advertiser';
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  language?: string;
  advertiserId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export class AuthService {
  private static TOKEN_KEY = 'auth_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest('/api/auth/login', 'POST', credentials);
    const data = await response.json();
    
    this.setToken(data.token);
    return data;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest('/api/auth/register', 'POST', data);
    const authData = await response.json();
    
    this.setToken(authData.token);
    return authData;
  }

  static async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Validate token format before making request
    if (token === 'null' || token === 'undefined' || token.trim() === '') {
      this.removeToken();
      throw new Error('Invalid token format');
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.removeToken();
          throw new Error('Authentication expired');
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // If network error or other issues, clean up invalid token
      if (error instanceof Error && error.message.includes('Authentication expired')) {
        this.removeToken();
      }
      throw error;
    }
  }

  static logout(): void {
    this.removeToken();
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      return this.getToken();
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
    };
  }
}

// Helper function to check if user has required role
export function hasRole(user: User | null, requiredRoles: string[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

// Helper function to check if user owns resource
export function canAccessResource(user: User | null, resourceUserId: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return user.id === resourceUserId;
}

// Helper function to get user display name
export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username;
}

// Helper function to get user initials
export function getUserInitials(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  return user.username.substring(0, 2).toUpperCase();
}

// Helper function to format user role
export function formatUserRole(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'advertiser':
      return 'Advertiser';
    case 'affiliate':
      return 'Affiliate';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}
