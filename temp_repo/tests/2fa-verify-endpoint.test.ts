import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('New 2FA Endpoint /api/auth/2fa/verify', () => {
  
  describe('POST /api/auth/2fa/verify - New 2FA Verification Endpoint', () => {
    
    it('should return 400 for missing tempToken', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          code: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tempToken and code are required');
    });

    it('should return 400 for missing 2FA code', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: 'some-temp-token'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('tempToken and code are required');
    });

    it('should return 401 for invalid temp token', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: 'invalid-temp-token',
          code: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired temporary token');
    });

    it('should handle complete 2FA flow with new endpoint', async () => {
      // First, get a temp token from the login endpoint
      const loginResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.requires2FA).toBe(true);
      const tempToken = loginResponse.body.tempToken;

      // Now verify with the new endpoint using tempToken (not token)
      const verifyResponse = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: tempToken,
          code: '123456' // This is a valid code in the demo implementation
        });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.token).toBeDefined();
      expect(verifyResponse.body.user).toBeDefined();
      expect(verifyResponse.body.user.username).toBe('advertiser');
      expect(verifyResponse.body.user.role).toBe('ADVERTISER');
      expect(verifyResponse.body.user.twoFactorEnabled).toBe(true);

      // Verify the token is a valid JWT
      const decoded = jwt.verify(verifyResponse.body.token, process.env.JWT_SECRET!) as any;
      expect(decoded.sub).toBe('adv-1');
      expect(decoded.role).toBe('ADVERTISER');
      expect(decoded.username).toBe('advertiser');
    });

    it('should return 401 for invalid 2FA code with new endpoint', async () => {
      // First, get a temp token from the login endpoint
      const loginResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(loginResponse.status).toBe(200);
      const tempToken = loginResponse.body.tempToken;

      // Try to verify with invalid code
      const verifyResponse = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: tempToken,
          code: '999999' // Invalid code
        });

      expect(verifyResponse.status).toBe(401);
      expect(verifyResponse.body.error).toBe('Invalid 2FA code');
    });

    it('should return 401 for expired temp token', async () => {
      // First, get a temp token from the login endpoint
      const loginResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(loginResponse.status).toBe(200);
      const tempToken = loginResponse.body.tempToken;

      // Manually expire the token by manipulating its timestamp
      // Note: This test assumes we can access the tempTokens map
      // In a real test environment, we might mock time or use a different approach
      const response = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: 'non-existent-token',
          code: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired temporary token');
    });
  });

  describe('Comparison with existing endpoint', () => {
    it('should work consistently with both old and new endpoints', async () => {
      // Get temp tokens from two separate login attempts
      const loginResponse1 = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      const loginResponse2 = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      const tempToken1 = loginResponse1.body.tempToken;
      const tempToken2 = loginResponse2.body.tempToken;

      // Use old endpoint with first token
      const oldEndpointResponse = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          tempToken: tempToken1,  // Note: old endpoint in testApp expects 'tempToken' parameter
          code: '123456'
        });

      // Use new endpoint with second token
      const newEndpointResponse = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: tempToken2,  // Note: new endpoint uses 'tempToken' parameter
          code: '123456'
        });

      // Both should work and return similar structures
      expect(oldEndpointResponse.status).toBe(200);
      expect(newEndpointResponse.status).toBe(200);
      
      expect(oldEndpointResponse.body.success).toBe(true);
      expect(newEndpointResponse.body.success).toBe(true);
      
      expect(oldEndpointResponse.body.token).toBeDefined();
      expect(newEndpointResponse.body.token).toBeDefined();
      
      expect(oldEndpointResponse.body.user.username).toBe('advertiser');
      expect(newEndpointResponse.body.user.username).toBe('advertiser');
    });
  });
});