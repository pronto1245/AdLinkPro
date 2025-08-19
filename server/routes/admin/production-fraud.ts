import express from 'express';
import { ProductionFraudService } from '../../services/productionFraudService';
import { requireRole } from '../../middleware/auth';

const router = express.Router();

// Middleware to require super admin role for all production config endpoints
router.use(requireRole(['super_admin']));

// Get production anti-fraud configuration
router.get('/production-config', async (req, res) => {
  try {
    const stats = await ProductionFraudService.getProductionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting production config:', error);
    res.status(500).json({ error: 'Failed to get production configuration' });
  }
});

// Enable/disable production auto-triggers
router.post('/production-config/auto-triggers', async (req, res) => {
  try {
    const { enabled } = req.body;
    const adminUserId = (req as any).user?.id;

    if (!adminUserId) {
      return res.status(401).json({ error: 'Admin user not authenticated' });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled field must be a boolean' });
    }

    await ProductionFraudService.enableProductionAutoTriggers(adminUserId, enabled);
    
    res.json({ 
      success: true, 
      message: `Auto-triggers ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled
    });
  } catch (error) {
    console.error('Error updating auto-triggers:', error);
    res.status(500).json({ error: 'Failed to update auto-triggers setting' });
  }
});

// Configure auto-blocking
router.post('/production-config/auto-blocking', async (req, res) => {
  try {
    const { enabled, threshold } = req.body;
    const adminUserId = (req as any).user?.id;

    if (!adminUserId) {
      return res.status(401).json({ error: 'Admin user not authenticated' });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled field must be a boolean' });
    }

    if (threshold && (typeof threshold !== 'number' || threshold < 0 || threshold > 100)) {
      return res.status(400).json({ error: 'threshold must be a number between 0 and 100' });
    }

    await ProductionFraudService.configureAutoBlocking(adminUserId, enabled, threshold || 70);
    
    res.json({ 
      success: true, 
      message: `Auto-blocking ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled,
      threshold: threshold || 70
    });
  } catch (error) {
    console.error('Error updating auto-blocking:', error);
    res.status(500).json({ error: 'Failed to update auto-blocking configuration' });
  }
});

// System health check
router.get('/health', async (req, res) => {
  try {
    const health = await ProductionFraudService.healthCheck();
    
    if (health.healthy) {
      res.json(health);
    } else {
      res.status(503).json(health);
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      healthy: false,
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Update fraud report with optimistic locking
router.put('/fraud-reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { updates, expectedVersion } = req.body;

    if (!updates || typeof expectedVersion !== 'number') {
      return res.status(400).json({ 
        error: 'Missing required fields: updates and expectedVersion' 
      });
    }

    const updated = await ProductionFraudService.updateFraudReportWithLocking(
      id, 
      updates, 
      expectedVersion
    );
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating fraud report:', error);
    
    if (error.name === 'OptimisticLockError') {
      res.status(409).json({
        error: 'Conflict: Record was modified by another user',
        details: {
          currentVersion: error.currentVersion,
          attemptedVersion: error.attemptedVersion
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to update fraud report' });
    }
  }
});

// Test webhook functionality
router.post('/webhooks/test', async (req, res) => {
  try {
    const { eventType, testData } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required' });
    }

    const sampleEventData = testData || {
      clickId: 'test-click-123',
      ip: '192.168.1.100',
      fraudScore: 85,
      riskLevel: 'high',
      detectedAt: new Date().toISOString()
    };

    await ProductionFraudService.triggerWebhooks(eventType, sampleEventData);
    
    res.json({ 
      success: true, 
      message: `Test webhooks triggered for event: ${eventType}` 
    });
  } catch (error) {
    console.error('Error testing webhooks:', error);
    res.status(500).json({ error: 'Failed to test webhooks' });
  }
});

// Get system metrics for monitoring
router.get('/metrics', async (req, res) => {
  try {
    const stats = await ProductionFraudService.getProductionStats();
    const health = await ProductionFraudService.healthCheck();
    
    // Format metrics for monitoring systems (Prometheus, DataDog, etc.)
    const metrics = {
      antifraud_total_events: stats.totalClicks || 0,
      antifraud_fraud_events: stats.fraudClicks || 0,
      antifraud_fraud_rate: stats.fraudRate || 0,
      antifraud_blocked_ips: stats.blockedIPs || 0,
      antifraud_pending_reports: stats.pendingReports || 0,
      antifraud_system_healthy: health.healthy ? 1 : 0,
      antifraud_auto_triggers_enabled: stats.configuration?.autoTriggersEnabled ? 1 : 0,
      antifraud_auto_blocking_enabled: stats.configuration?.autoBlockingEnabled ? 1 : 0,
      timestamp: Date.now()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
});

export default router;