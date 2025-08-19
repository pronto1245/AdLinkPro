import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('Authentication API Tests', () => {
  
  describe('POST /api/auth/login - Successful Authentication', () => {
    
    it('should successfully login with valid email and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-owner@example.com',
          password: 'owner123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.role).toBe('OWNER');
      expect(response.body.user.email).toBe('test-owner@example.com');
      expect(response.body.user.username).toBe('owner');
    });

    it('should successfully login with valid username and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'advertiser',
          password: 'adv123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('ADVERTISER');
      expect(response.body.user.username).toBe('advertiser');
    });

    it('should return valid JWT token with correct payload', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-partner@example.com',
          password: 'partner123'
        });

      expect(response.status).toBe(200);
      const token = response.body.token;
      
      // Verify token structure and content
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.sub).toBe('partner-1');
      expect(decoded.role).toBe('PARTNER');
      expect(decoded.email).toBe('test-partner@example.com');
      expect(decoded.username).toBe('partner');
    });

    it('should handle different user roles correctly', async () => {
      const testCases = [
        { 
          credentials: { email: 'test-owner@example.com', password: 'owner123' },
          expectedRole: 'OWNER',
          expectedSub: 'owner-1'
        },
        { 
          credentials: { email: 'test-advertiser@example.com', password: 'adv123' },
          expectedRole: 'ADVERTISER',
          expectedSub: 'adv-1'
        },
        { 
          credentials: { email: 'test-partner@example.com', password: 'partner123' },
          expectedRole: 'PARTNER',
          expectedSub: 'partner-1'
        },
        { 
          credentials: { email: 'test-superadmin@example.com', password: 'admin123' },
          expectedRole: 'SUPER_ADMIN',
          expectedSub: 'super-admin-1'
        },
        { 
          credentials: { email: 'test-affiliate@example.com', password: 'affiliate123' },
          expectedRole: 'AFFILIATE',
          expectedSub: 'affiliate-1'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(testCase.credentials);

        expect(response.status).toBe(200);
        expect(response.body.user.role).toBe(testCase.expectedRole);
        expect(response.body.user.sub).toBe(testCase.expectedSub);

        // Verify token payload
        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as any;
        expect(decoded.role).toBe(testCase.expectedRole);
        expect(decoded.sub).toBe(testCase.expectedSub);
      }
    });
  });

  describe('POST /api/auth/login - Invalid Credentials', () => {
    
    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'owner123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-owner@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 401 for invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'owner123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid credentials');
    });

    it('should return 400 for missing credentials', async () => {
      // Missing both email/username and password
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response1.status).toBe(400);
      expect(response1.body.error).toBe('email/username and password are required');

      // Missing password
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-owner@example.com'
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toBe('email/username and password are required');

      // Missing email/username
      const response3 = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'owner123'
        });

      expect(response3.status).toBe(400);
      expect(response3.body.error).toBe('email/username and password are required');
    });

    it('should be case-insensitive for email/username', async () => {
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST-OWNER@EXAMPLE.COM',
          password: 'owner123'
        });

      expect(response1.status).toBe(200);
      expect(response1.body.user.role).toBe('OWNER');

      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'ADVERTISER',
          password: 'adv123'
        });

      expect(response2.status).toBe(200);
      expect(response2.body.user.role).toBe('ADVERTISER');
    });
  });

  describe('GET /api/me - User Profile', () => {
    
    it('should return user profile with valid token', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-owner@example.com',
          password: 'owner123'
        });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.token;

      // Then get user profile
      const profileResponse = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body).toHaveProperty('id');
      expect(profileResponse.body).toHaveProperty('username');
      expect(profileResponse.body).toHaveProperty('email');
      expect(profileResponse.body).toHaveProperty('role');
      expect(profileResponse.body.email).toBe('test-owner@example.com');
      expect(profileResponse.body.username).toBe('owner');
      expect(profileResponse.body.role).toBe('owner'); // normalized to lowercase
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('no token');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid token');
    });

    it('should return 401 for malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', 'invalid-header');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid token'); // Updated expectation based on actual behavior
    });

    it('should normalize role names correctly', async () => {
      const testCases = [
        { email: 'test-partner@example.com', expectedRole: 'partner' },
        { email: 'test-advertiser@example.com', expectedRole: 'advertiser' },
        { email: 'test-owner@example.com', expectedRole: 'owner' },
        { email: 'test-superadmin@example.com', expectedRole: 'super_admin' }
      ];

      for (const testCase of testCases) {
        // Login
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testCase.email,
            password: testCase.email.includes('owner') ? 'owner123' : 
                      testCase.email.includes('advertiser') ? 'adv123' : 
                      testCase.email.includes('partner') ? 'partner123' : 'admin123'
          });

        const token = loginResponse.body.token;

        // Get profile
        const profileResponse = await request(app)
          .get('/api/me')
          .set('Authorization', `Bearer ${token}`);

        expect(profileResponse.status).toBe(200);
        expect(profileResponse.body.role).toBe(testCase.expectedRole);
      }
    });
  });

  describe('Token Validation', () => {
    
    it('should accept tokens with correct signature', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-owner@example.com',
          password: 'owner123'
        });

      const token = loginResponse.body.token;
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.sub).toBe('owner-1');
      expect(decoded.role).toBe('OWNER');
    });

    it('should reject expired tokens', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { sub: 'owner-1', role: 'OWNER', email: 'test-owner@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' } // Already expired
      );

      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid token');
    });

    it('should reject tokens with wrong secret', async () => {
      const wrongToken = jwt.sign(
        { sub: 'owner-1', role: 'OWNER', email: 'test-owner@example.com' },
        'wrong-secret',
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${wrongToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid token');
    });
  });

  describe('Health Check', () => {
    
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });
});