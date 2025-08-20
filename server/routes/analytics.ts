import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';
import { storage } from '../storage';
import { FraudService } from '../services/fraudService';

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

// Get fraud analytics
router.get('/fraud', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has admin role for fraud analytics
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { period = '30d', format = 'json' } = req.query;
    
    // Get fraud statistics from storage
    const fraudStats = await storage.getFraudStats({
      period: period as string
    });

    // Get fraud statistics from service
    const detailedFraudStats = await FraudService.getFraudStats({
      period: period as string
    });

    const fraudAnalytics = {
      ...fraudStats,
      ...detailedFraudStats,
      period: period,
      timestamp: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format for export
      const csvHeader = 'Date,Total Reports,Fraud Rate,Bot Rate,VPN Rate,Blocked Amount\n';
      const csvData = `${new Date().toISOString().split('T')[0]},${fraudAnalytics.totalReports},${fraudAnalytics.fraudRate},${fraudAnalytics.botRate},${fraudAnalytics.vpnRate},${fraudAnalytics.savedAmount}\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=fraud_analytics_${period}.csv`);
      res.send(csvHeader + csvData);
    } else {
      res.json(fraudAnalytics);
    }

  } catch (error) {
    console.error('Error getting fraud analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics export with fraud data
router.get('/export', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { format = 'json', period = '30d', role } = req.query;
    
    // Get basic analytics summary
    let filters = { ...req.query };
    if (user.role === 'affiliate') {
      filters.partnerId = user.id;
    } else if (user.role === 'advertiser' && user.ownerId) {
      filters.advertiserId = user.ownerId;
    }

    const summary = await AnalyticsService.getAnalyticsSummary(filters);
    
    // Add fraud data for admin users
    let fraudData = {};
    if (user.role === 'super_admin' || user.role === 'admin') {
      fraudData = await storage.getFraudStats({ period: period as string });
    }

    const exportData = {
      ...summary,
      ...fraudData,
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
      period: period,
      role: role || 'all'
    };

    if (format === 'csv') {
      // Convert to CSV format
      const headers = Object.keys(exportData).join(',');
      const values = Object.values(exportData).map(v => 
        typeof v === 'string' ? `"${v}"` : v
      ).join(',');
      
      const csv = `${headers}\n${values}`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics_export_${period}.csv`);
      res.send(csv);
    } else {
      res.json(exportData);
    }

  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
