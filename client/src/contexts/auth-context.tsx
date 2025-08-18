import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, type LoginResponse } from '@/lib/api';
import { getToken, saveToken, removeToken } from '@/services/auth';

type User = LoginResponse['user'];

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (u: string, p: string) => Promise<LoginResponse>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize token from localStorage on mount using auth service
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const doLogin = useCallback(async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiLogin(username, password);
    
    // If 2FA is required, return the response without setting user/token
    if (response.requires2FA) {
      return response;
    }
    
    // If login is successful, set user and token
    if (response.success && response.token && response.user) {
      setUser(response.user);
      setToken(response.token);
      saveToken(response.token);
    }
    
    return response;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    removeToken();
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
