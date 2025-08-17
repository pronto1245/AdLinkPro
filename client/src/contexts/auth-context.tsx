import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { login as apiLogin, type LoginResponse } from '@/lib/api';

type User = LoginResponse['user'];

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  const doLogin = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    setUser(data.user);
    setToken(data.token);
    
    // Clear any old token formats and set the standard token
    localStorage.removeItem('token');
    localStorage.setItem('auth_token', data.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // Clear both token formats to ensure clean logout
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, login: doLogin, logout }),
    [user, token, doLogin, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
