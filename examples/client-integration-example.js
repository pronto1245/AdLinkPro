#!/usr/bin/env node

/**
 * Client-side Authentication Integration Example
 * 
 * This example shows how to integrate the enhanced authentication system
 * into a client application with automatic token refresh and session management.
 * 
 * Run with: node examples/client-integration-example.js
 */

// Simulate browser environment for localStorage
const localStorage = {
  storage: new Map(),
  getItem(key) { return this.storage.get(key) || null; },
  setItem(key, value) { this.storage.set(key, String(value)); },
  removeItem(key) { this.storage.delete(key); },
  clear() { this.storage.clear(); }
};

// Mock fetch for Node.js environment - use require syntax for better compatibility
const fetch = require('node-fetch').default || require('node-fetch');
global.fetch = fetch;
global.localStorage = localStorage;
global.window = {
  dispatchEvent: (event) => console.log('🔔 Event dispatched:', event.type, event.detail),
  addEventListener: () => {},
};

const baseURL = 'http://localhost:5000';

/**
 * Enhanced AuthService with automatic token refresh
 * (Simplified version for demonstration)
 */
class AuthService {
  static TOKEN_KEY = 'auth_token';
  static REFRESH_TOKEN_KEY = 'refresh_token';
  static TOKEN_EXPIRES_KEY = 'token_expires_at';
  static refreshPromise = null;

  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  static getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token) {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static setTokenExpiration(expiresIn) {
    const expiresAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
  }

  static getTokenExpiration() {
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  static isTokenExpiringSoon(bufferMinutes = 2) {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return true;
    
    const bufferMs = bufferMinutes * 60 * 1000;
    return Date.now() + bufferMs >= expiresAt;
  }

  static async login(credentials) {
    console.log('🔐 Logging in...');
    const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.success) {
      this.setToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      this.setTokenExpiration(data.expiresIn);
      
      console.log('✅ Login successful');
      console.log(`   User: ${data.user.username} (${data.user.role})`);
      console.log(`   Token expires in: ${data.expiresIn} seconds`);
      
      // Schedule automatic refresh (demo purposes - shorter interval)
      this.scheduleTokenRefresh(data.expiresIn);
      
      return { token: data.accessToken, user: data.user };
    } else {
      throw new Error(data.message || data.error || 'Login failed');
    }
  }

  static async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.removeToken();
      return null;
    }

    try {
      console.log('🔄 Refreshing token...');
      this.refreshPromise = this.performTokenRefresh(refreshToken);
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  static async performTokenRefresh(refreshToken) {
    try {
      const response = await fetch(`${baseURL}/api/enhanced-auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setToken(data.accessToken);
        this.setRefreshToken(data.refreshToken);
        this.setTokenExpiration(data.expiresIn);
        
        console.log('✅ Token refreshed successfully');
        console.log(`   New token expires in: ${data.expiresIn} seconds`);
        
        // Schedule next refresh
        this.scheduleTokenRefresh(data.expiresIn);
        
        return data.accessToken;
      } else {
        throw new Error(data.message || data.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error.message);
      this.removeToken();
      this.notifySessionExpired();
      return null;
    }
  }

  static scheduleTokenRefresh(expiresIn) {
    // Schedule refresh 2 minutes before expiration (or 30 seconds for demo)
    const refreshDelay = Math.max((expiresIn - 30) * 1000, 0);
    
    console.log(`⏰ Token refresh scheduled in ${Math.ceil(refreshDelay / 1000)} seconds`);
    
    setTimeout(() => {
      if (this.isAuthenticated()) {
        console.log('🕐 Auto-refresh triggered by schedule');
        this.refreshToken();
      }
    }, refreshDelay);
  }

  static notifySessionExpired() {
    console.log('🚨 Session expired notification sent');
    window.dispatchEvent(new CustomEvent('auth:sessionExpired', {
      detail: {
        message: 'Your session has expired. Please log in again.',
        action: 'redirect-to-login'
      }
    }));
  }

  static async getValidToken() {
    const currentToken = this.getToken();
    
    if (!currentToken) {
      return null;
    }

    // Check if token is expiring soon and refresh if needed
    if (this.isTokenExpiringSoon()) {
      console.log('🔄 Token is expiring soon, refreshing...');
      return this.refreshToken();
    }

    return currentToken;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static async makeAuthenticatedRequest(url, method = 'GET', body = null) {
    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    if (body && typeof body === 'object') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    const response = await fetch(url, { method, headers, body });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      console.log('🔄 Token expired during request, refreshing...');
      const newToken = await this.refreshToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { method, headers, body });
      }
    }

    return response;
  }

  static async logout() {
    const refreshToken = this.getRefreshToken();
    
    try {
      if (refreshToken) {
        await fetch(`${baseURL}/api/enhanced-auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error.message);
    } finally {
      this.removeToken();
    }
  }
}

/**
 * Demo client application
 */
async function clientDemo() {
  console.log('🚀 Client-side Authentication Integration Demo');
  console.log('==============================================');
  console.log('This demo shows client-side integration with:');
  console.log('- Automatic token refresh before expiration');
  console.log('- Session expiration handling');
  console.log('- Authenticated API requests');
  console.log('- Seamless user experience\n');

  try {
    // Step 1: Login
    console.log('📋 Step 1: User Login');
    await AuthService.login({
      email: '4321@gmail.com',
      password: 'partner123'
    });

    // Step 2: Make authenticated requests
    console.log('\n📋 Step 2: Making Authenticated Requests');
    
    console.log('🌐 Fetching user profile...');
    const profileResponse = await AuthService.makeAuthenticatedRequest(`${baseURL}/api/enhanced-auth/me`);
    const profile = await profileResponse.json();
    console.log('✅ Profile fetched:', profile.user.username);

    console.log('🌐 Fetching partner offers...');
    const offersResponse = await AuthService.makeAuthenticatedRequest(`${baseURL}/api/partner/offers`);
    const offers = await offersResponse.json();
    console.log('✅ Offers fetched:', offers.offers.length, 'offers');

    // Step 3: Demonstrate token refresh (by waiting for scheduled refresh)
    console.log('\n📋 Step 3: Automatic Token Refresh Demo');
    console.log('⏳ Waiting for automatic token refresh (this would happen in background)...');
    
    // Wait a bit to let the scheduled refresh happen (if configured with short delay)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Make another request to show seamless operation
    console.log('🌐 Making another request after potential refresh...');
    const anotherResponse = await AuthService.makeAuthenticatedRequest(`${baseURL}/api/enhanced-auth/me`);
    const anotherProfile = await anotherResponse.json();
    console.log('✅ Request successful after refresh:', anotherProfile.user.username);

    // Step 4: Manual token refresh
    console.log('\n📋 Step 4: Manual Token Refresh');
    const refreshedToken = await AuthService.refreshToken();
    if (refreshedToken) {
      console.log('✅ Manual token refresh successful');
    }

    // Step 5: Logout
    console.log('\n📋 Step 5: User Logout');
    await AuthService.logout();

    console.log('\n✨ Client integration demo completed successfully!');
    console.log('\nKey features demonstrated:');
    console.log('✅ Automatic token refresh before expiration');
    console.log('✅ Seamless API request handling');  
    console.log('✅ Session expiration management');
    console.log('✅ Secure token storage and cleanup');
    console.log('✅ Background token refresh scheduling');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  clientDemo();
}

module.exports = { AuthService, clientDemo };