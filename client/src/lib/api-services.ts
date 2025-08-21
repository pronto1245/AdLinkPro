import { secureApi } from './secure-api';

// Offers API service
export const offersApi = {
  // Get all offers
  async getOffers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    return secureApi(`/api/offers${queryString ? `?${queryString}` : ''}`);
  },

  // Get single offer
  async getOffer(id: string) {
    return secureApi(`/api/offers/${id}`);
  },

  // Create offer
  async createOffer(data: any) {
    return secureApi('/api/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update offer
  async updateOffer(id: string, data: any) {
    return secureApi(`/api/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete offer
  async deleteOffer(id: string) {
    return secureApi(`/api/offers/${id}`, {
      method: 'DELETE',
    });
  },

  // Request access to offer (for partners)
  async requestAccess(offerId: string, message?: string) {
    return secureApi(`/api/offers/${offerId}/access`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Get offer statistics
  async getOfferStats(offerId: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('from', dateFrom);
    if (dateTo) params.append('to', dateTo);
    
    const query = params.toString();
    return secureApi(`/api/offers/${offerId}/stats${query ? `?${query}` : ''}`);
  },
};

// Users API service
export const usersApi = {
  // Get all users
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    return secureApi(`/api/users${queryString ? `?${queryString}` : ''}`);
  },

  // Get single user
  async getUser(id: string) {
    return secureApi(`/api/users/${id}`);
  },

  // Update user
  async updateUser(id: string, data: any) {
    return secureApi(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user
  async deleteUser(id: string) {
    return secureApi(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Update user status
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'banned') {
    return secureApi(`/api/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Profile API service  
export const profileApi = {
  // Get current user profile
  async getProfile() {
    return secureApi('/api/me');
  },

  // Update profile
  async updateProfile(data: any) {
    return secureApi('/api/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    return secureApi('/api/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  },

  // Upload avatar
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return secureApi('/api/me/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },
};

// Dashboard API service
export const dashboardApi = {
  // Get dashboard stats for current user
  async getDashboardStats() {
    return secureApi('/api/dashboard/stats');
  },

  // Get dashboard stats by role
  async getDashboardStatsByRole(role: string) {
    return secureApi(`/api/dashboard/${role}/stats`);
  },

  // Get recent activity
  async getRecentActivity(limit = 10) {
    return secureApi(`/api/dashboard/activity?limit=${limit}`);
  },
};