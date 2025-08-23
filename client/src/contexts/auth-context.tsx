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
          // Упрощённо: пока не валидируем токен на сервере.
          // При необходимости добавишь проверку /api/me позже.
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

      // 2FA сейчас не используется. Если когда-нибудь вернёшь —
      // бэкенд может прислать requires2FA=true; тогда просто обработай это на UI.
      if ('requires2FA' in response && (response as any).requires2FA) {
        return response; // не ставим user/token — ждём подтверждения 2FA на UI
      }

      // Успешный логин — сохраняем пользователя и токен
      if (response.token && response.user) {
        setUser(response.user as User);
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
  if (!ctx) { throw new Error('useAuth must be used within AuthProvider'); }
  return ctx;
}
