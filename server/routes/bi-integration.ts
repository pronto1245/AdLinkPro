import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import type { User } from '@shared/schema';
import { storage } from '../storage';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

// API Key validation middleware
const validateApiKey = async (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // For now, use simple validation - in production, check against database
  if (apiKey === 'bi_test_key_12345') {
    // Set user context for BI requests
    req.user = { role: 'advertiser', id: 'bi_user' } as User;
    next();
  } else {
    return res.status(401).json({ error: 'Invalid API key' });
  }
};

// Schema for BI export requests
const biExportSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['json', 'csv', 'xml']).default('json'),
  metrics: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  groupBy: z.array(z.string()).optional(),
  limit: z.number().min(1).max(10000).default(1000),
  offset: z.number().min(0).default(0)
});

// Get available BI endpoints
router.get('/bi/endpoints', validateApiKey, async (req: Request, res: Response) => {
  try {
    const endpoints = {
      version: '1.0',
      baseUrl: '/api/bi',
      authentication: 'API Key required in X-API-Key header or api_key query parameter',
      endpoints: [
        {
          path: '/analytics/summary',
          method: 'GET',
          description: 'Get analytics summary data',
          parameters: ['startDate', 'endDate', 'format', 'groupBy']
        },
        {
          path: '/analytics/detailed',
          method: 'GET',
          description: 'Get detailed analytics data',
          parameters: ['startDate', 'endDate', 'format', 'metrics', 'filters', 'limit', 'offset']
        },
        {
          path: '/performance/metrics',
          method: 'GET',
          description: 'Get performance metrics',
          parameters: ['startDate', 'endDate', 'format']
        },
        {
          path: '/financial/revenue',
          method: 'GET',
          description: 'Get revenue data',
          parameters: ['startDate', 'endDate', 'format', 'groupBy']
        },
        {
          path: '/fraud/alerts',
          method: 'GET',
          description: 'Get fraud detection alerts',
          parameters: ['startDate', 'endDate', 'severity', 'status']
        },
        {
          path: '/partners/performance',
          method: 'GET',
          description: 'Get partner performance data',
          parameters: ['startDate', 'endDate', 'partnerId', 'format']
        },
        {
          path: '/offers/statistics',
          method: 'GET',
          description: 'Get offer statistics',
          parameters: ['startDate', 'endDate', 'offerId', 'format']
        },
        {
          path: '/export/custom',
          method: 'POST',
          description: 'Create custom data export',
          body: 'biExportSchema'
        }
      ],
      dataFormats: ['json', 'csv', 'xml'],
      rateLimits: {
        requests: 1000,
        period: 'hour'
      }
    };

    res.json(endpoints);
  } catch (error) {
    console.error('BI endpoints error:', error);
    res.status(500).json({ error: 'Failed to get BI endpoints' });
  }
});

// BI Analytics Summary
router.get('/bi/analytics/summary', validateApiKey, async (req: Request, res: Response) => {
  try {
    const query = biExportSchema.pick({ 
      startDate: true, 
      endDate: true, 
      format: true, 
      groupBy: true 
    }).parse(req.query);

    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    // Mock analytics summary data
    const summaryData = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      metrics: {
        totalClicks: 52847,
        totalConversions: 3721,
        totalRevenue: 89250.75,
        conversionRate: 7.04,
        averageEPC: 1.69,
        activeOffers: 48,
        activePartners: 124,
        countries: 23,
        fraudRate: 2.8
      },
      topCountries: [
        { country: 'US', clicks: 18420, conversions: 1287, revenue: 31450.20 },
        { country: 'UK', clicks: 12850, conversions: 891, revenue: 22180.50 },
        { country: 'CA', clicks: 9640, conversions: 672, revenue: 16890.30 }
      ],
      topOffers: [
        { id: '1', name: 'Premium Casino', clicks: 8450, conversions: 598, revenue: 14520.80 },
        { id: '2', name: 'Forex Trading', clicks: 7820, conversions: 432, revenue: 12850.40 },
        { id: '3', name: 'Dating VIP', clicks: 6940, conversions: 389, revenue: 9780.60 }
      ],
      dailyBreakdown: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 8000) + 2000,
        conversions: Math.floor(Math.random() * 600) + 100,
        revenue: Math.floor(Math.random() * 15000) + 3000
      })).reverse()
    };

    if (query.format === 'csv') {
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="analytics-summary.csv"'
      });
      
      // Convert to CSV
      const csvData = summaryData.dailyBreakdown.map(row => 
        `${row.date},${row.clicks},${row.conversions},${row.revenue}`
      ).join('\n');
      const csvHeader = 'Date,Clicks,Conversions,Revenue\n';
      
      return res.send(csvHeader + csvData);
    }

    res.json(summaryData);
  } catch (error) {
    console.error('BI analytics summary error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
});

// BI Detailed Analytics
router.get('/bi/analytics/detailed', validateApiKey, async (req: Request, res: Response) => {
  try {
    const query = biExportSchema.parse(req.query);
    
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Mock detailed data
    const detailedData = {
      metadata: {
        period: { start: startDate.toISOString(), end: endDate.toISOString() },
        totalRecords: 15420,
        limit: query.limit,
        offset: query.offset,
        requestedMetrics: query.metrics || ['all']
      },
      data: Array.from({ length: Math.min(query.limit, 100) }, (_, i) => ({
        id: `record_${query.offset + i + 1}`,
        timestamp: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())).toISOString(),
        clickId: `click_${Math.random().toString(36).substr(2, 9)}`,
        offerId: Math.floor(Math.random() * 50) + 1,
        offerName: ['Premium Casino', 'Forex Trading', 'Dating VIP', 'Crypto Invest'][Math.floor(Math.random() * 4)],
        partnerId: Math.floor(Math.random() * 100) + 1,
        partnerName: `Partner ${Math.floor(Math.random() * 100) + 1}`,
        country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
        device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        os: ['Windows', 'macOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)],
        conversionType: Math.random() > 0.8 ? ['lead', 'deposit', 'sale'][Math.floor(Math.random() * 3)] : null,
        revenue: Math.random() > 0.8 ? parseFloat((Math.random() * 100).toFixed(2)) : 0,
        isFraud: Math.random() < 0.03,
        subId1: `sub1_${Math.random().toString(36).substr(2, 6)}`,
        subId2: `sub2_${Math.random().toString(36).substr(2, 6)}`,
        trafficSource: ['google', 'facebook', 'native', 'direct'][Math.floor(Math.random() * 4)]
      }))
    };

    if (query.format === 'csv') {
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="analytics-detailed.csv"'
      });
      
      const headers = Object.keys(detailedData.data[0] || {}).join(',');
      const rows = detailedData.data.map(row => Object.values(row).join(',')).join('\n');
      
      return res.send(headers + '\n' + rows);
    }

    res.json(detailedData);
  } catch (error) {
    console.error('BI detailed analytics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to get detailed analytics' });
  }
});

// BI Performance Metrics
router.get('/bi/performance/metrics', validateApiKey, async (req: Request, res: Response) => {
  try {
    const query = biExportSchema.pick({ 
      startDate: true, 
      endDate: true, 
      format: true 
    }).parse(req.query);

    const performanceData = {
      overall: {
        impressions: 284750,
        clicks: 52847,
        ctr: 18.54,
        conversions: 3721,
        cr: 7.04,
        revenue: 89250.75,
        cost: 42180.30,
        profit: 47070.45,
        roi: 111.62,
        epc: 1.69,
        epcv: 23.98
      },
      byChannel: [
        { channel: 'Google Ads', clicks: 18420, conversions: 1287, revenue: 31450.20, cost: 15200.50 },
        { channel: 'Facebook', clicks: 12850, conversions: 891, revenue: 22180.50, cost: 10850.20 },
        { channel: 'Native', clicks: 9640, conversions: 672, revenue: 16890.30, cost: 7950.40 },
        { channel: 'Direct', clicks: 7820, conversions: 432, revenue: 12850.40, cost: 5180.20 },
        { channel: 'Other', clicks: 4117, conversions: 439, revenue: 5879.35, cost: 2999.00 }
      ],
      byGeo: [
        { country: 'US', revenue: 31450.20, conversions: 1287, avgPayout: 24.44 },
        { country: 'UK', revenue: 22180.50, conversions: 891, avgPayout: 24.90 },
        { country: 'CA', revenue: 16890.30, conversions: 672, avgPayout: 25.13 },
        { country: 'AU', revenue: 12850.40, conversions: 432, avgPayout: 29.75 },
        { country: 'DE', revenue: 5879.35, conversions: 439, avgPayout: 13.39 }
      ],
      trends: {
        last7Days: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 8000) + 2000,
          cr: parseFloat((Math.random() * 10 + 5).toFixed(2)),
          revenue: Math.floor(Math.random() * 15000) + 3000,
          roi: parseFloat((Math.random() * 100 + 80).toFixed(2))
        })).reverse()
      }
    };

    res.json(performanceData);
  } catch (error) {
    console.error('BI performance metrics error:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// BI Financial Revenue Data
router.get('/bi/financial/revenue', validateApiKey, async (req: Request, res: Response) => {
  try {
    const query = biExportSchema.pick({ 
      startDate: true, 
      endDate: true, 
      format: true,
      groupBy: true
    }).parse(req.query);

    const revenueData = {
      summary: {
        totalRevenue: 89250.75,
        totalCost: 42180.30,
        netProfit: 47070.45,
        margin: 52.73,
        avgDailyRevenue: 12750.11
      },
      byOffer: [
        { offerId: '1', offerName: 'Premium Casino', revenue: 14520.80, cost: 6200.30, profit: 8320.50 },
        { offerId: '2', offerName: 'Forex Trading', revenue: 12850.40, cost: 5950.20, profit: 6900.20 },
        { offerId: '3', offerName: 'Dating VIP', revenue: 9780.60, cost: 4850.10, profit: 4930.50 }
      ],
      byPartner: [
        { partnerId: '1', partnerName: 'Top Partner', revenue: 18420.50, payouts: 9210.25, margin: 50.0 },
        { partnerId: '2', partnerName: 'Premium Partner', revenue: 15680.30, payouts: 7840.15, margin: 50.0 },
        { partnerId: '3', partnerName: 'Gold Partner', revenue: 12450.80, payouts: 6850.44, margin: 45.0 }
      ],
      monthly: Array.from({ length: 12 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (11 - i));
        return {
          month: month.toISOString().substr(0, 7),
          revenue: Math.floor(Math.random() * 100000) + 50000,
          cost: Math.floor(Math.random() * 50000) + 20000,
          conversions: Math.floor(Math.random() * 5000) + 2000
        };
      })
    };

    if (query.format === 'csv') {
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="revenue-data.csv"'
      });
      
      const csvData = revenueData.monthly.map(row => 
        `${row.month},${row.revenue},${row.cost},${row.conversions}`
      ).join('\n');
      const csvHeader = 'Month,Revenue,Cost,Conversions\n';
      
      return res.send(csvHeader + csvData);
    }

    res.json(revenueData);
  } catch (error) {
    console.error('BI revenue data error:', error);
    res.status(500).json({ error: 'Failed to get revenue data' });
  }
});

// BI Fraud Alerts
router.get('/bi/fraud/alerts', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, severity, status } = req.query;

    const fraudData = {
      summary: {
        totalAlerts: 127,
        criticalAlerts: 12,
        highAlerts: 34,
        mediumAlerts: 58,
        lowAlerts: 23,
        blockedClicks: 2847,
        fraudRate: 2.8
      },
      alerts: Array.from({ length: 50 }, (_, i) => ({
        id: `alert_${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        type: ['click_flooding', 'proxy_traffic', 'bot_traffic', 'suspicious_behavior'][Math.floor(Math.random() * 4)],
        description: 'Suspicious activity detected',
        affectedClicks: Math.floor(Math.random() * 100) + 10,
        partnerId: Math.floor(Math.random() * 100) + 1,
        offerId: Math.floor(Math.random() * 50) + 1,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: ['US', 'CN', 'RU', 'IN', 'BD'][Math.floor(Math.random() * 5)],
        status: ['active', 'resolved', 'investigating'][Math.floor(Math.random() * 3)],
        actionTaken: 'Blocked suspicious traffic'
      })),
      trends: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          alerts: Math.floor(Math.random() * 20) + 1,
          blockedClicks: Math.floor(Math.random() * 200) + 10,
          fraudRate: parseFloat((Math.random() * 5).toFixed(2))
        })).reverse()
      }
    };

    res.json(fraudData);
  } catch (error) {
    console.error('BI fraud alerts error:', error);
    res.status(500).json({ error: 'Failed to get fraud alerts' });
  }
});

// Custom BI Export
router.post('/bi/export/custom', validateApiKey, async (req: Request, res: Response) => {
  try {
    const exportRequest = biExportSchema.parse(req.body);

    // Create export job (in production, this would be queued)
    const exportJob = {
      id: `export_${Date.now()}`,
      status: 'processing',
      format: exportRequest.format,
      estimatedTime: '2-5 minutes',
      downloadUrl: null,
      parameters: exportRequest,
      createdAt: new Date().toISOString()
    };

    console.log('Custom BI export requested:', exportJob);

    // Simulate async processing
    setTimeout(() => {
      exportJob.status = 'completed';
      exportJob.downloadUrl = `/api/bi/export/download/${exportJob.id}`;
      console.log('Export completed:', exportJob);
    }, 5000);

    res.status(202).json(exportJob);
  } catch (error) {
    console.error('BI custom export error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid export parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create export' });
  }
});

// BI Partner Performance
router.get('/bi/partners/performance', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { partnerId, startDate, endDate, format } = req.query;

    const partnerData = {
      summary: {
        totalPartners: 124,
        activePartners: 98,
        topPerformers: 12
      },
      partners: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Partner ${i + 1}`,
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        clicks: Math.floor(Math.random() * 5000) + 100,
        conversions: Math.floor(Math.random() * 500) + 10,
        revenue: parseFloat((Math.random() * 10000).toFixed(2)),
        cr: parseFloat((Math.random() * 15 + 2).toFixed(2)),
        epc: parseFloat((Math.random() * 5).toFixed(2)),
        fraudRate: parseFloat((Math.random() * 10).toFixed(2)),
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
    };

    res.json(partnerData);
  } catch (error) {
    console.error('BI partner performance error:', error);
    res.status(500).json({ error: 'Failed to get partner performance data' });
  }
});

export default router;