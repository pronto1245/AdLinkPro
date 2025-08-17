import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import type { User } from '@shared/schema';
import { storage } from '../storage';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

// Business Report Schema
const businessReportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['analytics', 'financial', 'performance', 'custom']),
  schedule: z.enum(['manual', 'daily', 'weekly', 'monthly']),
  recipients: z.array(z.string().email()),
  metrics: z.array(z.string()),
  filters: z.record(z.any()).optional().default({}),
  format: z.enum(['pdf', 'excel', 'csv', 'json']),
  isActive: z.boolean().default(true)
});

const updateReportSchema = businessReportSchema.partial();

// Get all business reports for advertiser
router.get('/advertiser/business-reports', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For now, return mock data as the reports table doesn't exist yet
    // In production, this would query the actual business_reports table
    const mockReports = [
      {
        id: '1',
        name: 'Ежедневная производительность',
        description: 'Основные метрики за день',
        type: 'performance',
        schedule: 'daily',
        recipients: ['admin@example.com'],
        metrics: ['clicks', 'conversions', 'cr', 'revenue'],
        filters: { period: '24h' },
        format: 'pdf',
        isActive: true,
        lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Еженедельная сводка',
        description: 'Полная сводка за неделю',
        type: 'analytics',
        schedule: 'weekly',
        recipients: ['manager@example.com'],
        metrics: ['clicks', 'conversions', 'revenue', 'partners', 'countries'],
        filters: { period: '7d' },
        format: 'excel',
        isActive: true,
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json(mockReports);
  } catch (error) {
    console.error('Business reports error:', error);
    res.status(500).json({ error: 'Failed to fetch business reports' });
  }
});

// Create new business report
router.post('/advertiser/business-reports', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = businessReportSchema.parse(req.body);
    
    // For now, simulate creation
    const newReport = {
      id: nanoid(),
      ...data,
      lastGenerated: null,
      nextScheduled: data.schedule !== 'manual' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating business report:', newReport);

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Create business report error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create business report' });
  }
});

// Update business report
router.patch('/advertiser/business-reports/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const data = updateReportSchema.parse(req.body);

    console.log('Updating business report:', id, data);

    // For now, simulate update
    const updatedReport = {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };

    res.json(updatedReport);
  } catch (error) {
    console.error('Update business report error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update business report' });
  }
});

// Delete business report
router.delete('/advertiser/business-reports/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    console.log('Deleting business report:', id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete business report error:', error);
    res.status(500).json({ error: 'Failed to delete business report' });
  }
});

// Generate business report
router.post('/advertiser/business-reports/:id/generate', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    console.log('Generating business report:', id);

    // For now, simulate report generation
    // In production, this would trigger a background job to generate the actual report
    const result = {
      id,
      status: 'generating',
      message: 'Report generation started',
      estimatedTime: 'few minutes',
      downloadUrl: null // Would be provided once generation is complete
    };

    res.json(result);
  } catch (error) {
    console.error('Generate business report error:', error);
    res.status(500).json({ error: 'Failed to generate business report' });
  }
});

// Get business report analytics data
router.get('/advertiser/business-reports/:id/data', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { format = 'json' } = req.query;

    // This would fetch actual analytics data based on report configuration
    const mockData = {
      reportId: id,
      generatedAt: new Date().toISOString(),
      period: '24h',
      data: {
        clicks: 1247,
        conversions: 89,
        cr: 7.14,
        revenue: 2150.50,
        partners: 12,
        countries: ['US', 'GB', 'CA', 'AU'],
        topOffers: [
          { id: '1', name: 'Premium Offer', clicks: 542, conversions: 38 },
          { id: '2', name: 'Standard Offer', clicks: 705, conversions: 51 }
        ],
        chartData: [
          { date: '2024-01-01', clicks: 345, conversions: 24 },
          { date: '2024-01-02', clicks: 432, conversions: 31 },
          { date: '2024-01-03', clicks: 470, conversions: 34 }
        ]
      }
    };

    // Set appropriate headers based on format
    switch (format) {
      case 'csv':
        res.set({
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${id}.csv"`
        });
        // Convert to CSV format
        break;
      case 'excel':
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="report-${id}.xlsx"`
        });
        // Convert to Excel format
        break;
      default:
        res.set('Content-Type', 'application/json');
    }

    res.json(mockData);
  } catch (error) {
    console.error('Get report data error:', error);
    res.status(500).json({ error: 'Failed to get report data' });
  }
});

export default router;