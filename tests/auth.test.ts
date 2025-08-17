import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-key';

describe('Enhanced Authentication System', () => {
  let server: any;
  let baseURL: string;

  beforeAll(async () => {
    // Start test server
    const app = require('../server/index').app;
    server = app.listen(0);
    const { port } = server.address();
    baseURL = `http://localhost:${port}`;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Login Endpoint', () => {
    it('should return enhanced error messages for missing credentials', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Authentication credentials required');
      expect(data.message).toBe('Please provide both email/username and password');
      expect(data.code).toBe('MISSING_CREDENTIALS');
    });

    it('should return enhanced error for invalid credentials', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrongpass'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication failed');
      expect(data.code).toBe('INVALID_CREDENTIALS');
      expect(data.message).toContain('The email/username or password you entered is incorrect');
    });

    it('should successfully login with valid credentials', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '4321@gmail.com',
          password: 'partner123'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Authentication successful');
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.expiresIn).toBe(900); // 15 minutes
      expect(data.user).toEqual({
        id: 'partner-1',
        email: '4321@gmail.com',
        username: 'partner',
        role: 'PARTNER'
      });
    });

    it('should work with username instead of email', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'partner',
          password: 'partner123'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
    });
  });

  describe('Refresh Token Endpoint', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Get a refresh token
      const loginResponse = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '4321@gmail.com',
          password: 'partner123'
        })
      });
      const loginData = await loginResponse.json();
      refreshToken = loginData.refreshToken;
    });

    it('should return error for missing refresh token', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Refresh token required');
      expect(data.code).toBe('MISSING_REFRESH_TOKEN');
    });

    it('should return error for invalid refresh token', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'invalid.token.here'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid refresh token');
      expect(data.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should successfully refresh tokens with valid refresh token', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Token refreshed successfully');
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.expiresIn).toBe(900);
      
      // New tokens should be different from the original ones
      expect(data.accessToken).not.toBe(refreshToken);
      expect(data.refreshToken).not.toBe(refreshToken);
    });
  });

  describe('Token Validation Endpoint', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Get an access token
      const loginResponse = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '4321@gmail.com',
          password: 'partner123'
        })
      });
      const loginData = await loginResponse.json();
      accessToken = loginData.accessToken;
    });

    it('should return error for missing authorization header', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/me`);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Authorization header missing');
      expect(data.code).toBe('MISSING_AUTH_HEADER');
    });

    it('should return error for invalid token format', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/me`, {
        headers: {
          'Authorization': 'InvalidToken'
        }
      });
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Authorization header missing');
      expect(data.code).toBe('MISSING_AUTH_HEADER');
    });

    it('should return user data for valid token', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        id: 'partner-1',
        email: '4321@gmail.com',
        username: 'partner',
        role: 'PARTNER'
      });
    });
  });

  describe('Logout Endpoint', () => {
    it('should successfully logout with valid refresh token', async () => {
      // First login to get a refresh token
      const loginResponse = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '4321@gmail.com',
          password: 'partner123'
        })
      });
      const loginData = await loginResponse.json();

      // Then logout
      const response = await fetch(`${baseURL}/api/enhanced-auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginData.refreshToken
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logged out successfully');
    });

    it('should handle logout without refresh token', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logged out successfully');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow normal login attempts', async () => {
      const response = await fetch(`${baseURL}/api/enhanced-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '4321@gmail.com',
          password: 'partner123'
        })
      });

      expect(response.status).toBe(200);
    });

    // Note: Rate limiting tests would be more comprehensive in a real environment
    // where we can simulate multiple failed attempts from the same IP
  });
});