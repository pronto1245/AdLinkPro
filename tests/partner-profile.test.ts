import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from './testApp';

const app = createTestApp();

// Helper to get auth token for partner
const getPartnerToken = async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test-partner@example.com',
      password: 'partner123'
    });
  return response.body.token;
};

describe('Partner Profile API Tests', () => {

  describe('GET /api/partner/profile - Profile Retrieval', () => {
    
    it('should successfully retrieve partner profile with valid token', async () => {
      const token = await getPartnerToken();
      
      const response = await request(app)
        .get('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'test-partner@example.com');
      expect(response.body).toHaveProperty('role', 'AFFILIATE');
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/partner/profile');

      expect(response.status).toBe(401);
    });

    it('should return 403 with non-partner role token', async () => {
      const advertiserResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'advertiser',
          password: 'adv123'
        });
      
      const response = await request(app)
        .get('/api/partner/profile')
        .set('Authorization', `Bearer ${advertiserResponse.body.token}`);

      expect(response.status).toBe(403);
    });

  });

  describe('PATCH /api/partner/profile - Profile Updates', () => {

    it('should successfully update basic profile information', async () => {
      const token = await getPartnerToken();
      
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        country: 'US',
        timezone: 'America/New_York',
        currency: 'USD'
      };

      const response = await request(app)
        .patch('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('lastName', 'Doe');
      expect(response.body).toHaveProperty('company', 'Test Company');
    });

    it('should validate and format Telegram username correctly', async () => {
      const token = await getPartnerToken();
      
      const updateData = {
        telegram: 'test_user123'
      };

      const response = await request(app)
        .patch('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('telegram', '@test_user123');
    });

    it('should handle telegram username with @ prefix', async () => {
      const token = await getPartnerToken();
      
      const updateData = {
        telegram: '@test_user456'
      };

      const response = await request(app)
        .patch('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('telegram', '@test_user456');
    });

    it('should reject invalid Telegram username format', async () => {
      const token = await getPartnerToken();
      
      const updateData = {
        telegram: 'invalid-username!'
      };

      const response = await request(app)
        .patch('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid Telegram username');
    });

    it('should reject whitespace-only names', async () => {
      const token = await getPartnerToken();
      
      const updateData = {
        firstName: '   ',
        lastName: '   '
      };

      const response = await request(app)
        .patch('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot be whitespace only');
    });

    it('should allow empty telegram field', async () => {
      const token = await getPartnerToken();
      
      const updateData = {
        telegram: ''
      };

      const response = await request(app)
        .patch('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('telegram', '');
    });

  });

  describe('POST /api/partner/profile/change-password - Password Changes', () => {

    it('should successfully change password with valid current password', async () => {
      const token = await getPartnerToken();
      
      const passwordData = {
        currentPassword: 'partner123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/partner/profile/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      
      // Verify we can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-partner@example.com',
          password: 'newpassword123'
        });

      expect(loginResponse.status).toBe(200);
      
      // Reset password back
      const resetResponse = await request(app)
        .post('/api/partner/profile/change-password')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({
          currentPassword: 'newpassword123',
          newPassword: 'partner123'
        });
      
      expect(resetResponse.status).toBe(200);
    });

    it('should reject password change with invalid current password', async () => {
      const token = await getPartnerToken();
      
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/partner/profile/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid current password');
    });

    it('should reject password change with short new password', async () => {
      const token = await getPartnerToken();
      
      const passwordData = {
        currentPassword: 'partner123',
        newPassword: '123'
      };

      const response = await request(app)
        .post('/api/partner/profile/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be at least 6 characters');
    });

    it('should require both current and new password', async () => {
      const token = await getPartnerToken();
      
      const response = await request(app)
        .post('/api/partner/profile/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

  });

});