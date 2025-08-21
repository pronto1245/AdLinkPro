import React from 'react';
import { Redirect, useRoute } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { extractRoleFromToken } from '@/utils/routeByRole';
import { secureStorage } from '@/lib/security';

function getRoleFromToken(): string | null {
  // Use secure storage to get token (handles both new and old storage locations)
  const raw = secureStorage.getToken();
  const role = extractRoleFromToken(raw);
  if (!role) return null;
  
  // Role mapping for backward compatibility
  const map: Record<string,string> = { 
    partner:'partner', 
    PARTNER:'partner', 
    affiliate:'affiliate',
    AFFILIATE:'affiliate',
    advertiser:'advertiser', 
    ADVERTISER:'advertiser', 
    owner:'owner', 
    OWNER:'owner', 
    super_admin:'super_admin', 
    'super admin':'super_admin', 
    SUPER_ADMIN:'super_admin',
    staff:'staff',
    STAFF:'staff'
  };
  return map[role.trim()] || role.toLowerCase() || null;
}

type Props = {
  path: string;
  roles?: string[];
  component?: React.ComponentType<any>;
  children?: React.ReactNode;
};

export default function ProtectedRoute({ path, roles, component: C, children }: Props) {
  const [match] = useRoute(path);
  const { isAuthenticated, isLoading, token, user } = useAuth();
  
  if (!match) return null;

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated (use auth context first, fallback to token check)
  if (!isAuthenticated && !token && !secureStorage.getToken()) {
    return <Redirect to={`/login?next=${encodeURIComponent(path)}`} />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0) {
    const userRole = user?.role || getRoleFromToken();
    if (!userRole || !roles.includes(userRole)) {
      return <Redirect to="/unauthorized" />;
    }
  }

  return C ? <C /> : <>{children}</>;
}
