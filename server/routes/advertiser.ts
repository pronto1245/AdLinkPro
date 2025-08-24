import { Router } from 'express';
import { requireAuth } from '../middleware/authorization';

const router = Router();

router.get('/profile', requireAuth, (req, res) => {
  res.json({
    id: (req as any).user?.sub,
    company: 'Demo Advertiser',
  });
});

export default router;
