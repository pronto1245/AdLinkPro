import { Router } from 'express';
import { enhancedNotificationService } from '../services/enhancedNotifications';
import { db } from '../db';
import { webhookEvents, webhookEndpoints } from '@shared/antifraud-schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Webhook endpoint registry
interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
  headers?: Record<string, string>;
}

class WebhookManager {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private deliveryQueue: Array<{
    endpoint: WebhookEndpoint;
    event: any;
    attempt: number;
  }> = [];

  constructor() {
    this.loadEndpoints();
    this.startDeliveryProcessor();
  }

  private async loadEndpoints() {
    // Load from database if exists, otherwise use defaults
    const defaultEndpoints: WebhookEndpoint[] = [
      {
        id: 'keitaro_main',
        name: 'Keitaro Main Tracker',
        url: process.env.KEITARO_WEBHOOK_URL || 'https://tracker.example.com/webhook',
        secret: process.env.KEITARO_WEBHOOK_SECRET,
        events: ['conversion_created', 'conversion_updated', 'click_fraud_detected'],
        isActive: true,
        retryConfig: {
          maxRetries: 3,
          backoffMs: 5000
        },
        headers: {
          'User-Agent': 'AdLinkPro-Webhook/1.0'
        }
      },
      {
        id: 'external_api',
        name: 'External API Integration',
        url: process.env.EXTERNAL_API_WEBHOOK_URL || 'https://api.external.com/webhooks',
        secret: process.env.EXTERNAL_API_SECRET,
        events: ['fraud_detected', 'user_blocked', 'threshold_exceeded'],
        isActive: true,
        retryConfig: {
          maxRetries: 5,
          backoffMs: 2000
        }
      }
    ];

    defaultEndpoints.forEach(endpoint => {
      this.endpoints.set(endpoint.id, endpoint);
    });
  }

  private startDeliveryProcessor() {
    setInterval(() => {
      this.processDeliveryQueue();
    }, 1000);
  }

  private async processDeliveryQueue() {
    while (this.deliveryQueue.length > 0) {
      const delivery = this.deliveryQueue.shift();
      if (delivery) {
        await this.deliverWebhook(delivery.endpoint, delivery.event, delivery.attempt);
      }
    }
  }

  async sendWebhook(eventType: string, data: any): Promise<void> {
    const endpoints = Array.from(this.endpoints.values()).filter(
      endpoint => endpoint.isActive && endpoint.events.includes(eventType)
    );

    for (const endpoint of endpoints) {
      this.deliveryQueue.push({
        endpoint,
        event: { type: eventType, data, timestamp: new Date() },
        attempt: 1
      });
    }
  }

  private async deliverWebhook(endpoint: WebhookEndpoint, event: any, attempt: number): Promise<void> {
    try {
      const payload = {
        event: event.type,
        data: event.data,
        timestamp: event.timestamp,
        endpoint_id: endpoint.id
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Event-Type': event.type,
        'X-Delivery-Attempt': attempt.toString(),
        'X-Timestamp': event.timestamp.toISOString(),
        ...endpoint.headers
      };

      // Add signature if secret is configured
      if (endpoint.secret) {
        const signature = this.generateSignature(JSON.stringify(payload), endpoint.secret);
        headers['X-Signature'] = signature;
        headers['X-Signature-Algorithm'] = 'sha256';
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        console.log(`✅ Webhook delivered to ${endpoint.name} (attempt ${attempt})`);
        
        // Log successful delivery
        await this.logWebhookDelivery(endpoint.id, event, {
          status: 'success',
          responseStatus: response.status,
          attempt,
          deliveredAt: new Date()
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Webhook delivery failed to ${endpoint.name} (attempt ${attempt}):`, error);
      
      // Log failed delivery
      await this.logWebhookDelivery(endpoint.id, event, {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        attempt,
        failedAt: new Date()
      });

      // Retry if under max retries
      if (attempt < endpoint.retryConfig.maxRetries) {
        setTimeout(() => {
          this.deliveryQueue.push({
            endpoint,
            event,
            attempt: attempt + 1
          });
        }, endpoint.retryConfig.backoffMs * attempt); // Exponential backoff
      }
    }
  }

  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private async logWebhookDelivery(endpointId: string, event: any, delivery: any): Promise<void> {
    try {
      await db.insert(webhookEvents).values({
        endpointId,
        eventType: event.type,
        payload: event.data,
        status: delivery.status,
        responseStatus: delivery.responseStatus,
        errorMessage: delivery.error,
        attempt: delivery.attempt,
        deliveredAt: delivery.deliveredAt || null,
        failedAt: delivery.failedAt || null,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log webhook delivery:', error);
    }
  }

  addEndpoint(endpoint: Omit<WebhookEndpoint, 'id'>): string {
    const id = crypto.randomUUID();
    this.endpoints.set(id, { ...endpoint, id });
    return id;
  }

  updateEndpoint(id: string, updates: Partial<WebhookEndpoint>): boolean {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return false;
    
    this.endpoints.set(id, { ...endpoint, ...updates });
    return true;
  }

  deleteEndpoint(id: string): boolean {
    return this.endpoints.delete(id);
  }

  getEndpoints(): WebhookEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  getEndpoint(id: string): WebhookEndpoint | undefined {
    return this.endpoints.get(id);
  }
}

const webhookManager = new WebhookManager();

// Universal webhook event endpoint
router.post('/events', async (req, res) => {
  try {
    const { event_type, data, source, severity = 'medium' } = req.body;
    
    if (!event_type || !data) {
      return res.status(400).json({
        error: 'Missing required fields: event_type, data'
      });
    }

    // Send to notification system
    await enhancedNotificationService.sendWebhookEvent({
      type: event_type,
      data,
      timestamp: new Date(),
      severity,
      source: source || 'external'
    });

    // Send to registered webhook endpoints
    await webhookManager.sendWebhook(event_type, data);

    res.json({
      success: true,
      message: 'Event processed successfully'
    });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Incoming webhook for external systems (Keitaro, etc.)
router.post('/incoming/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const payload = req.body;
    
    console.log(`📥 Incoming webhook from ${source}:`, payload);

    // Process based on source
    let processedEvent;
    switch (source) {
      case 'keitaro':
        processedEvent = await processKeitaroWebhook(payload);
        break;
      case 'postback':
        processedEvent = await processPostbackWebhook(payload);
        break;
      case 'tracker':
        processedEvent = await processTrackerWebhook(payload);
        break;
      default:
        processedEvent = await processGenericWebhook(payload, source);
    }

    if (processedEvent) {
      await enhancedNotificationService.sendWebhookEvent(processedEvent);
    }

    res.json({
      success: true,
      message: `Webhook from ${source} processed`,
      data: processedEvent
    });
  } catch (error) {
    console.error(`Error processing ${req.params.source} webhook:`, error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Webhook endpoint management
router.get('/endpoints', async (req, res) => {
  try {
    const endpoints = webhookManager.getEndpoints();
    res.json({
      success: true,
      data: endpoints
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/endpoints', async (req, res) => {
  try {
    const { name, url, secret, events, retryConfig, headers } = req.body;
    
    if (!name || !url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Missing required fields: name, url, events'
      });
    }

    const endpointId = webhookManager.addEndpoint({
      name,
      url,
      secret,
      events,
      isActive: true,
      retryConfig: retryConfig || { maxRetries: 3, backoffMs: 5000 },
      headers
    });

    res.json({
      success: true,
      data: { id: endpointId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/endpoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = webhookManager.updateEndpoint(id, updates);
    
    if (!success) {
      return res.status(404).json({
        error: 'Endpoint not found'
      });
    }

    res.json({
      success: true,
      message: 'Endpoint updated'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/endpoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = webhookManager.deleteEndpoint(id);
    
    if (!success) {
      return res.status(404).json({
        error: 'Endpoint not found'
      });
    }

    res.json({
      success: true,
      message: 'Endpoint deleted'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook delivery logs
router.get('/logs', async (req, res) => {
  try {
    const { endpoint_id, event_type, status, limit = 50 } = req.query;
    
    let query = db.select().from(webhookEvents);
    
    if (endpoint_id) {
      query = query.where(eq(webhookEvents.endpointId, endpoint_id as string));
    }
    
    const logs = await query.limit(Number(limit)).orderBy(webhookEvents.createdAt);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint
router.post('/test/:endpointId', async (req, res) => {
  try {
    const { endpointId } = req.params;
    const endpoint = webhookManager.getEndpoint(endpointId);
    
    if (!endpoint) {
      return res.status(404).json({
        error: 'Endpoint not found'
      });
    }

    const testEvent = {
      type: 'test_event',
      data: {
        message: 'This is a test webhook delivery',
        timestamp: new Date(),
        test: true
      },
      timestamp: new Date()
    };

    await webhookManager.sendWebhook('test_event', testEvent.data);

    res.json({
      success: true,
      message: 'Test webhook sent'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions for processing different webhook sources
async function processKeitaroWebhook(payload: any) {
  // Process Keitaro-specific webhook format
  if (payload.event === 'conversion') {
    return {
      type: 'conversion_created',
      data: {
        amount: payload.revenue,
        currency: payload.currency || 'USD',
        offerName: payload.offer_name,
        partnerName: payload.affiliate_name,
        country: payload.country,
        clickId: payload.sub_id
      },
      timestamp: new Date(),
      severity: 'low' as const,
      source: 'keitaro'
    };
  }
  
  return null;
}

async function processPostbackWebhook(payload: any) {
  // Process generic postback format
  return {
    type: 'conversion_updated',
    data: {
      status: payload.status,
      clickId: payload.click_id,
      revenue: payload.revenue,
      currency: payload.currency
    },
    timestamp: new Date(),
    severity: 'low' as const,
    source: 'postback'
  };
}

async function processTrackerWebhook(payload: any) {
  // Process tracker-specific webhook format
  return {
    type: 'click_tracked',
    data: payload,
    timestamp: new Date(),
    severity: 'low' as const,
    source: 'tracker'
  };
}

async function processGenericWebhook(payload: any, source: string) {
  // Process generic webhook format
  return {
    type: payload.event || 'generic_event',
    data: payload.data || payload,
    timestamp: new Date(),
    severity: payload.severity || 'medium' as const,
    source
  };
}

export default router;
export { webhookManager };