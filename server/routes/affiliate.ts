import { Router } from 'express';
const router = Router();

router.get('/summary', (_req, res) => {
  res.json({ offers: 0, clicks: 0, conversions: 0, revenue: 0 });
});

router.get('/profile', (_req, res) => {
  res.json({ id: 2, username: 'test_affiliate', role: 'affiliate' });
});

export default router;
