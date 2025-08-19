import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  language?: string;
  advertiserId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    // Проверяем что токен не является строкой "null" или пустой строкой
    if (savedToken && savedToken !== 'null' && savedToken !== 'undefined' && savedToken.trim() !== '') {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      // Очищаем некорректные токены
      if (savedToken) {
        localStorage.removeItem('auth_token');
      }
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      // Убрано для чистой консоли продакшена
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      // Убрано для чистой консоли продакшена
      
      if (response.ok) {
        const userData = await response.json();
        // Убрано для чистой консоли продакшена
        setUser(userData);
      } else {
        // Убрано для чистой консоли продакшена
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      // Тихо обрабатываем ошибки загрузки пользователя
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 LOGIN DEBUG: Starting login for:', username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      
      console.log('🔐 LOGIN DEBUG: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        console.log('🔐 LOGIN DEBUG: Error response:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      console.log('🔐 LOGIN DEBUG: Success response data:', data);
      
      // CRITICAL FIX: Проверяем что токен не null перед сохранением
      if (data.token && data.token !== 'null' && data.token !== null) {
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        console.log('🔐 LOGIN DEBUG: Token saved successfully');
        
        // CRITICAL: Принудительно очищаем все кеши React Query после логина
        if ((window as any).queryClient) {
          console.log('🔐 LOGIN DEBUG: Clearing query cache');
          (window as any).queryClient.clear();
        }
      } else {
        console.log('🔐 LOGIN DEBUG: Invalid token received:', data.token);
        throw new Error('Invalid token received from server');
      }
      
      setUser(data.user);
      console.log('🔐 LOGIN DEBUG: Login completed successfully');
    } catch (error) {
      console.log('🔐 LOGIN DEBUG: Login error caught:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const data = await response.json();
      
      // CRITICAL FIX: Проверяем что токен не null перед сохранением
      if (data.token && data.token !== 'null' && data.token !== null) {
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        
        // CRITICAL: Принудительно очищаем все кеши React Query после регистрации
        if ((window as any).queryClient) {
          (window as any).queryClient.clear();
        }
      } else {
        throw new Error('Invalid token received from server');
      }
      
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // CRITICAL: Полная очистка всех токенов
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token'); // старый формат
    // Убрано для чистой консоли продакшена
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
