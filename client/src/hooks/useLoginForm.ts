/**
 * Login Form Hook
 * Reusable logic for login forms
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuthError } from '@/hooks/useAuthError';
import { useAuth } from '@/contexts/auth-context';
import { loginSchema, LoginFormData } from '@/lib/validation';

interface UseLoginFormOptions {
  redirectTo?: string;
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}

export function useLoginForm(options: UseLoginFormOptions = {}) {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { handleError, error, clearError } = useAuthError();
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleLogin = useCallback(async (data: LoginFormData) => {
    console.log('[LOGIN_FORM] Starting login process for:', data.email);
    
    clearError();
    setLoading(true);

    try {
      const result = await login(data.email, data.password);
      
      if (result.token) {
        toast({
          title: 'Успешный вход',
          description: 'Перенаправляем в панель управления...',
        });

        // Call success callback
        if (options.onSuccess) {
          options.onSuccess(result.user);
        }

        // Handle redirection
        if (options.redirectTo) {
          navigate(options.redirectTo);
        } else {
          // Get redirect path from URL params or determine by role
          const urlParams = new URLSearchParams(window.location.search);
          const nextPath = urlParams.get('next');
          
          if (nextPath) {
            navigate(decodeURIComponent(nextPath));
          } else {
            // Default role-based routing
            const role = result.user?.role;
            const defaultPath = getDefaultPathForRole(role);
            navigate(defaultPath);
          }
        }
      } else {
        console.warn('[LOGIN_FORM] No token in response:', result);
        handleError('Ошибка входа. Попробуйте снова.', 'Login');
      }
    } catch (err) {
      console.error('[LOGIN_FORM] Login error:', err);
      handleError(err, 'Login');
      
      if (options.onError) {
        options.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [login, toast, navigate, handleError, clearError, options]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return {
    form,
    loading,
    showPassword,
    error,
    handleSubmit: form.handleSubmit(handleLogin),
    togglePasswordVisibility,
    clearError,
  };
}

/**
 * Get default redirect path based on user role
 */
function getDefaultPathForRole(role?: string): string {
  if (!role) return '/dashboard';
  
  const roleMap: Record<string, string> = {
    'advertiser': '/dashboard/advertiser',
    'partner': '/dashboard/partner',
    'affiliate': '/dashboard/partner',
    'owner': '/dashboard/owner',
    'super_admin': '/dashboard/super-admin',
    'staff': '/dashboard/staff',
  };

  return roleMap[role.toLowerCase()] || '/dashboard';
}