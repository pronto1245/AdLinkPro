import { createContext, useContext, useMemo, useState } from 'react';
import { login as apiLogin } from '@/lib/api';

type Role = 'superadmin' | 'advertiser' | 'affiliate';
type User = { id: number; username: string; role: Role };

type AuthCtxType = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthCtxType>({
  user: null,
  token: null,
  login: async () => { throw new Error('AuthProvider is missing'); },
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  );

  const doLogin = async (username: string, password: string) => {
    const data = await apiLogin(username, password); // { user, token }
    setUser(data.user);
    setToken(data.token);
    if (typeof localStorage !== 'undefined') localStorage.setItem('token', data.token);

    const redirect: Record<Role, string> = {
      superadmin: '/super-admin/offers',
      advertiser: '/advertiser/my-offers',
      affiliate:  '/affiliate/postbacks',
    };
    const to = redirect[data.user.role] ?? '/';
    if (typeof window !== 'undefined') window.location.assign(to);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
    if (typeof window !== 'undefined') window.location.assign('/login');
  };

  const value = useMemo(() => ({ user, token, login: doLogin, logout }), [user, token]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
