import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { login as apiLogin, type LoginResponse } from '@/lib/api';
import { secureStorage } from '@/lib/security';

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
  const [token, setToken] = useState<string | null>(secureStorage.getToken());

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
      // Use unified secure storage
      secureStorage.setToken(response.token);
    }
    
    return response;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // Use unified secure storage clearToken method
    secureStorage.clearToken();
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
