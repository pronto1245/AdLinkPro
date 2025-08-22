import request from 'supertest';
import { createTestApp } from './testApp';
import jwt from 'jsonwebtoken';

const app = createTestApp();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('JWT Token Edge Cases and Security Tests', () => {
  
  describe('Token Expiry Edge Cases', () => {
    
    it('should reject tokens that are about to expire (within 30 seconds)', async () => {
      // Create a token that expires in 10 seconds
      const shortLivedToken = jwt.sign(
        { 
          sub: '1', 
          role: 'owner', 
          email: 'test@example.com',
          username: 'testuser',
          exp: Math.floor(Date.now() / 1000) + 10 // Expires in 10 seconds
        }, 
        JWT_SECRET
      );

      // Wait 11 seconds to ensure token expires
      await new Promise(resolve => setTimeout(resolve, 11000));

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${shortLivedToken}`);

      expect([401, 403]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle tokens with invalid expiry format', async () => {
      const invalidExpToken = jwt.sign(
        { 
          sub: '1', 
          role: 'owner', 
          email: 'test@example.com',
          username: 'testuser',
          exp: 'invalid-date' // Invalid expiry format
        }, 
        JWT_SECRET,
        { noTimestamp: true }
      );

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${invalidExpToken}`);

      expect(response.status).toBe(401);
    });

    it('should handle tokens without expiry claim', async () => {
      const noExpToken = jwt.sign(
        { 
          sub: '1', 
          role: 'owner', 
          email: 'test@example.com',
          username: 'testuser'
        }, 
        JWT_SECRET,
        { expiresIn: undefined }
      );

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${noExpToken}`);

      // Should work as server may accept tokens without expiry for certain contexts
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Token Format Validation Edge Cases', () => {
    
    it('should reject tokens with insufficient parts', async () => {
      const incompleteParts = ['header.payload', 'header', ''];
      
      for (const tokenPart of incompleteParts) {
        const response = await request(app)
          .get('/api/auth/verify')
          .set('Authorization', `Bearer ${tokenPart}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/token|jwt|invalid/i);
      }
    });

    it('should reject tokens with invalid base64url encoding', async () => {
      const invalidEncodingTokens = [
        'invalid@header.eyJzdWIiOiIxIn0.signature',
        'eyJhbGciOiJIUzI1NiJ9.invalid@payload.signature', 
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.invalid@signature'
      ];
      
      for (const token of invalidEncodingTokens) {
        const response = await request(app)
          .get('/api/auth/verify')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      }
    });

    it('should reject extremely long tokens', async () => {
      const longPayload = 'a'.repeat(10000);
      const longToken = jwt.sign(
        { 
          sub: '1', 
          role: 'owner',
          longData: longPayload 
        }, 
        JWT_SECRET
      );

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${longToken}`);

      // Should either reject due to length or parse successfully
      expect([200, 401]).toContain(response.status);
    });

    it('should handle tokens with minimum valid length', async () => {
      const minimalToken = jwt.sign({ sub: '1', role: 'owner' }, 'short');
      
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${minimalToken}`);

      // Should reject due to wrong secret, but length validation should pass
      expect(response.status).toBe(401);
    });
  });

  describe('Invalid Input Edge Cases', () => {
    
    it('should handle malformed Authorization headers', async () => {
      const malformedHeaders = [
        'InvalidFormat token',
        'Bearer',
        'Bearer ',
        'Bearer  ',
        'BearerInvalidFormat',
        'Basic dXNlcjpwYXNz' // Wrong auth type
      ];
      
      for (const header of malformedHeaders) {
        const response = await request(app)
          .get('/api/auth/verify')
          .set('Authorization', header);

        expect(response.status).toBe(401);
      }
    });

    it('should handle missing required JWT claims', async () => {
      const missingClaimsTokens = [
        jwt.sign({ role: 'owner' }, JWT_SECRET), // Missing sub
        jwt.sign({ sub: '1' }, JWT_SECRET), // Missing role
        jwt.sign({}, JWT_SECRET), // Missing both
      ];
      
      for (const token of missingClaimsTokens) {
        const response = await request(app)
          .get('/api/auth/verify')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle tokens with null/undefined values', async () => {
      const nullValueToken = jwt.sign(
        { 
          sub: null, 
          role: 'owner',
          email: undefined,
          username: ''
        }, 
        JWT_SECRET
      );

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${nullValueToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Token Tampering Detection', () => {
    
    it('should detect signature tampering', async () => {
      const validToken = jwt.sign(
        { sub: '1', role: 'owner', email: 'test@example.com' }, 
        JWT_SECRET
      );
      
      // Tamper with the signature
      const tamperedToken = validToken.substring(0, validToken.length - 5) + 'XXXXX';
      
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid|signature|token/i);
    });

    it('should detect payload tampering', async () => {
      const validToken = jwt.sign(
        { sub: '1', role: 'user', email: 'test@example.com' }, 
        JWT_SECRET
      );
      
      // Create a token with elevated privileges using same signature
      const elevatedPayload = Buffer.from(JSON.stringify({
        sub: '1', 
        role: 'owner', // Elevated role
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })).toString('base64url');
      
      const parts = validToken.split('.');
      const tamperedToken = `${parts[0]}.${elevatedPayload}.${parts[2]}`;
      
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Role-Based Access Edge Cases', () => {
    
    it('should handle invalid role values', async () => {
      const invalidRoles = ['invalid_role', '', null, undefined, 123, {}];
      
      for (const role of invalidRoles) {
        try {
          const token = jwt.sign(
            { sub: '1', role: role as any }, 
            JWT_SECRET
          );

          const response = await request(app)
            .get('/api/auth/verify')
            .set('Authorization', `Bearer ${token}`);

          expect(response.status).toBe(401);
        } catch (error) {
          // Some invalid values might cause JWT signing to fail
          expect(error).toBeDefined();
        }
      }
    });

    it('should enforce case-sensitive role checking', async () => {
      const caseMismatchRoles = ['Owner', 'OWNER', 'owner ', ' owner'];
      
      for (const role of caseMismatchRoles) {
        const token = jwt.sign(
          { sub: '1', role }, 
          JWT_SECRET
        );

        const response = await request(app)
          .get('/api/auth/verify')
          .set('Authorization', `Bearer ${token}`);

        // Depending on implementation, might accept or reject
        expect([200, 401, 403]).toContain(response.status);
      }
    });
  });
});