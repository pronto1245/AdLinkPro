import { createContext, useContext, useMemo, useState } from 'react';

type Role = 'superadmin' | 'advertiser' | 'affiliate';

export type User = {
  id: number;
  username: string;
  role: Role | string; // на всякий случай не упадём, если придёт другое значение
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (u: User, t: string) => void;
  logout: () => void;
};

const AuthCtx = createContext<AuthState>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const value = useMemo<AuthState>(() => ({
    user,
    token,
    login: (u, t) => {
      setUser(u);
      setToken(t);
      localStorage.setItem('token', t);
      // Простой редирект по роли (подгони под свои роуты)
      const dash: Record<string, string> = {
        superadmin: '/super-admin/offers',
        advertiser: '/advertiser/my-offers',
        affiliate:  '/affiliate/postbacks',
      };
      const to = dash[u.role] ?? '/';
      if (typeof window !== 'undefined') window.location.assign(to);
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
