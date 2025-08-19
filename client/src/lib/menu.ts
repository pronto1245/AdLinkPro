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
    return { valid: false, expired: true };
  }

  try {
    // Decode JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, expired: true };
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < now) {
      return { valid: false, expired: true, expiresAt: payload.exp };
    }

    return {
      valid: true,
      expired: false,
      user: payload,
      expiresAt: payload.exp
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, expired: true };
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
  
  // If token is expiring soon (within 5 minutes) or expired, try to refresh
  if (!validation.valid || (validation.expiresAt && validation.expiresAt < Date.now() / 1000 + 300)) {
    try {
      const response = await api<{ token: string }>('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('auth:token', response.token);
        return true;
      }
    } catch (error) {
      console.warn('Failed to refresh token:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('auth:token');
    }
  }
  
  return false;
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