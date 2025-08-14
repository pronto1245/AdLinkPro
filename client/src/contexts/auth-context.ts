// client/src/contexts/auth-context.ts
import React, { createContext, useContext, useMemo, useState } from 'react';
import { login as apiLogin, setToken as storeToken } from '@/lib/api';

type Role = 'superadmin' | 'advertiser' | 'affiliate';
type User = { id: number; username: string; role: Role };

type AuthContext = {
  user: User | null;
  token: string | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContext>(null as unknown as AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  );

  const doLogin = async (username: string, password: string) => {
    const { user, token } = await apiLogin(username, password); // ← ИСПОЛЬЗУЕМ ИМЕННО apiLogin
    setUser(user);
    setTokenState(token);
    storeToken(token);

    const redirect: Record<Role, string> = {
      superadmin: '/super-admin/offers',
      advertiser: '/advertiser/my-offers',
      affiliate: '/affiliate/postbacks',
    };
    if (typeof window !== 'undefined') window.location.assign(redirect[user.role] ?? '/');
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    storeToken(null);
    if (typeof window !== 'undefined') window.location.assign('/login');
  };

  const value = useMemo(() => ({ user, token, login: doLogin, logout }), [user, token]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

