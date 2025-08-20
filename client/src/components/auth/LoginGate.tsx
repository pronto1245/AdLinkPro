import React from 'react';
import { useLocation } from 'wouter';
import { HOME as HOME_BY_ROLE, User } from '@/lib/auth';

export default function LoginGate() {
  const [, setLocation] = useLocation();
  React.useEffect(() => {
    let user: User | null = null;
    try { user = JSON.parse(localStorage.getItem('auth:user') || 'null'); } catch {}
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const next = params.get('next');
    if (user && user.role) {
      const home = HOME_BY_ROLE[user.role] || '/';
      setLocation(next || home);
    }
  }, [setLocation]);
  return null;
}
