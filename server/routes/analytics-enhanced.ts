import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import type { User } from '@shared/schema';
import { requireAuth } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

// Analytics query schema
const analyticsQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  offerId: z.string().optional(),
  partnerId: z.string().optional(),
  country: z.string().optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
  search: z.string().optional(),
  isBot: z.string().optional().transform(val => val ? val === 'true' : undefined),
  fraudScore: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 50, 500) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get comprehensive analytics data
router.get('/data', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Analytics data request from user:', user.id, user.role);
    
    const query = analyticsQuerySchema.parse(req.query);
    console.log('Parsed query:', query);
    
    // Apply role-based filtering
    const filters = { ...query };
    if (user.role === 'affiliate') {
      filters.partnerId = user.id;
    } else if (user.role === 'advertiser' && user.ownerId) {
      // Advertiser can only see their own data
      filters.advertiserId = user.ownerId;
    }
    // Super admins can see all data
    
    const data = await AnalyticsService.getAnalyticsData(filters);
    
    res.json({
      success: true,
      data,
      total: data.length,
      page: query.page,
      limit: query.limit
    });
  } catch (error) {
    console.error('Error getting analytics data:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics data',
      details: error.message 
    });
  }
});

// Get analytics summary statistics
router.get('/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Analytics summary request from user:', user.id, user.role);
    
    const query = analyticsQuerySchema.parse(req.query);
    
    // Apply role-based filtering
    const filters = { ...query };
    if (user.role === 'affiliate') {
      filters.partnerId = user.id;
    } else if (user.role === 'advertiser' && user.ownerId) {
      filters.advertiserId = user.ownerId;
    }
    
    const summary = await AnalyticsService.getAnalyticsSummary(filters);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics summary',
      details: error.message 
    });
  }
});

// Export analytics data
router.post('/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Analytics export request from user:', user.id, user.role);
    
    const filters = req.body;
    
    // Apply role-based filtering
    if (user.role === 'affiliate') {
      filters.partnerId = user.id;
    } else if (user.role === 'advertiser' && user.ownerId) {
      filters.advertiserId = user.ownerId;
    }
    
    const exportResult = await AnalyticsService.exportAnalyticsData(filters);
    
    res.json(exportResult);
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ 
      error: 'Failed to export analytics data',
      details: error.message 
    });
  }
});

export default router;