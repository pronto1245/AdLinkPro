import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// уже есть /summary, но оставим как образец
router.get('/summary', requireAuth, (_req, res) => {
  res.json({ clicks: 0, conversions: 0, revenue: 0, ctr: 0, cr: 0, epc: 0 });
});

router.get('/trends', requireAuth, (_req, res) => {
  res.json({
    byDay: [
      { date: '2025-08-13', clicks: 0, conv: 0, revenue: 0 },
      { date: '2025-08-14', clicks: 0, conv: 0, revenue: 0 },
    ],
  });
});

export default router;
