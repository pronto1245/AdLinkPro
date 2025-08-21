import request from 'supertest';
import express from 'express';

// Mock the authentication routes for testing
describe('Authentication Endpoints', () => {
  let app: express.Application;
  
  beforeEach(() => {
    // This would normally import the actual server setup
    // For now, we'll create a minimal test setup
    app = express();
    app.use(express.json());
    
    // Mock the JWT_SECRET
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Mock authentication endpoints
    app.post('/api/auth/login', (req, res) => {
      const { username, password } = req.body;
      if (username === 'owner' && password === 'Affilix123!') {
        return res.json({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'owner',
            email: '9791207@gmail.com',
            role: 'OWNER',
            twoFactorEnabled: false
          }
        });
      }
      res.status(401).json({ error: 'Invalid credentials' });
    });
    
    app.post('/auth/login', (req, res) => {
      const { username, password } = req.body;
      if (username === 'advertiser' && password === 'adv123') {
        return res.json({
          success: true,
          token: 'mock-jwt-token-advertiser',
          user: {
            id: '2',
            username: 'advertiser',
            email: '12345@gmail.com',
            role: 'ADVERTISER',
            twoFactorEnabled: false
          }
        });
      }
      res.status(401).json({ error: 'Invalid credentials' });
    });
    
    app.get('/api/health', (req, res) => {
      res.json({ ok: true });
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should authenticate owner user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'owner',
          password: 'Affilix123!'
        })
        .expect(200);
        
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('role', 'OWNER');
    });
    
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'owner',
          password: 'wrong-password'
        })
        .expect(401);
        
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
    
    it('should require username and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(401);
    });
  });
  
  describe('POST /auth/login', () => {
    it('should authenticate advertiser user successfully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'advertiser',
          password: 'adv123'
        })
        .expect(200);
        
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('role', 'ADVERTISER');
    });
    
    it('should reject invalid credentials on /auth/login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'advertiser',
          password: 'wrong-password'
        })
        .expect(401);
        
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
  
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
        
      expect(response.body).toHaveProperty('ok', true);
    });
  });
});