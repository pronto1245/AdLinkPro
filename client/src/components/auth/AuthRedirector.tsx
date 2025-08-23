import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { routeByRole } from '@/utils/routeByRole';

export default function AuthRedirector({
  fallback,
}: {
  fallback: string;
  homeByRole?: Record<string, string>; // Deprecated, use centralized routeByRole
}) {
  let user: { role?: string } | null = null;
  try { user = useAuth()?.user ?? null; } catch {
    // Failed to get user from auth context
  }
  if (!user && typeof window !== 'undefined') {
    try { user = JSON.parse(localStorage.getItem('auth:user') || 'null'); } catch {}
  }
  
  if (user?.role) {
    const dashboardRoute = routeByRole(user.role);
    return <Redirect to={dashboardRoute} />;
  }
  
  return <Redirect to={fallback} />;
}
