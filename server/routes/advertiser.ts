import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Existing profile route
router.get('/profile', requireAuth, (req, res) => {
  res.json({
    id: (req as any).user?.sub,
    company: 'Demo Advertiser',
  });
});

// New critical routes for advertiser module
router.get('/offers', requireAuth, (req, res) => {
  // Mock data for offers
  res.json([
    {
      id: '1',
      name: 'Test Offer 1',
      status: 'active',
      payout: '10.00',
      currency: 'USD',
      category: 'finance',
      countries: ['US', 'CA']
    }
  ]);
});

router.post('/offers', requireAuth, (req, res) => {
  const { name, payout, currency, category } = req.body;
  res.status(201).json({
    id: Date.now().toString(),
    name,
    payout,
    currency,
    category,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
});

router.get('/offers/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    name: 'Test Offer Details',
    status: 'active',
    payout: '10.00',
    currency: 'USD'
  });
});

router.patch('/offers/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  res.json({
    id,
    ...updateData,
    updatedAt: new Date().toISOString()
  });
});

router.get('/partners', requireAuth, (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Partner 1',
      status: 'active',
      totalClicks: 1000,
      totalConversions: 50
    }
  ]);
});

router.get('/analytics', requireAuth, (req, res) => {
  res.json({
    summary: {
      totalClicks: 10000,
      totalConversions: 500,
      totalRevenue: 5000,
      avgCR: 5.0,
      avgEPC: 0.50
    },
    data: []
  });
});

router.get('/finances', requireAuth, (req, res) => {
  res.json({
    balance: 1000.00,
    currency: 'USD',
    transactions: []
  });
});

router.get('/dashboard', requireAuth, (req, res) => {
  res.json({
    stats: {
      totalOffers: 5,
      activePartners: 10,
      totalRevenue: 5000
    }
  });
});

router.get('/stats', requireAuth, (req, res) => {
  const { from, to } = req.query;
  res.json({
    period: { from, to },
    clicks: 1000,
    conversions: 50,
    revenue: 500
  });
});

export default router;
