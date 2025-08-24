import { Router } from 'express';
import { requireAuth } from '../middleware/authorization';

const router = Router();

router.get('/summary', requireAuth, (_req, res) => {
  res.json({ offers: 0, clicks: 0, conversions: 0, revenue: 0 });
});

router.get('/profile', requireAuth, (req, res) => {
  res.json({
    id: (req as any).user?.sub,
    role: (req as any).user?.role || 'affiliate',
  });
});

export default router;
