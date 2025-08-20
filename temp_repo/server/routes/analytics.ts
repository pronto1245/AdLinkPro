import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

const router = Router();

// Get analytics summary for dashboard
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Apply role-based filtering
    let filters = { ...req.query };
    if (user.role === 'affiliate') {
      filters.partnerId = user.id;
    } else if (user.role === 'advertiser' && user.ownerId) {
      filters.advertiserId = user.ownerId;
    }

    const summary = await AnalyticsService.getAnalyticsSummary(filters);
    
    // Transform to expected dashboard format
    const dashboardSummary = {
      clicks: summary.totalClicks || 0,
      conversions: summary.conversions || 0,
      revenue: summary.revenue || 0,
      ctr: summary.totalClicks > 0 ? ((summary.uniqueClicks || 0) / summary.totalClicks * 100) : 0,
      cr: summary.cr || 0,
      epc: summary.epc || 0
    };

    res.json(dashboardSummary);
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.json({ clicks: 0, conversions: 0, revenue: 0, ctr: 0, cr: 0, epc: 0 });
  }
});

export default router;
