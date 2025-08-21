import request from 'supertest';
import { createTestApp } from './testApp';

const app = createTestApp();

/**
 * Comprehensive validation test for the 2FA authentication issue resolution
 * This test ensures that the reported problem is fully resolved across all scenarios
 */
describe('2FA Issue Resolution - Comprehensive Validation', () => {

  describe('Problem Statement Validation', () => {
    test('should not return the problematic response structure from the issue', async () => {
      // This was the exact problem reported:
      // {
      //     "requires2FA": true,
      //     "tempToken": "ba04d6c02f41a7450adcc2968ac9266d2be7d2d4adc46e4c1447f3f48a8756bd",
      //     "message": "Please provide 2FA code"
      // }

      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: 'adv123'
        });

      // Verify the problematic response structure is NOT present
      expect(response.body).not.toHaveProperty('requires2FA');
      expect(response.body).not.toHaveProperty('tempToken');
      expect(response.body).not.toHaveProperty('message');
      
      // Verify we get the correct successful response structure instead
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.twoFactorEnabled).toBe(false);
    });

    test('should allow users to login with only username and password', async () => {
      // This validates the goal: "users can log in with only their username and password when 2FA is not enabled"
      
      const testCases = [
        { username: 'owner', password: 'owner123', expectedRole: 'OWNER' },
        { username: 'advertiser', password: 'adv123', expectedRole: 'ADVERTISER' }, 
        { username: 'partner', password: 'partner123', expectedRole: 'PARTNER' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/v2/login')
          .send({
            username: testCase.username,
            password: testCase.password
          });

        // Should get immediate successful login without 2FA steps
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.role).toBe(testCase.expectedRole);
        expect(response.body.user.twoFactorEnabled).toBe(false);
        
        // Should NOT require 2FA
        expect(response.body).not.toHaveProperty('requires2FA');
        expect(response.body).not.toHaveProperty('tempToken');
        expect(response.body).not.toHaveProperty('message');
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid credentials properly without 2FA confusion', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid credentials');
      
      // Should not suggest 2FA is involved in the error
      expect(response.body).not.toHaveProperty('requires2FA');
      expect(response.body).not.toHaveProperty('tempToken');
    });

    test('should handle missing credentials without 2FA confusion', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('username and password are required');
      
      // Should not suggest 2FA is involved in the error
      expect(response.body).not.toHaveProperty('requires2FA');
      expect(response.body).not.toHaveProperty('tempToken');
    });

    test('legacy 2FA endpoints should fail gracefully', async () => {
      // Since no temp tokens are generated, these endpoints should fail with appropriate errors
      const response = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          tempToken: 'any-token',
          code: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired temporary token');
    });
  });

  describe('JWT Token Validation', () => {
    test('should generate valid JWT tokens that can be used for authentication', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: 'adv123'
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      
      // Verify token structure and content
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      
      expect(decoded.sub).toBe('adv-1');
      expect(decoded.role).toBe('ADVERTISER');
      expect(decoded.email).toBeDefined();
      expect(decoded.username).toBe('advertiser');
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });

    test('should work with /api/me endpoint after login', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'owner',
          password: 'owner123'
        });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.token;

      // Test that the token works with protected endpoints
      const meResponse = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.username).toBe('owner');
      expect(meResponse.body.role).toBe('owner');
    });
  });

  describe('Configuration Respect', () => {
    test('should respect the 2FA configuration settings', async () => {
      // Verify that all users have 2FA disabled as configured
      const users = ['owner', 'advertiser', 'partner'];
      
      for (const username of users) {
        const response = await request(app)
          .post('/api/auth/v2/login')
          .send({
            username: username,
            password: username === 'owner' ? 'owner123' : 
                     username === 'advertiser' ? 'adv123' : 'partner123'
          });

        expect(response.status).toBe(200);
        expect(response.body.user.twoFactorEnabled).toBe(false);
      }
    });
  });

  describe('Consistency Across Auth Routes', () => {
    test('all auth routes should behave consistently', async () => {
      // Test both /api/auth/v2/login and /api/auth/login for consistency
      const v2Response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: 'adv123'
        });

      const v1Response = await request(app)
        .post('/api/auth/login')
        .send({
          email: process.env.ADVERTISER_EMAIL || 'test-advertiser@example.com',
          password: 'adv123'
        });

      // Both should succeed
      expect(v2Response.status).toBe(200);
      expect(v1Response.status).toBe(200);
      
      // Both should provide JWT tokens
      expect(v2Response.body.token).toBeDefined();
      expect(v1Response.body.token).toBeDefined();
      
      // Neither should require 2FA
      expect(v2Response.body).not.toHaveProperty('requires2FA');
      expect(v1Response.body).not.toHaveProperty('twoFactorRequired');
    });
  });
});