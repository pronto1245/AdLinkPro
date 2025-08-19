import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('Two-Factor Authentication (2FA) Tests', () => {
  
  describe('POST /api/auth/v2/login - 2FA Flow', () => {
    
    it('should initiate 2FA flow for users with 2FA enabled', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser', // This user has 2FA enabled in auth-v2.ts
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(response.status).toBe(200);
      expect(response.body.requires2FA).toBe(true);
      expect(response.body.tempToken).toBeDefined();
      expect(response.body.message).toBe('Please provide 2FA code');
      expect(response.body).not.toHaveProperty('token'); // Should not return final token yet
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

    it('should return 401 for invalid credentials in 2FA flow', async () => {
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

    it('should return 400 for missing credentials in 2FA flow', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('username and password are required');
    });

    it('should accept both email and username for 2FA login', async () => {
      // Test with email
      const emailResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: process.env.ADVERTISER_EMAIL || '12345@gmail.com',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(emailResponse.status).toBe(200);
      expect(emailResponse.body.requires2FA).toBe(true);

      // Test with username
      const usernameResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(usernameResponse.status).toBe(200);
      expect(usernameResponse.body.requires2FA).toBe(true);
    });

    it('should generate different temp tokens for each 2FA request', async () => {
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
      expect(response1.body.tempToken).not.toBe(response2.body.tempToken);
    });
  });

  describe('POST /api/auth/v2/verify-2fa - 2FA Verification', () => {
    
    it('should return 400 for missing temp token', async () => {
      const response = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          code: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tempToken and code are required');
    });

    it('should return 400 for missing 2FA code', async () => {
      const response = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          tempToken: 'some-temp-token'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tempToken and code are required');
    });

    it('should return 401 for invalid temp token', async () => {
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
    
    it('should handle 2FA verification endpoint structure', async () => {
      // First get a temp token
      const loginResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(loginResponse.status).toBe(200);
      const tempToken = loginResponse.body.tempToken;

      // Try to verify with invalid code (will fail, but tests endpoint structure)
      const verifyResponse = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          tempToken: tempToken,
          code: '000000' // Invalid code
        });

      // Should return 401 for invalid code, not 404 or 500
      expect(verifyResponse.status).toBe(401);
      expect(verifyResponse.body).toHaveProperty('error');
    });
  });

  describe('Token Management in 2FA Flow', () => {
    
    it('should not return permanent token before 2FA verification', async () => {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(response.status).toBe(200);
      expect(response.body.requires2FA).toBe(true);
      expect(response.body.tempToken).toBeDefined();
      expect(response.body).not.toHaveProperty('token'); // No permanent token yet
    });

    it('should generate valid JWT tokens for non-2FA users', async () => {
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

  describe('User Role Handling in 2FA', () => {
    
    it('should handle different user roles correctly in 2FA flow', async () => {
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
          has2FA: true 
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

        if (user.has2FA) {
          expect(response.body.requires2FA).toBe(true);
          expect(response.body.tempToken).toBeDefined();
        } else {
          expect(response.body.success).toBe(true);
          expect(response.body.token).toBeDefined();
          expect(response.body.user.role).toBe(user.expectedRole);
          expect(response.body.user.username).toBe(user.username);
        }
      }
    });
  });

  describe('Security in 2FA Flow', () => {
    
    it('should validate input properly in 2FA endpoints', async () => {
      // Test malformed requests
      const malformedRequests = [
        { endpoint: '/api/auth/v2/login', data: {} },
        { endpoint: '/api/auth/v2/login', data: { username: '' } },
        { endpoint: '/api/auth/v2/login', data: { password: 'test' } },
        { endpoint: '/api/auth/v2/verify-2fa', data: {} },
        { endpoint: '/api/auth/v2/verify-2fa', data: { tempToken: '' } },
        { endpoint: '/api/auth/v2/verify-2fa', data: { code: '123' } }
      ];

      for (const req of malformedRequests) {
        const response = await request(app)
          .post(req.endpoint)
          .send(req.data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle concurrent 2FA requests safely', async () => {
      const promises = Array.from({ length: 3 }, () =>
        request(app)
          .post('/api/auth/v2/login')
          .send({
            username: 'advertiser',
            password: process.env.ADVERTISER_PASSWORD || 'adv123'
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed and return different temp tokens
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.requires2FA).toBe(true);
        expect(response.body.tempToken).toBeDefined();
      });

      // Temp tokens should be unique
      const tempTokens = responses.map(r => r.body.tempToken);
      const uniqueTokens = [...new Set(tempTokens)];
      expect(uniqueTokens.length).toBe(tempTokens.length);
    });
  });
});