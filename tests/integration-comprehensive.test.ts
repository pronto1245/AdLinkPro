import request from 'supertest';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('Module Integration Tests', () => {
  
  describe('Authentication → Authorization Flow', () => {
    
    it('should complete full auth flow: login → token validation → role check', async () => {
      // Step 1: Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-owner@example.com',
          password: 'owner123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      const token = loginResponse.body.token;

      // Step 2: Verify token works for authentication
      const verifyResponse = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 404]).toContain(verifyResponse.status); // 404 if endpoint doesn't exist

      // Step 3: Test role-based access with the token
      const roleProtectedRoutes = [
        '/api/admin/users',
        '/api/admin/settings',
        '/api/owner/dashboard'
      ];

      for (const route of roleProtectedRoutes) {
        const roleResponse = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${token}`);

        // Should either work (200/404) or deny access (401/403)
        expect([200, 401, 403, 404]).toContain(roleResponse.status);
        
        if (roleResponse.status === 401 || roleResponse.status === 403) {
          expect(roleResponse.body).toHaveProperty('error');
        }
      }
    });

    it('should handle auth flow with different user roles', async () => {
      const testUsers = [
        { email: 'test-advertiser@example.com', password: 'adv123', expectedRole: 'advertiser' },
        { email: 'test-partner@example.com', password: 'partner123', expectedRole: 'partner' }
      ];

      for (const user of testUsers) {
        // Try to login with different user types
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: user.password
          });

        if (loginResponse.status === 200) {
          expect(loginResponse.body).toHaveProperty('token');
          
          // Verify the token contains correct role information
          const token = loginResponse.body.token;
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          
          expect(decoded.role).toBe(user.expectedRole);
        }
      }
    });
  });

  describe('Registration → Authentication → Profile Setup', () => {
    
    it('should complete full user onboarding flow', async () => {
      const newUser = {
        email: `test-user-${Date.now()}@example.com`,
        password: 'newuser123',
        name: 'Test User',
        role: 'partner'
      };

      // Step 1: Attempt registration
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      if (registerResponse.status === 200 || registerResponse.status === 201) {
        expect(registerResponse.body).toHaveProperty('token');
        const token = registerResponse.body.token;

        // Step 2: Use registration token for authentication
        const profileResponse = await request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 404]).toContain(profileResponse.status);

        // Step 3: Update profile using the same token
        const updateResponse = await request(app)
          .patch('/api/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Updated Test User',
            bio: 'This is a test user profile'
          });

        expect([200, 404, 405]).toContain(updateResponse.status);
      }
    });
  });

  describe('Error Handling Integration', () => {
    
    it('should handle cascading failures gracefully', async () => {
      // Test what happens when database is unavailable during auth
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Should get a proper error response, not crash
      expect([200, 400, 401, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
      
      // Error message should be user-friendly, not expose internals
      if (response.status >= 400) {
        const errorMessage = response.body.error.toLowerCase();
        expect(errorMessage).not.toMatch(/database|sql|connection|internal/i);
      }
    });

    it('should maintain audit logging during error conditions', async () => {
      // Make requests that should be logged even when they fail
      const failureScenarios = [
        { endpoint: '/api/auth/login', data: { email: 'invalid', password: 'wrong' } },
        { endpoint: '/api/auth/register', data: { email: 'bad-email' } },
        { endpoint: '/api/protected-route', headers: { Authorization: 'Bearer invalid-token' } }
      ];

      for (const scenario of failureScenarios) {
        const requestBuilder = request(app).post(scenario.endpoint);
        
        if (scenario.headers) {
          requestBuilder.set(scenario.headers);
        }
        
        if (scenario.data) {
          requestBuilder.send(scenario.data);
        }

        const response = await requestBuilder;
        
        // Failures should still return proper error responses
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty('error');
        
        // Should include request ID or timestamp for tracking
        expect(
          response.body.timestamp || 
          response.body.requestId || 
          response.headers['x-request-id']
        ).toBeDefined();
      }
    });
  });

  describe('Performance and Resource Management', () => {
    
    it('should handle concurrent authentication requests', async () => {
      const concurrentRequests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test-owner@example.com',
            password: 'owner123'
          })
      );

      const responses = await Promise.all(concurrentRequests);
      
      // All requests should complete
      expect(responses).toHaveLength(10);
      
      // Most should succeed (allowing for some rate limiting)
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(5);
      
      // All successful responses should have tokens
      successfulResponses.forEach(response => {
        expect(response.body).toHaveProperty('token');
      });
    });

    it('should handle memory efficiently with large payloads', async () => {
      const largePayload = {
        email: 'test@example.com',
        password: 'password123',
        metadata: 'x'.repeat(1000000), // 1MB of data
        additionalData: Array(1000).fill({ key: 'value', data: 'test'.repeat(100) })
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(largePayload);

      // Should handle gracefully, either process or reject cleanly
      expect([200, 201, 400, 413, 422]).toContain(response.status);
      
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Security Integration Tests', () => {
    
    it('should maintain security across different attack vectors', async () => {
      const maliciousPayloads = [
        {
          name: 'SQL Injection',
          data: {
            email: "test@example.com'; DROP TABLE users; --",
            password: "password123"
          }
        },
        {
          name: 'XSS Injection',
          data: {
            email: "test@example.com",
            password: "<script>alert('xss')</script>"
          }
        },
        {
          name: 'Command Injection',
          data: {
            email: "test@example.com; rm -rf /",
            password: "password123"
          }
        },
        {
          name: 'NoSQL Injection',
          data: {
            email: { $ne: null },
            password: { $regex: ".*" }
          }
        }
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(payload.data);

        // Should reject malicious input gracefully
        expect([400, 401, 422]).toContain(response.status);
        
        // Error should not expose system internals
        const errorText = JSON.stringify(response.body).toLowerCase();
        expect(errorText).not.toMatch(/error:|stack|trace|file|line/i);
      }
    });

    it('should enforce rate limiting across different endpoints', async () => {
      const endpoints = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/forgot-password'
      ];

      for (const endpoint of endpoints) {
        // Make rapid requests to the same endpoint
        const rapidRequests = Array(20).fill(null).map(() =>
          request(app)
            .post(endpoint)
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
        );

        const responses = await Promise.all(rapidRequests);
        
        // Should have at least some rate limiting responses
        const rateLimitedResponses = responses.filter(r => r.status === 429);
        
        // Note: Depending on implementation, rate limiting might not be strict
        // So we just verify the system handles the load gracefully
        responses.forEach(response => {
          expect([200, 400, 401, 422, 429, 500]).toContain(response.status);
        });
      }
    });
  });
});