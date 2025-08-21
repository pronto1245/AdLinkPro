import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('Legacy 2FA Endpoint /api/auth/2fa/verify (No Longer Used)', () => {
  
  describe('POST /api/auth/2fa/verify - Legacy 2FA Verification Endpoint', () => {
    
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

    it('should show direct login behavior instead of 2FA flow', async () => {
      // Since 2FA is disabled, login now returns direct tokens
      const loginResponse = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: 'advertiser',
          password: process.env.ADVERTISER_PASSWORD || 'adv123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user.twoFactorEnabled).toBe(false);
      expect(loginResponse.body).not.toHaveProperty('requires2FA');
      expect(loginResponse.body).not.toHaveProperty('tempToken');

      // Verify the token is a valid JWT
      const decoded = jwt.verify(loginResponse.body.token, process.env.JWT_SECRET!) as any;
      expect(decoded.sub).toBe('adv-1');
      expect(decoded.role).toBe('ADVERTISER');
      expect(decoded.username).toBe('advertiser');
    });

    it('should return 401 for any token since 2FA is disabled', async () => {
      // Since 2FA is disabled, any attempt to use 2FA verify should fail
      const verifyResponse = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: 'any-token',
          code: '999999'
        });

      expect(verifyResponse.status).toBe(401);
      expect(verifyResponse.body.error).toBe('Invalid or expired temporary token');
    });

    it('should return 401 for any temp token since none are generated', async () => {
      // Since 2FA is disabled, no temp tokens are generated, so any token should be invalid
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

  describe('Comparison with Direct Login', () => {
    it('should show that 2FA endpoints are no longer needed', async () => {
      // With 2FA disabled, login provides direct tokens
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

      // Both should provide direct login without 2FA
      expect(loginResponse1.status).toBe(200);
      expect(loginResponse2.status).toBe(200);
      expect(loginResponse1.body.success).toBe(true);
      expect(loginResponse2.body.success).toBe(true);
      expect(loginResponse1.body.token).toBeDefined();
      expect(loginResponse2.body.token).toBeDefined();
      expect(loginResponse1.body).not.toHaveProperty('tempToken');
      expect(loginResponse2.body).not.toHaveProperty('tempToken');

      // Trying to use the 2FA endpoints should fail since no temp tokens exist
      const oldEndpointResponse = await request(app)
        .post('/api/auth/v2/verify-2fa')
        .send({
          tempToken: 'no-temp-token-exists',
          code: '123456'
        });

      const newEndpointResponse = await request(app)
        .post('/api/auth/2fa/verify')
        .send({
          tempToken: 'no-temp-token-exists',
          code: '123456'
        });

      // Both 2FA endpoints should return 401 since no temp tokens are generated
      expect(oldEndpointResponse.status).toBe(401);
      expect(newEndpointResponse.status).toBe(401);
    });
  });
});