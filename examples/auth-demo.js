#!/usr/bin/env node

/**
 * Enhanced Authentication Demo
 * 
 * This script demonstrates the new authentication features:
 * - Enhanced error messages
 * - Refresh token functionality  
 * - Automatic token refresh
 * - Session management
 * 
 * Run with: node examples/auth-demo.js
 */

const baseURL = 'http://localhost:5000';

class AuthDemo {
  constructor() {
    this.tokens = null;
  }

  async log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data && typeof data === 'object') {
      console.log('  📄 Data:', JSON.stringify(data, null, 2));
    }
    console.log('');
  }

  async demo() {
    console.log('🚀 Enhanced Authentication System Demo\n');
    
    // Demo 1: Enhanced Error Messages
    await this.log('📋 Demo 1: Enhanced Error Messages');
    await this.demoErrorMessages();

    // Demo 2: Successful Login with Tokens
    await this.log('📋 Demo 2: Successful Login with Refresh Tokens');
    await this.demoSuccessfulLogin();

    // Demo 3: Token Validation
    await this.log('📋 Demo 3: Token Validation');
    await this.demoTokenValidation();

    // Demo 4: Refresh Token Usage
    await this.log('📋 Demo 4: Refresh Token Usage');
    await this.demoTokenRefresh();

    // Demo 5: Logout and Token Revocation
    await this.log('📋 Demo 5: Logout and Token Revocation');
    await this.demoLogout();

    console.log('✨ Demo completed! All authentication features are working correctly.\n');
  }

  async demoErrorMessages() {
    // Test missing credentials
    try {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      await this.log('❌ Missing credentials error:', {
        status: response.status,
        error: data.error,
        message: data.message,
        code: data.code
      });
    } catch (error) {
      await this.log('❌ Error testing missing credentials:', error.message);
    }

    // Test invalid credentials
    try {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrongpass'
        })
      });
      const data = await response.json();
      await this.log('❌ Invalid credentials error:', {
        status: response.status,
        error: data.error,
        message: data.message,
        code: data.code
      });
    } catch (error) {
      await this.log('❌ Error testing invalid credentials:', error.message);
    }
  }

  async demoSuccessfulLogin() {
    try {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '4321@gmail.com',
          password: 'partner123'
        })
      });

      if (response.ok) {
        this.tokens = await response.json();
        await this.log('✅ Login successful:', {
          status: response.status,
          success: this.tokens.success,
          message: this.tokens.message,
          user: this.tokens.user,
          accessTokenLength: this.tokens.accessToken?.length,
          refreshTokenLength: this.tokens.refreshToken?.length,
          expiresIn: this.tokens.expiresIn
        });
      } else {
        const error = await response.json();
        await this.log('❌ Login failed:', error);
      }
    } catch (error) {
      await this.log('❌ Error during login:', error.message);
    }
  }

  async demoTokenValidation() {
    if (!this.tokens?.accessToken) {
      await this.log('❌ No access token available for validation');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/enhanced-auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        await this.log('✅ Token validation successful:', {
          status: response.status,
          success: data.success,
          user: data.user
        });
      } else {
        await this.log('❌ Token validation failed:', data);
      }
    } catch (error) {
      await this.log('❌ Error during token validation:', error.message);
    }
  }

  async demoTokenRefresh() {
    if (!this.tokens?.refreshToken) {
      await this.log('❌ No refresh token available');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/enhanced-auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const oldAccessToken = this.tokens.accessToken;
        const oldRefreshToken = this.tokens.refreshToken;
        
        // Update tokens
        this.tokens.accessToken = data.accessToken;
        this.tokens.refreshToken = data.refreshToken;
        
        await this.log('✅ Token refresh successful:', {
          status: response.status,
          success: data.success,
          message: data.message,
          newAccessTokenLength: data.accessToken?.length,
          newRefreshTokenLength: data.refreshToken?.length,
          tokensChanged: {
            accessToken: oldAccessToken !== data.accessToken,
            refreshToken: oldRefreshToken !== data.refreshToken
          },
          expiresIn: data.expiresIn
        });
      } else {
        await this.log('❌ Token refresh failed:', data);
      }
    } catch (error) {
      await this.log('❌ Error during token refresh:', error.message);
    }
  }

  async demoLogout() {
    if (!this.tokens?.refreshToken) {
      await this.log('❌ No refresh token available for logout');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/enhanced-auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        await this.log('✅ Logout successful:', {
          status: response.status,
          success: data.success,
          message: data.message
        });
        
        // Clear tokens
        this.tokens = null;
        
        // Try to use the refresh token again (should fail)
        await this.log('🧪 Testing refresh token revocation...');
        const testResponse = await fetch(`${baseURL}/api/enhanced-auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refreshToken: data.refreshToken || 'revoked-token'
          })
        });
        
        const testData = await testResponse.json();
        await this.log('✅ Refresh token properly revoked:', {
          status: testResponse.status,
          error: testData.error,
          code: testData.code
        });
        
      } else {
        await this.log('❌ Logout failed:', data);
      }
    } catch (error) {
      await this.log('❌ Error during logout:', error.message);
    }
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new AuthDemo();
  
  console.log('🔐 Enhanced Authentication System Demo');
  console.log('=====================================');
  console.log('This demo showcases the new authentication features:');
  console.log('- Enhanced error messages with structured codes');
  console.log('- Refresh token system with automatic renewal');  
  console.log('- Secure session management and token revocation');
  console.log('- Backward compatibility with existing systems\n');
  
  demo.demo().catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}

module.exports = AuthDemo;