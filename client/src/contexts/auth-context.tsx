import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';

type Role = 'superadmin' | 'advertiser' | 'affiliate';
type User = { id: number; username: string; role: Role };

type AuthContextType = {
  user: User | null;
  token: string | null;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextType>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) setToken(t);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    setUser,
    setToken: (t: string | null) => {
      if (t) localStorage.setItem('token', t);
      else localStorage.removeItem('token');
      setToken(t);
    },
    logout: () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') window.location.assign('/login');
    },
  }), [user, token]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
