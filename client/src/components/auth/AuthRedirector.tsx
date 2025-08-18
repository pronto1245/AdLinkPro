import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/auth-context';

export default function AuthRedirector({
  fallback,
  homeByRole,
}: {
  fallback: string;
  homeByRole: Record<string, string>;
}) {
  let user: any = null;
  try { user = (useAuth() as any)?.user ?? null; } catch {}
  if (!user && typeof window !== 'undefined') {
    try { user = JSON.parse(localStorage.getItem('auth:user') || 'null'); } catch {}
  }
  if (user?.role && homeByRole[user.role]) return <Redirect to={homeByRole[user.role]} />;
  return <Redirect to={fallback} />;
}
