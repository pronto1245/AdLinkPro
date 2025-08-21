import request from 'supertest';
import { createTestApp } from './testApp';

const app = createTestApp();

/**
 * Integration test to verify 2FA is completely disabled
 * This test ensures that the reported issue is resolved
 */
describe('2FA Disabled - Issue Resolution Test', () => {

  test('should NOT return requires2FA for advertiser user', async () => {
    // This was the exact issue reported - advertiser getting requires2FA: true
    const response = await request(app)
      .post('/api/auth/v2/login')
      .send({
        username: 'advertiser',
        password: process.env.ADVERTISER_PASSWORD || 'adv123'
      });

    // Verify the issue is fixed
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.twoFactorEnabled).toBe(false);
    
    // The key assertion - this should NOT be present anymore
    expect(response.body).not.toHaveProperty('requires2FA');
    expect(response.body).not.toHaveProperty('tempToken');
    expect(response.body).not.toHaveProperty('message');
  });

  test('should provide direct login for all user roles', async () => {
    const userRoles = [
      { username: 'owner', password: 'owner123', role: 'OWNER' },
      { username: 'advertiser', password: 'adv123', role: 'ADVERTISER' },
      { username: 'partner', password: 'partner123', role: 'PARTNER' }
    ];

    for (const user of userRoles) {
      const response = await request(app)
        .post('/api/auth/v2/login')
        .send({
          username: user.username,
          password: user.password
        });

      // Each user should get direct login without 2FA
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe(user.role);
      expect(response.body.user.twoFactorEnabled).toBe(false);
      expect(response.body).not.toHaveProperty('requires2FA');
      expect(response.body).not.toHaveProperty('tempToken');

      console.log(`✅ ${user.role} login successful without 2FA`);
    }
  });

  test('should have valid JWT tokens for all users', async () => {
    const response = await request(app)
      .post('/api/auth/v2/login')
      .send({
        username: 'advertiser',
        password: 'adv123'
      });

    expect(response.status).toBe(200);
    const token = response.body.token;
    
    // Verify it's a proper JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    
    expect(decoded.role).toBe('ADVERTISER');
    expect(decoded.username).toBe('advertiser');
    expect(decoded.sub).toBe('adv-1');
  });

  test('original problem case should be resolved', async () => {
    // This simulates the exact scenario from the problem statement
    const response = await request(app)
      .post('/api/auth/v2/login')
      .send({
        username: 'advertiser',
        password: 'adv123'
      });

    // Before fix: { "requires2FA": true, "tempToken": "...", "message": "Please provide 2FA code" }
    // After fix: { "success": true, "token": "...", "user": {...} }
    
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        token: expect.any(String),
        user: expect.objectContaining({
          username: 'advertiser',
          role: 'ADVERTISER',
          twoFactorEnabled: false
        })
      })
    );

    // These properties should NOT exist anymore
    expect(response.body).not.toHaveProperty('requires2FA');
    expect(response.body).not.toHaveProperty('tempToken');
    expect(response.body).not.toHaveProperty('message');
    
    console.log('✅ Original issue resolved - no 2FA required for login');
  });
});