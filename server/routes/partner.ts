import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Partner dashboard
router.get('/dashboard', requireAuth, (_req, res) => {
  res.json({
    clicks: 1250,
    conversions: 45,
    revenue: 675.50,
    ctr: 3.6,
    cr: 3.6,
    epc: 0.54,
    recent: [
      { offer: 'Crypto Trading', clicks: 150, conversions: 8, revenue: 120 },
      { offer: 'Forex Signals', clicks: 200, conversions: 12, revenue: 180 }
    ],
  });
});

// Partner offers
router.get('/offers', requireAuth, (_req, res) => {
  res.json({
    offers: [
      { id: 101, name: 'Crypto Trading Platform', payout: 15, status: 'active', category: 'finance' },
      { id: 102, name: 'Forex Signals Service', payout: 12, status: 'active', category: 'finance' },
      { id: 103, name: 'Binary Options', payout: 20, status: 'paused', category: 'finance' },
    ],
  });
});

// Partner financial summary
router.get('/finances', requireAuth, (_req, res) => {
  res.json({
    balance: 1250.75,
    pending: 320.50,
    paid: 5680.25,
    currency: 'USD',
    transactions: [
      {
        id: 'tx001',
        type: 'commission',
        amount: 45.50,
        date: new Date().toISOString(),
        description: 'Commission from Crypto Trading Platform'
      }
    ]
  });
});

// Partner statistics
router.get('/statistics', requireAuth, (req, res) => {
  const { dateFrom, dateTo } = req.query;
  res.json({
    summary: {
      totalClicks: 5420,
      totalConversions: 195,
      totalRevenue: 2840.75,
      avgCR: 3.6,
      avgEPC: 0.52
    },
    data: [
      {
        date: '2024-01-01',
        clicks: 150,
        conversions: 6,
        revenue: 90,
        offers: ['Crypto Trading', 'Forex Signals']
      }
    ],
    filters: { dateFrom, dateTo }
  });
});

// Partner access requests
router.get('/access-requests', requireAuth, (_req, res) => {
  res.json({
    requests: [
      {
        id: 'req001',
        offerId: '101',
        offerName: 'Premium Trading Signals',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        note: 'Experienced in financial affiliate marketing'
      }
    ]
  });
});

router.post('/access-requests', requireAuth, (req, res) => {
  const { offerId, note } = req.body;
  res.status(201).json({
    id: Date.now().toString(),
    offerId,
    status: 'pending',
    note,
    requestedAt: new Date().toISOString()
  });
});

// Partner profile
router.get('/profile', requireAuth, (_req, res) => {
  res.json({
    id: 'partner001',
    username: 'demo_partner',
    email: 'partner@example.com',
    status: 'active',
    registrationDate: new Date().toISOString(),
    stats: {
      totalOffers: 12,
      activeOffers: 8,
      totalEarnings: 5680.25
    },
    paymentMethod: {
      type: 'bank_transfer',
      details: '**** **** **** 1234'
    }
  });
});

router.put('/profile', requireAuth, (req, res) => {
  const updateData = req.body;
  res.json({
    ...updateData,
    updatedAt: new Date().toISOString()
  });
});

// Partner postbacks
router.get('/postbacks', requireAuth, (_req, res) => {
  res.json({
    profiles: [
      {
        id: 'pb001',
        name: 'Main Postback',
        url: 'https://example.com/postback',
        events: ['click', 'conversion'],
        status: 'active'
      }
    ]
  });
});

router.post('/postbacks', requireAuth, (req, res) => {
  const { name, url, events } = req.body;
  res.status(201).json({
    id: Date.now().toString(),
    name,
    url,
    events,
    status: 'active',
    createdAt: new Date().toISOString()
  });
});

export default router;
