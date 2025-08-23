/**
 * Authentication API Module
 * Handles all authentication-related API calls
 */

import { apiClient } from './client';
import { User, LoginResponse } from '@/types/auth';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  telegram?: string;
  phone?: string;
  company?: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing?: boolean;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface CompletePasswordResetRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    console.log('[AUTH_API] Login attempt for:', data.email);
    return apiClient.post<LoginResponse>('/api/auth/login', data);
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<{ success: boolean; message: string; user?: User; token?: string }> {
    console.log('[AUTH_API] Registration attempt for:', data.email, 'Role:', data.role);
    
    const endpoint = data.role === 'PARTNER' || data.role === 'affiliate'
      ? '/api/auth/register/partner'
      : data.role === 'ADVERTISER' || data.role === 'advertiser'
      ? '/api/auth/register/advertiser'
      : '/api/auth/register';
      
    console.log('[AUTH_API] Using registration endpoint:', endpoint);
    
    return apiClient.post(endpoint, data);
  },

  /**
   * Get current user profile
   */
  async me(): Promise<User> {
    console.log('[AUTH_API] Fetching current user profile');
    return apiClient.get<User>('/api/me');
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    console.log('[AUTH_API] Logging out user');
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('[AUTH_API] Logout request failed, but continuing with client-side logout:', error);
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string; user?: User }> {
    console.log('[AUTH_API] Refreshing authentication token');
    return apiClient.post('/api/auth/refresh');
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    console.log('[AUTH_API] Password reset requested for:', data.email);
    return apiClient.post('/api/auth/reset-password', data);
  },

  /**
   * Validate password reset token
   */
  async validateResetToken(token: string): Promise<{ valid: boolean; message: string }> {
    console.log('[AUTH_API] Validating password reset token');
    return apiClient.post('/api/auth/validate-reset-token', { token });
  },

  /**
   * Complete password reset
   */
  async completePasswordReset(data: CompletePasswordResetRequest): Promise<{ success: boolean; message: string }> {
    console.log('[AUTH_API] Completing password reset');
    return apiClient.post('/api/auth/complete-password-reset', data);
  }
};