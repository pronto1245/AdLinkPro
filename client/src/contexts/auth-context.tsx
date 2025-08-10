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
      console.log('Fetching user with token:', authToken?.substring(0, 20) + '...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      console.log('Auth response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser(userData);
      } else {
        console.log('Auth failed, removing token');
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login with:', { username, password: '***' });
      
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
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        console.error('Login failed with error:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login successful, user data:', data.user);
      console.log('🔑 Token received from server:', data.token ? data.token.substring(0, 20) + '...' : 'NO_TOKEN');
      
      // CRITICAL FIX: Проверяем что токен не null перед сохранением
      if (data.token && data.token !== 'null' && data.token !== null) {
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        console.log('✅ Token saved to localStorage successfully');
        
        // CRITICAL: Принудительно очищаем все кеши React Query после логина
        if ((window as any).queryClient) {
          console.log('🧹 Clearing React Query cache after login');
          (window as any).queryClient.clear();
        }
        
        // CRITICAL: Полностью перезагружаем страницу для сброса всех замыканий
        console.log('🔄 Reloading page to reset all closures');
        setTimeout(() => window.location.reload(), 100);
      } else {
        console.error('❌ Invalid token received from server:', data.token);
        throw new Error('Invalid token received from server');
      }
      
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // CRITICAL: Полная очистка всех токенов
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token'); // старый формат
    console.log('🧹 Полная очистка токенов при выходе');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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
