import { Router } from 'express';

const router = Router();

// Временный summary, чтобы фронт не падал 404
router.get('/analytics/summary', (_req, res) => {
  res.json({
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    cr: 0,
    epc: 0,
  });
});

export default router;
