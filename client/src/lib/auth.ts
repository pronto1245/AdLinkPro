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

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to fetch user data');
    }

    return response.json();
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

// JWT Token utilities
export interface JWTPayload {
  id: string;
  username: string;
  role: string;
  advertiserId?: string;
  exp: number;
  iat: number;
}

/**
 * Decode JWT token to extract user information
 * Note: This is for client-side display only, should not be used for security
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get user info from JWT token when server only returns token
 */
export function getUserFromToken(token: string): User | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload.id,
    username: payload.username,
    email: '', // Not available in JWT
    role: payload.role,
    advertiserId: payload.advertiserId,
    isActive: true,
    createdAt: '',
    // Optional fields will be undefined
  };
}

/**
 * Get role-based redirect path
 */
export function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/admin';
    case 'affiliate':
      return '/affiliate';
    case 'advertiser':
      return '/advertiser';
    default:
      return '/dashboard';
  }
}
