import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/schema';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

// Auth middleware will be applied at router level, no need for additional middleware here

// Query schema for statistics filters
const statisticsFiltersSchema = z.object({
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
  groupBy: z.array(z.string()).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

// Mock data generator for development
function generateMockStatistics(filters: any) {
  const mockData = [];
  const startDate = new Date(filters.dateFrom || Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(filters.dateTo || Date.now());
  
  // Generate daily data
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const clicks = Math.floor(Math.random() * 1000) + 100;
    const conversions = Math.floor(clicks * (Math.random() * 0.05 + 0.01)); // 1-6% CR
    const revenue = conversions * (Math.random() * 50 + 20); // $20-70 per conversion
    const payout = revenue * (Math.random() * 0.3 + 0.5); // 50-80% payout
    
    mockData.push({
      id: `${d.toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9)}`,
      date: d.toISOString().split('T')[0],
      country: filters.country || ['US', 'CA', 'GB', 'DE', 'FR'][Math.floor(Math.random() * 5)],
      device: filters.device || ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
      trafficSource: filters.trafficSource || ['facebook', 'google', 'native', 'email'][Math.floor(Math.random() * 4)],
      offerId: filters.offerId || `offer_${Math.floor(Math.random() * 10) + 1}`,
      offerName: `Тестовый оффер ${Math.floor(Math.random() * 10) + 1}`,
      partnerId: filters.partnerId || `partner_${Math.floor(Math.random() * 20) + 1}`,
      partnerName: `Партнер ${Math.floor(Math.random() * 20) + 1}`,
      sub1: filters.sub1 || `sub1_${Math.floor(Math.random() * 5) + 1}`,
      sub2: filters.sub2 || `sub2_${Math.floor(Math.random() * 5) + 1}`,
      sub3: filters.sub3 || '',
      sub4: filters.sub4 || '',
      sub5: filters.sub5 || '',
      clicks,
      uniqueClicks: Math.floor(clicks * 0.8),
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      payout: Math.round(payout * 100) / 100,
      profit: Math.round((revenue - payout) * 100) / 100,
      cr: Math.round((conversions / clicks) * 10000) / 100,
      epc: Math.round((revenue / clicks) * 100) / 100,
      ctr: Math.round(Math.random() * 300) / 100 + 1, // 1-4% CTR
      roi: Math.round(((revenue - payout) / payout) * 10000) / 100,
      fraudClicks: Math.floor(clicks * Math.random() * 0.02), // 0-2% fraud
      fraudRate: Math.round(Math.random() * 200) / 100, // 0-2% fraud rate
    });
  }
  
  return mockData;
}

// Advertiser statistics endpoint
router.get('/advertiser/statistics', async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Validate query parameters
    const filters = statisticsFiltersSchema.parse(req.query);
    
    // For now, return mock data since the full database implementation is complex
    // In production, this would call storage.getAdvertiserStatistics()
    const mockData = generateMockStatistics(filters);
    
    // Calculate summary
    const summary = {
      totalClicks: mockData.reduce((sum, row) => sum + row.clicks, 0),
      totalConversions: mockData.reduce((sum, row) => sum + row.conversions, 0),
      totalRevenue: Math.round(mockData.reduce((sum, row) => sum + row.revenue, 0) * 100) / 100,
      avgCR: 0,
      avgEPC: 0,
      totalOffers: new Set(mockData.map(row => row.offerId)).size,
      totalPartners: new Set(mockData.map(row => row.partnerId)).size,
    };
    
    if (summary.totalClicks > 0) {
      summary.avgCR = Math.round((summary.totalConversions / summary.totalClicks) * 10000) / 100;
      summary.avgEPC = Math.round((summary.totalRevenue / summary.totalClicks) * 100) / 100;
    }

    res.json({
      data: mockData,
      summary,
      total: mockData.length
    });
  } catch (error) {
    console.error('Error fetching advertiser statistics:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Partner statistics endpoint
router.get('/partner/statistics', async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'affiliate') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const filters = statisticsFiltersSchema.parse(req.query);
    const mockData = generateMockStatistics({ ...filters, partnerId: user.id });
    
    // Calculate summary for partner
    const summary = {
      totalClicks: mockData.reduce((sum, row) => sum + row.clicks, 0),
      totalConversions: mockData.reduce((sum, row) => sum + row.conversions, 0),
      totalPayout: Math.round(mockData.reduce((sum, row) => sum + row.payout, 0) * 100) / 100,
      avgCR: 0,
      avgEPC: 0,
      totalOffers: new Set(mockData.map(row => row.offerId)).size,
    };
    
    if (summary.totalClicks > 0) {
      summary.avgCR = Math.round((summary.totalConversions / summary.totalClicks) * 10000) / 100;
      summary.avgEPC = Math.round((summary.totalPayout / summary.totalClicks) * 100) / 100;
    }

    res.json({
      data: mockData,
      summary,
      total: mockData.length
    });
  } catch (error) {
    console.error('Error fetching partner statistics:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Export statistics
router.get('/advertiser/statistics/export', async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const filters = statisticsFiltersSchema.extend({
      format: z.enum(['csv', 'xlsx', 'json']).default('csv')
    }).parse(req.query);
    
    const data = generateMockStatistics(filters);
    
    if (filters.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=statistics.json');
      return res.json(data);
    }
    
    if (filters.format === 'csv') {
      const headers = [
        'Дата', 'Страна', 'Устройство', 'Источник', 'Оффер', 'Партнер',
        'Клики', 'Конверсии', 'CR%', 'EPC$', 'Доход$', 'Выплата$', 'Прибыль$'
      ];
      
      let csv = headers.join(',') + '\n';
      data.forEach(row => {
        csv += [
          row.date,
          row.country,
          row.device,
          row.trafficSource,
          row.offerName,
          row.partnerName,
          row.clicks,
          row.conversions,
          row.cr,
          row.epc,
          row.revenue,
          row.payout,
          row.profit
        ].join(',') + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=statistics.csv');
      return res.send(csv);
    }
    
    res.status(400).json({ error: 'Неподдерживаемый формат экспорта' });
  } catch (error) {
    console.error('Error exporting statistics:', error);
    res.status(500).json({ error: 'Ошибка экспорта статистики' });
  }
});

// Offers list for filters
router.get('/advertiser/offers', async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Return real offers from storage
    const offers = await storage.getOffers(user.id);
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Ошибка получения офферов' });
  }
});

// Partners list for filters
router.get('/advertiser/partners', async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Return partners associated with this advertiser
    const partners = await storage.getUsersByOwner(user.id, 'affiliate');
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Ошибка получения партнеров' });
  }
});

export default router;