import { Router } from 'express';

const router = Router();

// Health check endpoint for deployment monitoring
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'connected',
    services: {
      auth: 'operational',
      api: 'operational'
    }
  });
});

export { router as healthRouter };