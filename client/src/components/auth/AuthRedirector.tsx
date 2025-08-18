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
  const { user } = useAuth();
  if (user?.role && homeByRole[user.role]) return <Redirect to={homeByRole[user.role]} />;
  return <Redirect to={fallback} />;
}
