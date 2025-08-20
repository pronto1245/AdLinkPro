import { Router } from 'express';

const router = Router();

// Простейший "auth": требуем любой Bearer для демо
function requireAuth(req: any, res: any, next: any) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

router.get('/partner/dashboard', requireAuth, (_req, res) => {
  res.json({
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    cr: 0,
    epc: 0,
    recent: [],
  });
});

router.get('/partner/offers', requireAuth, (_req, res) => {
  res.json({
    offers: [
      { id: 101, name: 'Test Offer A', payout: 10, status: 'active' },
      { id: 102, name: 'Test Offer B', payout: 15, status: 'paused' },
    ],
  });
});

router.get('/partner/finance/summary', requireAuth, (_req, res) => {
  res.json({
    balance: 0,
    pending: 0,
    paid: 0,
    currency: 'USD',
  });
});

export default router;
