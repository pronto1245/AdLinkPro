import { api } from './api';

export interface MenuData {
  items: Array<{
    id: string;
    title: string;
    href: string;
    icon: string;
    description: string;
    roles?: string[];
    requiresToken?: boolean;
    visible?: boolean;
  }>;
  userRole: string;
  permissions: string[];
}

export interface TokenValidationResult {
  valid: boolean;
  expired: boolean;
  user?: any;
  expiresAt?: number;
}

/**
 * Validate JWT token and return validation result
 */
export function validateToken(token: string | null): TokenValidationResult {
  if (!token) {
    return { valid: false, expired: false };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, expired: false };
    }

    const payload = JSON.parse(atob(parts[1]));
    const now = Date.now() / 1000;
    const expired = payload.exp && payload.exp < now;

    return {
      valid: !expired,
      expired: expired,
      user: payload,
      expiresAt: payload.exp
    };
  } catch (error) {
    console.warn('Token validation error:', error);
    return { valid: false, expired: false };
  }
}

/**
 * Get menu data from API based on user role and token
 */
export async function getMenuData(): Promise<MenuData> {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('auth:token');
    const validation = validateToken(token);
    
    if (!validation.valid) {
      throw new Error('Invalid or expired token');
    }

    // Try to fetch menu data from API
    const data = await api<MenuData>('/api/menu/data');
    return data;
  } catch (error) {
    console.warn('Failed to fetch menu data from API, using fallback:', error);
    
    // Fallback: determine menu items based on token
    const token = localStorage.getItem('token') || localStorage.getItem('auth:token');
    const validation = validateToken(token);
    
    const fallbackRole = validation.user?.role?.toLowerCase() || 'partner';
    const permissions = validation.user?.permissions || [];

    return {
      items: [], // Will be filtered in the component
      userRole: fallbackRole,
      permissions
    };
  }
}

/**
 * Check if user has permission for specific action
 */
export function hasPermission(permission: string, userPermissions: string[] = []): boolean {
  return userPermissions.includes(permission) || userPermissions.includes('*');
}

/**
 * Get user role from token
 */
export function getUserRoleFromToken(): string | null {
  const token = localStorage.getItem('token') || localStorage.getItem('auth:token');
  const validation = validateToken(token);
  
  if (!validation.valid || !validation.user) {
    return null;
  }

  const role = validation.user.role?.toLowerCase();
  
  // Map server roles to client roles
  const roleMap: Record<string, string> = {
    'owner': 'owner',
    'advertiser': 'advertiser', 
    'partner': 'partner',
    'affiliate': 'affiliate',
    'super_admin': 'super_admin',
    'superadmin': 'super_admin',
    'super admin': 'super_admin',
    'staff': 'staff'
  };

  return roleMap[role] || 'partner';
}

/**
 * Refresh token if needed
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  const token = localStorage.getItem('token') || localStorage.getItem('auth:token');
  const validation = validateToken(token);
  
  // If token is valid and not expiring soon (within 5 minutes), no need to refresh
  if (validation.valid && validation.expiresAt) {
    const fiveMinutesFromNow = Date.now() / 1000 + 300;
    if (validation.expiresAt > fiveMinutesFromNow) {
      return true;
    }
  }

  try {
    const response = await api<{ token: string }>('/api/auth/refresh', {
      method: 'POST'
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth:token', response.token);
      return true;
    }

    return false;
  } catch (error) {
    console.warn('Token refresh failed:', error);
    return false;
  }
}

/**
 * Setup automatic token refresh
 */
export function setupTokenRefresh(): () => void {
  const interval = setInterval(async () => {
    await refreshTokenIfNeeded();
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}