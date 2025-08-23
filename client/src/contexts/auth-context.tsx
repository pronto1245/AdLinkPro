import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, me as apiMe, type LoginResponse } from '@/lib/api';
import { secureStorage } from '@/lib/security';
import { secureAuth } from '@/lib/secure-api';
import { User, AuthContextValue } from '@/types/auth';
import { useAuthError } from '@/hooks/useAuthError';

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError, clearError } = useAuthError();

  // Enhanced user refresh function
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const storedToken = secureStorage.getToken();
      if (!storedToken) {
        console.log('[AUTH] No token found, cannot refresh user');
        return null;
      }

      console.log('[AUTH] Refreshing user data from server...');
      const userData = await apiMe() as User;
      
      if (userData && userData.id) {
        console.log('[AUTH] User data refreshed successfully:', { 
          id: userData.id, 
          email: userData.email, 
          role: userData.role 
        });
        setUser(userData);
        return userData;
      } else {
        console.warn('[AUTH] Invalid user data received from server:', userData);
        // Clear invalid token
        secureStorage.clearToken();
        setToken(null);
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('[AUTH] Failed to refresh user data:', error);
      handleError(error, 'User refresh');
      
      // Clear tokens on auth failure
      if ((error as any)?.status === 401) {
        secureStorage.clearToken();
        setToken(null);
        setUser(null);
      }
      return null;
    }
  }, [handleError]);

  // Initialize auth state on mount with server-side validation
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Initializing authentication state...');
        const storedToken = secureStorage.getToken();
        
        if (storedToken) {
          console.log('[AUTH] Token found in storage, validating with server...');
          setToken(storedToken);
          
          // Server-side token validation via /api/me
          const userData = await refreshUser();
          if (userData) {
            console.log('[AUTH] Authentication initialization successful');
            clearError();
          } else {
            console.log('[AUTH] Token validation failed, user logged out');
          }
        } else {
          console.log('[AUTH] No token found, user not authenticated');
        }
      } catch (error) {
        console.error('[AUTH] Authentication initialization failed:', error);
        handleError(error, 'Authentication initialization');
        secureStorage.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser, handleError, clearError]);

  const doLogin = useCallback(async (username: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('[AUTH] Starting login process for:', username);
      clearError();
      
      const response = await apiLogin(username, password);

      // Handle 2FA requirement (kept for compatibility)
      if ('requires2FA' in response && (response as any).requires2FA) {
        console.log('[AUTH] 2FA required for login');
        return response;
      }

      // Successful login - save user and token
      if (response.token && response.user) {
        console.log('[AUTH] Login successful, saving user data:', { 
          id: response.user.id, 
          email: response.user.email, 
          role: response.user.role 
        });
        
        setUser(response.user as User);
        setToken(response.token);
        secureStorage.setToken(response.token);
        clearError();
      } else {
        console.warn('[AUTH] Login response missing token or user data:', response);
      }

      return response;
    } catch (error) {
      console.error('[AUTH] Login failed:', error);
      handleError(error, 'Login');
      throw error;
    }
  }, [handleError, clearError]);

  const logout = useCallback(() => {
    console.log('[AUTH] Logging out user');
    setUser(null);
    setToken(null);
    secureStorage.clearToken();
    clearError();
    
    // Notify server about logout (fire and forget)
    secureAuth.logout().catch((error) => {
      console.warn('[AUTH] Server logout notification failed:', error);
    });
  }, [clearError]);

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
  if (!ctx) { throw new Error('useAuth must be used within AuthProvider'); }
  return ctx;
}
