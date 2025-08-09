import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import type { User } from '@shared/schema';
import { storage } from '../storage';
import { clicks, events } from '@shared/tracking-events-schema';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

// Enhanced statistics query schema
const enhancedStatsSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  offerId: z.string().optional(),
  partnerId: z.string().optional(),
  country: z.string().optional(),
  device: z.string().optional(),
  trafficSource: z.string().optional(),
  sub1: z.string().optional(),
  sub2: z.string().optional(),
  sub3: z.string().optional(),
  sub4: z.string().optional(),
  sub5: z.string().optional(),
  eventType: z.string().optional(),
  groupBy: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
    typeof val === 'string' ? [val] : val || ['date']
  ),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  search: z.string().optional(),
  sortBy: z.string().optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Live statistics for advertisers
router.get('/advertiser/live-statistics', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filters = enhancedStatsSchema.parse(req.query);
    
    // Build date range
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    
    // Build WHERE conditions
    const whereConditions = [
      gte(clicks.tsServer, dateFrom),
      lte(clicks.tsServer, dateTo)
    ];
    
    // Apply filters
    if (filters.offerId && filters.offerId !== 'all') {
      whereConditions.push(eq(clicks.offerId, filters.offerId));
    }
    if (filters.partnerId && filters.partnerId !== 'all') {
      whereConditions.push(eq(clicks.visitorCode, filters.partnerId)); // Assuming visitor maps to partner
    }
    if (filters.country) {
      whereConditions.push(eq(clicks.countryIso, filters.country.toUpperCase()));
    }
    if (filters.device && filters.device !== 'all') {
      whereConditions.push(eq(clicks.deviceType, filters.device));
    }
    if (filters.sub1) {
      whereConditions.push(eq(clicks.sub1, filters.sub1));
    }
    if (filters.sub2) {
      whereConditions.push(eq(clicks.sub2Raw, filters.sub2));
    }

    // Generate mock data for development
    const mockData = [];
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const clicks = Math.floor(Math.random() * 500) + 50;
      const conversions = Math.floor(clicks * (Math.random() * 0.05 + 0.01));
      const revenue = conversions * (Math.random() * 50 + 20);
      
      mockData.push({
        date: d.toISOString().split('T')[0],
        country: filters.country || ['US', 'CA', 'GB', 'DE', 'FR', 'TR', 'RU'][Math.floor(Math.random() * 7)],
        device: filters.device || ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        trafficSource: ['facebook', 'google', 'native', 'email'][Math.floor(Math.random() * 4)],
        offerId: `offer_${Math.floor(Math.random() * 10) + 1}`,
        offerName: `Test Offer ${Math.floor(Math.random() * 10) + 1}`,
        partnerId: `partner_${Math.floor(Math.random() * 20) + 1}`,
        partnerName: `Partner ${Math.floor(Math.random() * 20) + 1}`,
        sub1: filters.sub1 || `sub1_${Math.floor(Math.random() * 5) + 1}`,
        sub2Raw: filters.sub2 || `geo-${['TR', 'US', 'RU'][Math.floor(Math.random() * 3)]}|dev-mobile|src-fb`,
        sub3: '',
        sub4: '',
        sub5: '',
        clicks,
        uniqueClicks: Math.floor(clicks * 0.8),
        conversions,
        revenue,
        leadEvents: Math.floor(conversions * 0.3),
        regEvents: Math.floor(conversions * 0.4),
        depositEvents: Math.floor(conversions * 0.3),
        fraudClicks: Math.floor(clicks * 0.02),
        avgTimeOnPage: Math.floor(Math.random() * 120000) + 30000 // 30s to 2.5min
      });
    }

    const statistics = mockData;

    // Calculate summary statistics
    const summary = statistics.reduce((acc, row) => {
      acc.totalClicks += row.clicks;
      acc.totalConversions += row.conversions;
      acc.totalRevenue += row.revenue;
      acc.totalLeads += row.leadEvents;
      acc.totalRegs += row.regEvents;
      acc.totalDeposits += row.depositEvents;
      acc.totalFraudClicks += row.fraudClicks;
      return acc;
    }, {
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalLeads: 0,
      totalRegs: 0,
      totalDeposits: 0,
      totalFraudClicks: 0,
      avgCR: 0,
      avgEPC: 0,
      fraudRate: 0
    });

    // Calculate derived metrics
    summary.avgCR = summary.totalClicks > 0 ? (summary.totalConversions / summary.totalClicks) * 100 : 0;
    summary.avgEPC = summary.totalClicks > 0 ? summary.totalRevenue / summary.totalClicks : 0;
    summary.fraudRate = summary.totalClicks > 0 ? (summary.totalFraudClicks / summary.totalClicks) * 100 : 0;

    // Format statistics data
    const formattedStatistics = statistics.map(row => ({
      id: `${row.date}-${row.offerId}-${row.partnerId}`,
      date: row.date,
      country: row.country || 'Unknown',
      device: row.device || 'Unknown',
      trafficSource: row.trafficSource || 'Direct',
      offerId: row.offerId || 'unknown',
      offerName: row.offerName,
      partnerId: row.partnerId || 'unknown',
      partnerName: row.partnerName,
      sub1: row.sub1 || '',
      sub2: row.sub2 || '',
      sub3: row.sub3 || '',
      sub4: row.sub4 || '',
      sub5: row.sub5 || '',
      clicks: row.clicks,
      uniqueClicks: row.uniqueClicks,
      conversions: row.conversions,
      revenue: Math.round(row.revenue * 100) / 100,
      leads: row.leadEvents,
      regs: row.regEvents,
      deposits: row.depositEvents,
      cr: row.clicks > 0 ? Math.round((row.conversions / row.clicks) * 10000) / 100 : 0,
      epc: row.clicks > 0 ? Math.round((row.revenue / row.clicks) * 100) / 100 : 0,
      fraudClicks: row.fraudClicks,
      fraudRate: row.clicks > 0 ? Math.round((row.fraudClicks / row.clicks) * 10000) / 100 : 0,
      avgTimeOnPage: Math.round(row.avgTimeOnPage / 1000) // Convert to seconds
    }));

    res.json({
      data: formattedStatistics,
      summary: {
        ...summary,
        avgCR: Math.round(summary.avgCR * 100) / 100,
        avgEPC: Math.round(summary.avgEPC * 100) / 100,
        fraudRate: Math.round(summary.fraudRate * 100) / 100,
        totalOffers: new Set(statistics.map(s => s.offerId)).size,
        totalPartners: new Set(statistics.map(s => s.partnerId)).size
      },
      total: statistics.length,
      filters: filters
    });

  } catch (error) {
    console.error('Live statistics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid filters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch live statistics' });
  }
});

// Live statistics for partners
router.get('/partner/live-statistics', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'affiliate') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filters = enhancedStatsSchema.parse(req.query);
    
    // Partners can only see their own data
    const partnerId = user.id;
    
    // Build date range
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    
    // Build WHERE conditions for partner's data
    const whereConditions = [
      gte(clicks.tsServer, dateFrom),
      lte(clicks.tsServer, dateTo),
      eq(clicks.visitorCode, partnerId) // Partner can only see their own traffic
    ];
    
    // Apply additional filters
    if (filters.offerId && filters.offerId !== 'all') {
      whereConditions.push(eq(clicks.offerId, filters.offerId));
    }
    if (filters.country) {
      whereConditions.push(eq(clicks.countryIso, filters.country.toUpperCase()));
    }
    if (filters.device && filters.device !== 'all') {
      whereConditions.push(eq(clicks.deviceType, filters.device));
    }

    // Generate mock partner statistics
    const partnerStats = [];
    for (let d = new Date(dateFrom); d <= endDate; d.setDate(d.getDate() + 1)) {
      const clicks = Math.floor(Math.random() * 200) + 20;
      const conversions = Math.floor(clicks * (Math.random() * 0.04 + 0.01));
      const revenue = conversions * (Math.random() * 40 + 15);
      
      partnerStats.push({
        date: d.toISOString().split('T')[0],
        country: filters.country || ['US', 'CA', 'GB', 'DE', 'FR', 'TR', 'RU'][Math.floor(Math.random() * 7)],
        device: filters.device || ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        trafficSource: ['facebook', 'google', 'native', 'email'][Math.floor(Math.random() * 4)],
        offerId: `offer_${Math.floor(Math.random() * 10) + 1}`,
        sub1: filters.sub1 || `sub1_${Math.floor(Math.random() * 5) + 1}`,
        sub2Raw: filters.sub2 || `geo-${['TR', 'US', 'RU'][Math.floor(Math.random() * 3)]}|dev-mobile`,
        clicks,
        uniqueClicks: Math.floor(clicks * 0.85),
        conversions,
        revenue,
        payout: revenue * 0.7 // 70% payout rate
      });
    }

    // Calculate partner summary
    const partnerSummary = partnerStats.reduce((acc, row) => {
      acc.totalClicks += row.clicks;
      acc.totalConversions += row.conversions;
      acc.totalRevenue += row.revenue;
      acc.totalPayout += row.payout;
      return acc;
    }, {
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalPayout: 0,
      avgCR: 0,
      avgEPC: 0
    });

    partnerSummary.avgCR = partnerSummary.totalClicks > 0 ? (partnerSummary.totalConversions / partnerSummary.totalClicks) * 100 : 0;
    partnerSummary.avgEPC = partnerSummary.totalClicks > 0 ? partnerSummary.totalPayout / partnerSummary.totalClicks : 0;

    res.json({
      data: partnerStats.map(row => ({
        id: `${row.date}-${row.offerId}`,
        date: row.date,
        country: row.country || 'Unknown',
        device: row.device || 'Unknown',
        trafficSource: row.trafficSource || 'Direct',
        offerId: row.offerId || 'unknown',
        sub1: row.sub1 || '',
        sub2: row.sub2 || '',
        clicks: row.clicks,
        uniqueClicks: row.uniqueClicks,
        conversions: row.conversions,
        revenue: Math.round(row.revenue * 100) / 100,
        payout: Math.round(row.payout * 100) / 100,
        cr: row.clicks > 0 ? Math.round((row.conversions / row.clicks) * 10000) / 100 : 0,
        epc: row.clicks > 0 ? Math.round((row.payout / row.clicks) * 100) / 100 : 0,
      })),
      summary: {
        ...partnerSummary,
        avgCR: Math.round(partnerSummary.avgCR * 100) / 100,
        avgEPC: Math.round(partnerSummary.avgEPC * 100) / 100,
        totalOffers: new Set(partnerStats.map(s => s.offerId)).size
      },
      total: partnerStats.length
    });

  } catch (error) {
    console.error('Partner statistics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid filters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch partner statistics' });
  }
});

// Real-time dashboard metrics
router.get('/advertiser/dashboard-metrics', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Last 24 hours metrics
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Generate mock dashboard metrics
    const metrics = [{
      totalClicks: Math.floor(Math.random() * 10000) + 1000,
      uniqueVisitors: Math.floor(Math.random() * 8000) + 800,
      totalConversions: Math.floor(Math.random() * 200) + 50,
      totalRevenue: Math.floor(Math.random() * 50000) + 5000,
      topCountry: ['US', 'CA', 'GB', 'DE', 'FR', 'TR', 'RU'][Math.floor(Math.random() * 7)],
      topDevice: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)]
    }];

    res.json(metrics[0] || {
      totalClicks: 0,
      uniqueVisitors: 0,
      totalConversions: 0,
      totalRevenue: 0,
      topCountry: 'Unknown',
      topDevice: 'Unknown'
    });

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

export default router;