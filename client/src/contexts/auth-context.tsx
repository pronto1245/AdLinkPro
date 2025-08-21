import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { secureAuth, SecureAPIError } from '@/lib/secure-api';
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
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
          // Validate token by fetching user info
          const userInfo = await secureAuth.me();
          if (userInfo) {
            setUser(userInfo);
          } else {
            // Invalid token, clear it
            secureStorage.clearToken();
            setToken(null);
          }
        }
      } catch (error) {
        // Token is invalid or expired
        console.warn('Token validation failed:', error);
        secureStorage.clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const doLogin = useCallback(async (username: string, password: string): Promise<any> => {
    try {
      const response = await secureAuth.loginWithV2({ username, password }, username);
      
      // If 2FA is required, return the response without setting user/token
      if (response.requires2FA) {
        return response;
      }
      
      // If login is successful, get user info and set state
      if (response.token) {
        setToken(response.token);
        
        // Fetch user info to get complete user data
        try {
          const userInfo = await secureAuth.me();
          setUser(userInfo);
        } catch (error) {
          console.warn('Failed to fetch user info after login:', error);
          // Set minimal user info from response if available
          if (response.user) {
            setUser(response.user);
          }
        }
      }
      
      return response;
    } catch (error) {
      if (error instanceof SecureAPIError) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    
    try {
      const userInfo = await secureAuth.me();
      setUser(userInfo);
    } catch (error) {
      console.warn('Failed to refresh user info:', error);
      // Token might be invalid, clear auth
      secureStorage.clearToken();
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const logout = useCallback(async () => {
    try {
      await secureAuth.logout();
    } catch (error) {
      // Ignore logout errors, still clear local state
      console.warn('Logout error (ignored):', error);
    }
    
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ 
      user, 
      token, 
      isLoading,
      isAuthenticated: !!token && !!user,
      login: doLogin, 
      logout, 
      refreshUser 
    }),
    [user, token, isLoading, doLogin, logout, refreshUser]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
