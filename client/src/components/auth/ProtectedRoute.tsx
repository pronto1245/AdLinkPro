import React from 'react';
import { Redirect, useRoute } from 'wouter';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  path: string;
  roles?: string[];
  component?: React.ComponentType<any>;
  children?: React.ReactNode;
};

export default function ProtectedRoute({ path, roles, component: C, children }: Props) {
  const [match] = useRoute(path);
  let user: any = null;
  try {
    // @ts-ignore
    const ctx = useAuth();
    // @ts-ignore
    user = ctx?.user ?? null;
  } catch {}
  if (!user && typeof window !== 'undefined') {
    try { user = JSON.parse(localStorage.getItem('auth:user') || 'null'); } catch {}
  }
  if (!match) return null;
  if (!user) return <Redirect to={`/login?next=${encodeURIComponent(path)}`} />;
  if (roles && !roles.includes(user.role)) return <Redirect to="/unauthorized" />;
  return C ? <C /> : <>{children}</>;
}
