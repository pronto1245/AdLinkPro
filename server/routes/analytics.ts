import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Analytics data query schema
const analyticsQuerySchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  quickFilter: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('50'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).catchall(z.string().optional()); // For dynamic filter_* parameters

// Export schema
const exportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'json']),
  filters: z.object({
    searchTerm: z.string().optional(),
    dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional()
    }).optional(),
    quickFilter: z.string().optional(),
    filters: z.record(z.string()).optional()
  }),
  columns: z.array(z.string())
});

// Get analytics data
router.get('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    
    // Extract filters from filter_* parameters
    const filters: Record<string, string> = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (key.startsWith('filter_') && typeof value === 'string') {
        const filterKey = key.replace('filter_', '');
        filters[filterKey] = value;
      }
    });

    const analyticsData = await storage.getAnalyticsData({
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      quickFilter: query.quickFilter,
      page: query.page,
      limit: Math.min(query.limit, 1000), // Limit max results
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filters
    });

    res.json(analyticsData);
  } catch (error) {
    console.error('Get analytics data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export analytics data
router.post('/export', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { format, filters, columns } = exportSchema.parse(req.body);
    
    const exportResult = await storage.exportAnalyticsData({
      format,
      filters,
      columns
    });

    res.json(exportResult);
  } catch (error) {
    console.error('Export analytics data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics summary/stats
router.get('/summary', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { dateFrom, dateTo, quickFilter } = req.query;
    
    const summary = await storage.getAnalyticsSummary({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      quickFilter: quickFilter as string
    });

    res.json(summary);
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique values for filters (countries, offers, partners, etc.)
router.get('/filter-options', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { field } = req.query;
    
    if (!field || typeof field !== 'string') {
      return res.status(400).json({ error: 'Field parameter is required' });
    }

    const options = await storage.getAnalyticsFilterOptions(field);
    res.json(options);
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;