import React, { useEffect } from 'react';
import { Redirect, useRoute } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { extractRoleFromToken } from '@/utils/routeByRole';
import { secureStorage } from '@/lib/security';
import { useGlobalState } from '@/hooks/useGlobalState';
import { UserRole, User } from '@/types/auth';

// User cache to reduce redundant API calls
const userCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedUser(token: string): User | null {
  const cached = userCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.user;
  }
  return null;
}

function setCachedUser(token: string, user: User): void {
  userCache.set(token, { user, timestamp: Date.now() });
}

function getRoleFromToken(): UserRole | null {
  const raw = secureStorage.getToken();
  const role = extractRoleFromToken(raw);
  if (!role) {
    return null;
  }

  // Enhanced role mapping with all supported roles
  const roleMap: Record<string, UserRole> = {
    partner: 'partner',
    PARTNER: 'partner',
    affiliate: 'affiliate',
    AFFILIATE: 'affiliate',
    advertiser: 'advertiser',
    ADVERTISER: 'advertiser',
    owner: 'owner',
    OWNER: 'owner',
    super_admin: 'super_admin',
    'super admin': 'super_admin',
    SUPER_ADMIN: 'super_admin',
    staff: 'staff',
    STAFF: 'staff'
  };

  return roleMap[role.trim()] || role.toLowerCase() as UserRole || null;
}

type Props = {
  path: string;
  roles?: UserRole[];
  component?: React.ComponentType<Record<string, unknown>>;
  children?: React.ReactNode;
  requireAuth?: boolean; // Allow public access if false
  fallbackPath?: string; // Custom redirect path
};

export default function ProtectedRoute({
  path,
  roles = [],
  component: Component,
  children,
  requireAuth = true,
  fallbackPath
}: Props) {
  const [match, params] = useRoute(path);
  const { isAuthenticated, isLoading, token, user, refreshUser } = useAuth();
  const { setLoading } = useGlobalState();

  if (!match) {
    return null;
  }

  // Extract redirect parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get('next') || fallbackPath;

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверяем доступ...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users
  if (requireAuth && !isAuthenticated && !token && !secureStorage.getToken()) {
    const loginPath = `/login${redirectTo ? '?next=' + encodeURIComponent(redirectTo) : ''}`;
    return <Redirect to={loginPath} />;
  }

  // Skip role check if no roles specified or auth not required
  if (!requireAuth || roles.length === 0) {
    return Component ? <Component {...params} /> : <>{children}</>;
  }

  // Enhanced role checking with caching
  useEffect(() => {
    const verifyUserRole = async () => {
      if (!token) {
        return;
      }

      // Check cache first
      const cachedUser = getCachedUser(token);
      if (cachedUser) {
        return;
      }

      // If we have user data but no cache, cache it
      if (user) {
        setCachedUser(token, user);
        return;
      }

      // Refresh user data if needed
      try {
        setLoading('auth', true);
        const userData = await refreshUser();
        if (userData) {
          setCachedUser(token, userData);
        }
      } catch (error) {
        console.error('[PROTECTED_ROUTE] Failed to verify user role:', error);
      } finally {
        setLoading('auth', false);
      }
    };

    verifyUserRole();
  }, [token, user, refreshUser, setLoading]);

  // Check role-based access
  if (roles.length > 0) {
    const userRole = user?.role || getRoleFromToken();

    if (!userRole) {
      console.warn('[PROTECTED_ROUTE] No user role found, denying access to:', path);
      return <Redirect to="/unauthorized" />;
    }

    // Enhanced role matching - support both exact match and role hierarchy
    const hasAccess = roles.some(requiredRole => {
      // Direct role match
      if (userRole === requiredRole) {
        return true;
      }

      // Role hierarchy check (owner and super_admin have access to everything)
      if (userRole === 'owner' || userRole === 'super_admin') {
        return true;
      }

      // Partner/affiliate role compatibility
      if (requiredRole === 'partner' && userRole === 'affiliate') {
        return true;
      }
      if (requiredRole === 'affiliate' && userRole === 'partner') {
        return true;
      }

      return false;
    });

    if (!hasAccess) {
      console.warn('[PROTECTED_ROUTE] Access denied for role:', userRole, 'Required:', roles);

      // Enhanced role-based redirection
      const redirectPath = getDefaultDashboardForRole(userRole);
      return <Redirect to={redirectPath} />;
    }
  }

  // Render the protected component
  return Component ? <Component {...params} /> : <>{children}</>;
}

/**
 * Get default dashboard path for a user role
 */
function getDefaultDashboardForRole(role: UserRole): string {
  const dashboardMap: Record<UserRole, string> = {
    owner: '/dashboard/owner',
    super_admin: '/dashboard/super-admin',
    staff: '/dashboard/staff',
    advertiser: '/dashboard/advertiser',
    partner: '/dashboard/partner',
    affiliate: '/dashboard/partner',
  };

  return dashboardMap[role] || '/unauthorized';
}

/**
 * Clear user cache (useful for logout)
 */
export function clearUserCache() {
  userCache.clear();
}
