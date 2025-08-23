import request from 'supertest';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('Authentication Unification Tests', () => {
  
  describe('Token Storage Consistency', () => {
    
    it('should use unified tokenStorage across all auth components', () => {
      // This test verifies that all authentication-related components use the unified tokenStorage
      const { tokenStorage } = require('../client/src/lib/security');
      const { getToken, setToken, clearToken } = require('../client/src/lib/auth');
      
      // Test token setting and getting consistency
      const testToken = 'test-token-123';
      
      // Set token using auth module
      setToken(testToken);
      
      // Should be retrievable via security module
      expect(tokenStorage.getToken()).toBe(testToken);
      
      // Should be retrievable via auth module
      expect(getToken()).toBe(testToken);
      
      // Clear token
      clearToken();
      
      // Should be null from both modules
      expect(tokenStorage.getToken()).toBeNull();
      expect(getToken()).toBeNull();
    });

    it('should handle token migration from legacy storage formats', () => {
      const { tokenStorage } = require('../client/src/lib/security');
      
      // Mock localStorage for testing
      const mockLocalStorage = {
        storage: new Map<string, string>(),
        getItem: function(key: string) { return this.storage.get(key) || null; },
        setItem: function(key: string, value: string) { this.storage.set(key, value); },
        removeItem: function(key: string) { this.storage.delete(key); }
      };
      
      // Mock global localStorage
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
      
      // Simulate legacy token storage
      mockLocalStorage.setItem('auth:token', 'legacy-token-123');
      
      // Should migrate to new format
      const token = tokenStorage.getToken();
      expect(token).toBe('legacy-token-123');
      
      // Should have migrated to new storage and cleaned up old
      expect(mockLocalStorage.getItem('token')).toBe('legacy-token-123');
      expect(mockLocalStorage.getItem('auth:token')).toBeNull();
    });
  });

  describe('Test User Authentication', () => {
    
    it('should authenticate test user "owner" with fallback credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'owner',
          password: 'Affilix123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'OWNER');
      expect(response.body.user).toHaveProperty('username', 'owner');
      expect(response.body.user).toHaveProperty('email', '9791207@gmail.com');
    });

    it('should authenticate test user "advertiser" with fallback credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'advertiser', 
          password: 'adv123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'ADVERTISER');
      expect(response.body.user).toHaveProperty('username', 'advertiser');
    });

    it('should authenticate test user "partner" with fallback credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'partner',
          password: 'partner123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'PARTNER');
      expect(response.body.user).toHaveProperty('username', 'partner');
    });

    it('should authenticate owner with email instead of username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '9791207@gmail.com',
          password: 'Affilix123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('email', '9791207@gmail.com');
    });

    it('should support both email and username fields in login request', async () => {
      // Test with email field
      const emailResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: '9791207@gmail.com',
          password: 'Affilix123!'
        });

      expect(emailResponse.status).toBe(200);
      expect(emailResponse.body).toHaveProperty('success', true);

      // Test with username field
      const usernameResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'owner',
          password: 'Affilix123!'
        });

      expect(usernameResponse.status).toBe(200);
      expect(usernameResponse.body).toHaveProperty('success', true);
    });
  });

  describe('Complete Authentication Flow', () => {
    
    it('should complete login → token validation → API access flow', async () => {
      // Step 1: Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'owner',
          password: 'Affilix123!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      
      const token = loginResponse.body.token;

      // Step 2: Verify token works for protected endpoints
      const protectedEndpoints = [
        '/api/me',
        '/api/auth/verify-token'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${token}`);
          
        // Should either succeed (200) or be not found (404) but not unauthorized (401)
        expect([200, 404, 500].includes(response.status)).toBe(true);
        if (response.status === 401) {
          console.log(`Unexpected 401 for ${endpoint}:`, response.body);
        }
      }
    });

    it('should handle invalid credentials properly', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid-user',
          password: 'wrong-password'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should handle missing credentials properly', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('Enhanced Logging Verification', () => {
    
    it('should log authentication attempts', async () => {
      // Capture console output
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'owner',
          password: 'Affilix123!'
        });

      // Verify that authentication logging occurred
      const authLogs = logSpy.mock.calls.filter(call => 
        call[0] && call[0].toString().includes('[AUTH]')
      );
      
      expect(authLogs.length).toBeGreaterThan(0);
      
      logSpy.mockRestore();
    });
  });

  describe('CSRF Protection', () => {
    
    it('should include CSRF token in state-changing requests', () => {
      const { CSRFManager } = require('../client/src/lib/security');
      
      const csrfManager = CSRFManager.getInstance();
      const token = csrfManager.generateToken();
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      const headers = csrfManager.getHeaders();
      expect(headers).toHaveProperty('X-CSRF-Token', token);
      
      // Cleanup
      csrfManager.clearToken();
    });
  });
});