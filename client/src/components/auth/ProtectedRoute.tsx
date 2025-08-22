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
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (!match) return null;

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Redirect to={`/login?next=${encodeURIComponent(path)}`} />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0) {
    const userRole = user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return <Redirect to="/unauthorized" />;
    }
  }

  return C ? <C /> : <>{children}</>;
}
