import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/summary', requireAuth, requireRole('advertiser'), (req, res) => {
  res.json({ user: req.user, campaigns: 0, clicks: 0, conversions: 0, spend: 0 });
});

router.get('/stats', requireAuth, requireRole('advertiser'), (_req, res) => {
  res.json({ rows: [], totals: { clicks: 0, conversions: 0, spend: 0 } });
});

router.get('/profile', requireAuth, requireRole('advertiser'), (req, res) => {
  res.json({ id: req.user!.sub, username: req.user!.username, role: req.user!.role });
});

router.get('/notifications', requireAuth, requireRole('advertiser'), (_req, res) => {
  res.json({ items: [] });
});

export default router;
