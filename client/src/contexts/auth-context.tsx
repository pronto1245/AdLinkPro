import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, type LoginResponse } from '@/lib/api';
import { getUserFromToken, isTokenExpired } from '@/lib/auth';

type User = LoginResponse['user'];

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken && !isTokenExpired(storedToken)) {
          // Token is valid, extract user info
          const userFromToken = getUserFromToken(storedToken);
          if (userFromToken) {
            setToken(storedToken);
            setUser(userFromToken);
            console.log('🔄 Restored auth state from localStorage for user:', userFromToken.username);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            console.log('❌ Invalid token found in localStorage, cleared');
          }
        } else if (storedToken) {
          // Token is expired, clear it
          localStorage.removeItem('token');
          console.log('❌ Expired token found in localStorage, cleared');
        }
      } catch (error) {
        console.error('❌ Error initializing auth state:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const doLogin = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for user:', username);
      
      const data = await apiLogin(username, password);
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      console.log('✅ Login successful for user:', data.user.username, 'Role:', data.user.role);
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Clear any potentially corrupted state
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🔐 Logging out user');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login: doLogin, logout }),
    [user, token, loading, doLogin, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
