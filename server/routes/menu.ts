import { Router } from 'express';
const router = Router();

router.get('/data', async (_req, res) => {
  res.json({
    sidebar: [
      { label: 'Dashboard', to: '/dashboard/partner' },
      { label: 'Offers',    to: '/partner/offers'   },
      { label: 'Finances',  to: '/partner/finances' },
      { label: 'Postbacks', to: '/partner/postbacks'}
    ]
  });
});

export default router;
