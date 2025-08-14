import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Заглушка для дашборда
router.get('/summary', requireAuth, (_req, res) => {
  res.json({ clicks: 0, conversions: 0, revenue: 0, ctr: 0, cr: 0, epc: 0 });
});

export default router;
