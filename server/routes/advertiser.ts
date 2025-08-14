import { Router } from 'express';
const router = Router();

router.get('/profile', (_req, res) => {
  res.json({ id: 3, username: 'advertiser1', role: 'advertiser' });
});

router.get('/summary', (_req, res) => {
  res.json({ campaigns: 0, clicks: 0, conversions: 0, spend: 0 });
});

export default router;
