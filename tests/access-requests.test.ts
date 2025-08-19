describe('Access Requests API', () => {
import request from 'supertest';
import express from 'express';
import { setupAccessRequestsRoutes } from '../server/api/access-requests';

// Mock the dependencies
jest.mock('../server/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id', role: 'affiliate' };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  },
  getAuthenticatedUser: (req: any) => req.user
}));

jest.mock('../server/storage', () => ({
  storage: {
    getOffer: jest.fn(),
    getOfferAccessRequests: jest.fn(),
    createOfferAccessRequest: jest.fn(),
    updateOfferAccessRequest: jest.fn(),
    getUser: jest.fn(),
    createPartnerOffer: jest.fn(),
    getPartnerOffers: jest.fn(),
    getAdvertiserAccessRequests: jest.fn(),
    getOfferAccessRequestsByAdvertiser: jest.fn()
  }
}));

describe('Access Requests API', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    setupAccessRequestsRoutes(app);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/access-requests', () => {
    it('should create a new access request', async () => {
      // Mock storage methods
      const { storage } = require('../server/storage');
      storage.getOffer.mockResolvedValue({ 
        id: 'offer-1', 
        advertiserId: 'advertiser-1',
        name: 'Test Offer'
      });
      storage.getOfferAccessRequests.mockResolvedValue([]);
      storage.createOfferAccessRequest.mockResolvedValue({
        id: 'request-1',
        offerId: 'offer-1',
        partnerId: 'test-user-id',
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/access-requests')
        .send({
          offerId: 'offer-1',
          message: 'Test message'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'request-1');
    });

    it('should return 400 if offerId is missing', async () => {
      const response = await request(app)
        .post('/api/access-requests')
        .send({
          message: 'Test message'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Offer ID is required');
    });
  });

  describe('GET /api/access-requests/partner', () => {
    it('should return partner access requests', async () => {
      const { storage } = require('../server/storage');
      storage.getOfferAccessRequests.mockResolvedValue([
        {
          id: 'request-1',
          offerId: 'offer-1',
          partnerId: 'test-user-id',
          status: 'pending'
        }
      ]);
      storage.getOffer.mockResolvedValue({
        id: 'offer-1',
        name: 'Test Offer',
        category: 'Test Category'
      });
      storage.getUser.mockResolvedValue({
        id: 'advertiser-1',
        username: 'test-advertiser'
      });

      const response = await request(app)
        .get('/api/access-requests/partner');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/access-requests/:id/respond', () => {
    it('should respond to access request', async () => {
      const { storage } = require('../server/storage');
      
      // Mock authenticated user as advertiser
      app.use((req: any, res, next) => {
        req.user = { id: 'advertiser-1', role: 'advertiser' };
        next();
      });

      storage.getOfferAccessRequests.mockResolvedValue([
        {
          id: 'request-1',
          offerId: 'offer-1',
          partnerId: 'partner-1',
          status: 'pending'
        }
      ]);
      storage.getOffer.mockResolvedValue({
        id: 'offer-1',
        advertiserId: 'advertiser-1'
      });
      storage.updateOfferAccessRequest.mockResolvedValue({
        id: 'request-1',
        status: 'approved'
      });
      storage.getPartnerOffers.mockResolvedValue([]);
      storage.createPartnerOffer.mockResolvedValue({});

      const response = await request(app)
        .post('/api/access-requests/request-1/respond')
        .send({
          action: 'approve',
          message: 'Approved!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'approved');
    });
  });
});