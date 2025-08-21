import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('Authentication Tests (2FA Disabled)', () => {
  
  describe('POST /api/auth/v2/login - Direct Login Flow', () => {
    
    it('should complete direct login for all users (2FA disabled)', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser', // 2FA is now disabled for all users
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('advertiser');
      expect(response.body.user.role).toBe('ADVERTISER');
      expect(response.body.user.twoFactorEnabled).toBe(false);
      expect(response.body).not.toHaveProperty('requires2FA');
      expect(response.body).not.toHaveProperty('tempToken');
    });

    it('should complete login without 2FA for users without 2FA enabled', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'owner', // This user has 2FA disabled in auth-v2.ts
          password: process.env.OWNER_PASSWORD || 'owner123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('owner');
      expect(response.body.user.role).toBe('OWNER');
      expect(response.body).not.toHaveProperty('requires2FA');
    });

    it('should return 401 for invalid credentials in login flow', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid credentials');
      expect(response.body).not.toHaveProperty('tempToken');
    });

    it('should return 400 for missing credentials in login flow', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('username and password are required');
    });

    it('should accept both email and username for direct login', async () => {
      // Test with email
      const emailResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: process.env.ADVERTISER_EMAIL || '12345@gmail.com',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(emailResponse.status).toBe(200);
      expect(emailResponse.body.success).toBe(true);
      expect(emailResponse.body.token).toBeDefined();

      // Test with username
      const usernameResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(usernameResponse.status).toBe(200);
      expect(usernameResponse.body.success).toBe(true);
      expect(usernameResponse.body.token).toBeDefined();
    });

    it('should return consistent direct login tokens', async () => {
      const response1 = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      const response2 = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
      expect(response1.body.token).toBeDefined();
      expect(response2.body.token).toBeDefined();
      // Tokens will be different due to different timestamps but both should be valid
    });
  });

  describe('POST /api/auth/v2/verify-2fa - Legacy 2FA Endpoint (No longer used)', () => {
    
    it('should return 400 for missing temp token since 2FA is disabled', async () => {
      const response = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          code: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tempToken and code are required');
    });

    it('should return 400 for missing 2FA code since 2FA is disabled', async () => {
      const response = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          tempToken: 'some-temp-token'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tempToken and code are required');
    });

    it('should return 401 for any temp token since none are generated', async () => {
      const response = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          tempToken: 'invalid-temp-token',
          code: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired temporary token');
    });

    // Note: Testing actual 2FA code verification would require mocking the TOTP verification
    // For now, we test the flow structure
    
    it('should return direct login instead of 2FA verification endpoint', async () => {
      // Since 2FA is disabled, this test now verifies direct login behavior
      const loginResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body).not.toHaveProperty('tempToken');
      expect(loginResponse.body).not.toHaveProperty('requires2FA');
    });
  });

  describe('Token Management with Direct Login', () => {
    
    it('should return permanent token immediately for all users', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined(); // Direct token now
      expect(response.body).not.toHaveProperty('requires2FA');
      expect(response.body).not.toHaveProperty('tempToken');
    });

    it('should generate valid JWT tokens for all users', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'owner',
          password: process.env.OWNER_PASSWORD || 'owner123'
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      
      // Verify token is valid JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.sub).toBe('owner-1');
      expect(decoded.role).toBe('OWNER');
      expect(decoded.email).toBeDefined();
      expect(decoded.username).toBe('owner');
    });

    it('should set appropriate token expiration', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'partner',
          password: process.env.PARTNER_PASSWORD || 'partner123'
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Should expire in 7 days
      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBeCloseTo(604800, -2); // 7 days in seconds
    });
  });

  describe('User Role Handling with Direct Login', () => {
    
    it('should handle all user roles with direct login (no 2FA)', async () => {
      const testUsers = [
        { 
          username: 'owner', 
          password: process.env.OWNER_PASSWORD || 'owner123',
          expectedRole: 'OWNER',
          has2FA: false 
        },
        { 
          username: 'advertiser', 
          password: process.env.ADVERTISER_PASSWORD || 'adv123',
          expectedRole: 'ADVERTISER',
          has2FA: false // Changed: 2FA disabled for all users
        },
        { 
          username: 'partner', 
          password: process.env.PARTNER_PASSWORD || 'partner123',
          expectedRole: 'PARTNER',
          has2FA: false 
        }
      ];

      for (const user of testUsers) {
        const response = await request(app)
          .post('/api/auth/v2/login')
          .send({
            username: user.username,
            password: user.password
          });

        expect(response.status).toBe(200);

        // All users should get direct login now (no 2FA)
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.role).toBe(user.expectedRole);
        expect(response.body.user.username).toBe(user.username);
        expect(response.body.user.twoFactorEnabled).toBe(false);
        expect(response.body).not.toHaveProperty('requires2FA');
        expect(response.body).not.toHaveProperty('tempToken');
      }
    });
  });

  describe('Security in Direct Login Flow', () => {
    
    it('should validate input properly in login endpoints', async () => {
      // Test malformed login requests
      const malformedLoginRequests = [
        { endpoint: '/api/auth/v2/login', data: {} },
        { endpoint: '/api/auth/v2/login', data: { username: '' } },
        { endpoint: '/api/auth/v2/login', data: { password: 'test' } }
      ];

      for (const req of malformedLoginRequests) {
        const response = await request(app)
          .post(req.endpoint)
          .send(req.data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }

      // Test legacy 2FA endpoint (should still validate but not be used in flow)
      const legacy2FARequests = [
        { endpoint: '/api/auth/v2/verify-2fa', data: {} },
        { endpoint: '/api/auth/v2/verify-2fa', data: { tempToken: '' } },
        { endpoint: '/api/auth/v2/verify-2fa', data: { code: '123' } }
      ];

      for (const req of legacy2FARequests) {
        const response = await request(app)
          .post(req.endpoint)
          .send(req.data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle concurrent login requests safely', async () => {
      const promises = Array.from({ length: 3 }, () =>
        request(app)
          .post('/api/auth/v2/login')
          .send({
            username: 'advertiser',
            password: process.env.ADVERTISER_PASSWORD || 'adv123'
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed with direct login
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.twoFactorEnabled).toBe(false);
      });

      // Login tokens should be valid (they might be different due to timestamps)
      const tokens = responses.map(r => r.body.token);
      tokens.forEach(token => {
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });
    });
  });
});