import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/summary', requireAuth, requireRole('affiliate'), (req, res) => {
  res.json({ user: req.user, offers: 0, clicks: 0, conversions: 0, revenue: 0 });
});

router.get('/stats', requireAuth, requireRole('affiliate'), (_req, res) => {
  res.json({ rows: [], totals: { clicks: 0, conversions: 0, revenue: 0 } });
});

router.get('/profile', requireAuth, requireRole('affiliate'), (req, res) => {
  res.json({ id: req.user!.sub, username: req.user!.username, role: req.user!.role });
});

router.get('/notifications', requireAuth, requireRole('affiliate'), (_req, res) => {
  res.json({ items: [] });
});

export default router;
