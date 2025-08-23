/**
 * User API Module
 * Handles user management API calls
 */

import { apiClient } from './client';
import { User } from '@/types/auth';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  telegram?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  status?: 'active' | 'blocked' | 'all';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const userApi = {
  /**
   * Get current user profile (with caching)
   */
  async getProfile(): Promise<User> {
    console.log('[USER_API] Fetching user profile');
    return apiClient.get<User>('/api/users/profile');
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateUserRequest): Promise<User> {
    console.log('[USER_API] Updating user profile');
    return apiClient.patch<User>('/api/users/profile', data);
  },

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    console.log('[USER_API] Changing user password');
    return apiClient.post('/api/users/change-password', data);
  },

  /**
   * Get user by ID (admin only)
   */
  async getUser(userId: string): Promise<User> {
    console.log('[USER_API] Fetching user by ID:', userId);
    return apiClient.get<User>(`/api/users/${userId}`);
  },

  /**
   * List users (admin only)
   */
  async listUsers(query: UserListQuery = {}): Promise<UserListResponse> {
    console.log('[USER_API] Listing users with query:', query);
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.role) params.append('role', query.role);
    if (query.search) params.append('search', query.search);
    if (query.status) params.append('status', query.status);
    
    const url = `/api/users${params.toString() ? '?' + params.toString() : ''}`;
    return apiClient.get<UserListResponse>(url);
  },

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId: string, status: 'active' | 'blocked'): Promise<User> {
    console.log('[USER_API] Updating user status:', userId, 'to', status);
    return apiClient.patch<User>(`/api/users/${userId}/status`, { status });
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: string): Promise<User> {
    console.log('[USER_API] Updating user role:', userId, 'to', role);
    return apiClient.patch<User>(`/api/users/${userId}/role`, { role });
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    console.log('[USER_API] Deleting user:', userId);
    return apiClient.delete(`/api/users/${userId}`);
  }
};