import React from 'react';
import { Redirect, useRoute } from 'wouter';

function getRoleFromToken(): string | null {
  try {
    // Check both token keys for backward compatibility
    const raw = localStorage.getItem('auth:token') || localStorage.getItem('token');
    if (!raw) return null;
    const payload = JSON.parse(atob((raw.split('.')[1] || '').replace(/-/g,'+').replace(/_/g,'/')));
    const map: Record<string,string> = { partner:'partner', PARTNER:'partner', advertiser:'advertiser', ADVERTISER:'advertiser', owner:'owner', OWNER:'owner', super_admin:'super_admin', 'super admin':'super_admin', SUPER_ADMIN:'super_admin' };
    const role = String(payload.role || '').trim();
    return map[role] || role.toLowerCase() || null;
  } catch { return null; }
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
