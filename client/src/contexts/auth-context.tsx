import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, type LoginResponse } from '@/lib/api';
import { secureStorage } from '@/lib/security';

type User = {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  name?: string;
  [key: string]: any;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = secureStorage.getToken();
        if (storedToken) {
          setToken(storedToken);
          // For now, we don't validate the token against server since we're using simplified approach
          // You can add token validation here later if needed
        }
      } catch (error) {
        console.warn('Token initialization failed:', error);
        secureStorage.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const doLogin = useCallback(async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiLogin(username, password);
      
      // If 2FA is required, return the response without setting user/token
      if ('requires2FA' in response && response.requires2FA) {
        return response;
      }
      
      // If login is successful, set user and token
      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        secureStorage.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    secureStorage.clearToken();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ 
      user, 
      token, 
      isLoading,
      isAuthenticated: !!token && !!user,
      login: doLogin, 
      logout
    }),
    [user, token, isLoading, doLogin, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {throw new Error('useAuth must be used within AuthProvider');}
  return ctx;
}
