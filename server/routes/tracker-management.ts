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

// Tracker Configuration Schema
const trackerConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['keitaro', 'voluum', 'binom', 'thrive', 'custom']),
  baseUrl: z.string().url('Valid URL is required'),
  apiKey: z.string().optional(),
  webhookUrl: z.string().url('Valid webhook URL is required'),
  isActive: z.boolean().default(true),
  settings: z.object({
    trackClicks: z.boolean().default(true),
    trackConversions: z.boolean().default(true),
    trackPostbacks: z.boolean().default(true),
    realTimeSync: z.boolean().default(false),
    customParams: z.record(z.string()).default({}),
    eventMapping: z.record(z.string()).default({})
  })
});

const updateTrackerSchema = trackerConfigSchema.partial();

// Get all trackers for advertiser
router.get('/advertiser/trackers', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mock tracker data for demonstration
    const mockTrackers = [
      {
        id: '1',
        name: 'Main Keitaro Tracker',
        type: 'keitaro',
        baseUrl: 'https://tracker.example.com',
        apiKey: 'hidden_api_key',
        webhookUrl: 'https://tracker.example.com/webhook',
        isActive: true,
        settings: {
          trackClicks: true,
          trackConversions: true,
          trackPostbacks: true,
          realTimeSync: true,
          customParams: {
            'campaign_id': 'adlinkpro_integration',
            'source': 'direct'
          },
          eventMapping: {
            'click': 'click',
            'lead': 'lead',
            'deposit': 'sale',
            'conversion': 'conversion'
          }
        },
        statistics: {
          totalEvents: 15420,
          successfulEvents: 14987,
          failedEvents: 433,
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          uptime: 97.2
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Voluum Integration',
        type: 'voluum',
        baseUrl: 'https://voluum-tracker.example.com',
        apiKey: 'hidden_voluum_key',
        webhookUrl: 'https://voluum-tracker.example.com/api/v1/postback',
        isActive: false,
        settings: {
          trackClicks: true,
          trackConversions: true,
          trackPostbacks: false,
          realTimeSync: false,
          customParams: {},
          eventMapping: {
            'click': 'visit',
            'lead': 'conversion',
            'deposit': 'conversion',
            'conversion': 'conversion'
          }
        },
        statistics: {
          totalEvents: 8250,
          successfulEvents: 7890,
          failedEvents: 360,
          lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          uptime: 95.6
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json(mockTrackers);
  } catch (error) {
    console.error('Trackers error:', error);
    res.status(500).json({ error: 'Failed to fetch trackers' });
  }
});

// Create new tracker
router.post('/advertiser/trackers', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = trackerConfigSchema.parse(req.body);
    
    // Create new tracker
    const newTracker = {
      id: nanoid(),
      ...data,
      statistics: {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        lastSync: null,
        uptime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating tracker:', newTracker);

    res.status(201).json(newTracker);
  } catch (error) {
    console.error('Create tracker error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create tracker' });
  }
});

// Update tracker
router.patch('/advertiser/trackers/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const data = updateTrackerSchema.parse(req.body);

    console.log('Updating tracker:', id, data);

    // Simulate update
    const updatedTracker = {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };

    res.json(updatedTracker);
  } catch (error) {
    console.error('Update tracker error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update tracker' });
  }
});

// Delete tracker
router.delete('/advertiser/trackers/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    console.log('Deleting tracker:', id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete tracker error:', error);
    res.status(500).json({ error: 'Failed to delete tracker' });
  }
});

// Test tracker connection
router.post('/advertiser/trackers/:id/test', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    // Simulate connection test
    console.log('Testing tracker connection:', id);
    
    // Mock successful connection
    const isSuccessful = Math.random() > 0.3; // 70% success rate for demo

    const result = {
      success: isSuccessful,
      message: isSuccessful 
        ? 'Соединение с трекером установлено успешно'
        : 'Не удалось подключиться к трекеру. Проверьте настройки.',
      responseTime: Math.floor(Math.random() * 1000) + 200, // 200-1200ms
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Test tracker error:', error);
    res.status(500).json({ error: 'Failed to test tracker connection' });
  }
});

// Sync tracker data
router.post('/advertiser/trackers/:id/sync', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    console.log('Syncing tracker data:', id);

    // Simulate sync process
    const result = {
      id,
      status: 'started',
      message: 'Синхронизация данных запущена',
      estimatedTime: 'few minutes',
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Sync tracker error:', error);
    res.status(500).json({ error: 'Failed to sync tracker data' });
  }
});

// Get tracker events
router.get('/advertiser/trackers/:id/events', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Mock events data
    const mockEvents = Array.from({ length: parseInt(limit as string) }, (_, i) => {
      const eventTypes = ['click', 'lead', 'deposit', 'conversion'];
      const statuses = ['success', 'failed', 'pending'];
      
      return {
        id: `event_${offset}_${i + 1}`,
        trackerId: id,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)] as 'success' | 'failed' | 'pending',
        data: {
          clickId: `click_${Math.random().toString(36).substr(2, 9)}`,
          offerId: Math.floor(Math.random() * 10) + 1,
          partnerId: Math.floor(Math.random() * 20) + 1,
          revenue: Math.random() > 0.7 ? parseFloat((Math.random() * 100).toFixed(2)) : 0,
          country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
          device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)]
        },
        response: Math.random() > 0.8 ? '{"status":"ok","message":"Event processed"}' : undefined,
        errorMessage: Math.random() < 0.1 ? 'Connection timeout' : undefined,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        retryCount: Math.floor(Math.random() * 3)
      };
    });

    res.json(mockEvents);
  } catch (error) {
    console.error('Get tracker events error:', error);
    res.status(500).json({ error: 'Failed to get tracker events' });
  }
});

// Webhook endpoint for receiving tracker data
router.post('/webhooks/tracker/:trackerId', async (req: Request, res: Response) => {
  try {
    const { trackerId } = req.params;
    const webhookData = req.body;
    
    console.log('Received tracker webhook:', { trackerId, data: webhookData });

    // Process webhook data
    // In production, this would:
    // 1. Validate the webhook signature
    // 2. Parse the data according to tracker type
    // 3. Store the event in database
    // 4. Update statistics
    // 5. Trigger any necessary actions

    // Simulate processing
    const processedEvent = {
      id: nanoid(),
      trackerId,
      eventType: webhookData.event_type || 'click',
      status: 'success' as const,
      data: webhookData,
      timestamp: new Date().toISOString(),
      processed: true
    };

    res.json({ 
      success: true, 
      eventId: processedEvent.id,
      message: 'Event processed successfully' 
    });
  } catch (error) {
    console.error('Tracker webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Get tracker statistics
router.get('/advertiser/trackers/:id/statistics', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { period = '7d' } = req.query;

    // Mock statistics data
    const stats = {
      trackerId: id,
      period,
      summary: {
        totalEvents: 15420,
        successfulEvents: 14987,
        failedEvents: 433,
        successRate: 97.2,
        avgResponseTime: 245,
        uptime: 97.2
      },
      eventsByType: [
        { type: 'click', count: 12450, percentage: 80.7 },
        { type: 'lead', count: 1890, percentage: 12.3 },
        { type: 'deposit', count: 780, percentage: 5.1 },
        { type: 'conversion', count: 300, percentage: 1.9 }
      ],
      timeline: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        events: Math.floor(Math.random() * 3000) + 1000,
        successful: Math.floor(Math.random() * 2900) + 1000,
        failed: Math.floor(Math.random() * 100) + 10,
        avgResponseTime: Math.floor(Math.random() * 500) + 200
      })).reverse(),
      errorTypes: [
        { type: 'timeout', count: 245, percentage: 56.6 },
        { type: 'connection_error', count: 123, percentage: 28.4 },
        { type: 'invalid_response', count: 65, percentage: 15.0 }
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error('Tracker statistics error:', error);
    res.status(500).json({ error: 'Failed to get tracker statistics' });
  }
});

// Get tracker integration status
router.get('/advertiser/trackers/:id/status', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'advertiser') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    // Mock status data
    const status = {
      trackerId: id,
      isConnected: Math.random() > 0.2,
      lastHealthCheck: new Date().toISOString(),
      configuration: {
        webhookUrl: `${process.env.BASE_URL || 'https://api.adlinkpro.com'}/api/webhooks/tracker/${id}`,
        apiEndpoints: {
          test: `/api/advertiser/trackers/${id}/test`,
          sync: `/api/advertiser/trackers/${id}/sync`,
          events: `/api/advertiser/trackers/${id}/events`,
          statistics: `/api/advertiser/trackers/${id}/statistics`
        }
      },
      health: {
        uptime: 97.2,
        avgResponseTime: 245,
        errorRate: 2.8,
        lastError: Math.random() > 0.5 ? {
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Connection timeout after 30 seconds',
          type: 'timeout'
        } : null
      }
    };

    res.json(status);
  } catch (error) {
    console.error('Tracker status error:', error);
    res.status(500).json({ error: 'Failed to get tracker status' });
  }
});

export default router;