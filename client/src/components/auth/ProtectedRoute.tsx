import React from 'react';
import { Redirect, useRoute } from 'wouter';
import { extractRoleFromToken } from '@/utils/routeByRole';

function getRoleFromToken(): string | null {
  // Use simple localStorage token access
  const raw = localStorage.getItem('token') || 
              localStorage.getItem('auth:token') ||
              null;
  
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
  if (!match) return null;

  const role = getRoleFromToken();
  if (!role) {
    return <Redirect to={`/login?next=${encodeURIComponent(path)}`} />;
  }

  if (roles && !roles.includes(role)) {
    return <Redirect to="/unauthorized" />;
  }

  return C ? <C /> : <>{children}</>;
}
