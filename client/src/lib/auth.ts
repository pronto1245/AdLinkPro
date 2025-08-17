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
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static TOKEN_EXPIRES_KEY = 'token_expires_at';
  private static refreshPromise: Promise<string | null> | null = null;

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static setTokenExpiration(expiresIn: number): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
  }

  static getTokenExpiration(): number | null {
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  static isTokenExpiringSoon(bufferMinutes: number = 2): boolean {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return true;
    
    const bufferMs = bufferMinutes * 60 * 1000;
    return Date.now() + bufferMs >= expiresAt;
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest('/api/enhanced-auth/login', 'POST', credentials);
    const data = await response.json();
    
    if (data.success) {
      this.setToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      this.setTokenExpiration(data.expiresIn);
      
      // Set up automatic token refresh
      this.scheduleTokenRefresh(data.expiresIn);
      
      return {
        token: data.accessToken,
        user: data.user
      };
    } else {
      throw new Error(data.message || data.error || 'Login failed');
    }
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest('/api/auth/register', 'POST', data);
    const authData = await response.json();
    
    this.setToken(authData.token);
    return authData;
  }

  static async getCurrentUser(): Promise<User> {
    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('/api/enhanced-auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        this.removeToken();
        
        if (errorData.code === 'ACCESS_TOKEN_EXPIRED') {
          // Try to refresh token
          const newToken = await this.refreshToken();
          if (newToken) {
            // Retry with new token
            return this.getCurrentUser();
          }
        }
        
        throw new Error(errorData.message || 'Authentication expired');
      }
      throw new Error(errorData.message || 'Failed to fetch user data');
    }

    const data = await response.json();
    return data.user;
  }

  static async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    try {
      if (refreshToken) {
        await fetch('/api/enhanced-auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.removeToken();
      return null;
    }

    try {
      this.refreshPromise = this.performTokenRefresh(refreshToken);
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private static async performTokenRefresh(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('/api/enhanced-auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setToken(data.accessToken);
        this.setRefreshToken(data.refreshToken);
        this.setTokenExpiration(data.expiresIn);
        
        // Schedule next refresh
        this.scheduleTokenRefresh(data.expiresIn);
        
        return data.accessToken;
      } else {
        throw new Error(data.message || data.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.removeToken();
      
      // Notify user about session expiration
      this.notifySessionExpired();
      return null;
    }
  }

  private static scheduleTokenRefresh(expiresIn: number): void {
    // Schedule refresh 2 minutes before expiration
    const refreshDelay = Math.max((expiresIn - 120) * 1000, 0);
    
    setTimeout(() => {
      if (this.isAuthenticated()) {
        this.refreshToken();
      }
    }, refreshDelay);
  }

  private static notifySessionExpired(): void {
    // This would integrate with your notification system
    // For now, we'll just dispatch a custom event
    window.dispatchEvent(new CustomEvent('auth:sessionExpired', {
      detail: {
        message: 'Your session has expired. Please log in again.',
        action: 'redirect-to-login'
      }
    }));
  }

  static async getValidToken(): Promise<string | null> {
    const currentToken = this.getToken();
    
    if (!currentToken) {
      return null;
    }

    // Check if token is expiring soon and refresh if needed
    if (this.isTokenExpiringSoon()) {
      return this.refreshToken();
    }

    return currentToken;
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

  // Enhanced API request helper with automatic token refresh
  static async makeAuthenticatedRequest(
    url: string, 
    method: string = 'GET', 
    body?: any
  ): Promise<Response> {
    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token available');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    if (body && typeof body === 'object') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      const newToken = await this.refreshToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, {
          method,
          headers,
          body,
        });
      }
    }

    return response;
  }

  // Initialize auth service - call this on app startup
  static initialize(): void {
    // Check if we have tokens and set up refresh scheduling
    const token = this.getToken();
    const expiresAt = this.getTokenExpiration();
    
    if (token && expiresAt) {
      const expiresIn = Math.max((expiresAt - Date.now()) / 1000, 0);
      if (expiresIn > 0) {
        this.scheduleTokenRefresh(expiresIn);
      } else {
        // Token already expired, try to refresh
        this.refreshToken();
      }
    }
  }
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
