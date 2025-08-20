import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Summary endpoint
router.get('/summary', requireAuth, (_req, res) => {
  res.json({ 
    offers: 2, 
    clicks: 150, 
    conversions: 12, 
    revenue: 240.50 
  });
});

// Profile endpoint
router.get('/profile', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user?.sub || user?.id,
    username: user?.username || 'affiliate1',
    email: user?.email || 'affiliate@example.com',
    role: user?.role || 'affiliate',
    firstName: 'Affiliate',
    lastName: 'User',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  });
});

// Offers endpoint  
router.get('/offers', requireAuth, (_req, res) => {
  res.json({
    offers: [
      {
        id: 101,
        name: 'Financial App Offer',
        advertiser_name: 'FinanceCorpAdvanced',
        payout: 25.00,
        currency: 'USD',
        category: 'Finance',
        status: 'active',
        description: 'Promote our financial app',
        countries: ['US', 'CA', 'UK'],
        tracking_url: 'https://track.example.com/click/101'
      },
      {
        id: 102,
        name: 'Health Supplement Offer', 
        advertiser_name: 'HealthPlus Inc.',
        payout: 18.50,
        currency: 'USD',
        category: 'Health',
        status: 'active',
        description: 'Premium health supplements',
        countries: ['US', 'AU', 'DE'],
        tracking_url: 'https://track.example.com/click/102'
      }
    ]
  });
});

// Postback management endpoints
router.get('/postbacks', requireAuth, (_req, res) => {
  res.json({
    postbacks: [
      {
        id: 1,
        name: 'Default Postback',
        url: 'https://example.com/postback?offer={offer_id}&click={click_id}&payout={payout}',
        status: 'active',
        events: ['conversion'],
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  });
});

router.post('/postbacks', requireAuth, (req, res) => {
  const { name, url, events } = req.body;
  
  if (!name || !url) {
    return res.status(400).json({
      success: false,
      error: 'Name and URL are required'
    });
  }
  
  res.json({
    success: true,
    data: {
      id: Date.now(),
      name,
      url,
      events: events || ['conversion'],
      status: 'active',
      created_at: new Date().toISOString()
    }
  });
});

// Postback logs endpoint
router.get('/postbacks/logs', requireAuth, (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  
  res.json({
    logs: [
      {
        id: 1,
        postback_id: 1,
        click_id: 'test_click_123',
        offer_id: 101,
        status: 'sent',
        response_code: 200,
        sent_at: '2024-01-15T10:30:00Z',
        response_time: 120
      },
      {
        id: 2,
        postback_id: 1,
        click_id: 'test_click_124',
        offer_id: 102,
        status: 'failed',
        response_code: 404,
        sent_at: '2024-01-15T11:15:00Z',
        response_time: 5000,
        error: 'Endpoint not found'
      }
    ],
    total: 2,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
});

export default router;
