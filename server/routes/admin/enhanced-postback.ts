import express from 'express';
import { EnhancedPostbackService } from '../services/enhancedPostbackService';
import { IPWhitelistService } from '../services/ipWhitelistService';

const router = express.Router();

// Enhanced postback delivery endpoint
router.post('/postbacks/deliver', async (req, res) => {
  try {
    const { postbackId, eventType, macros, clickId } = req.body;
    
    if (!postbackId || !eventType || !macros) {
      return res.status(400).json({ error: 'Missing required fields: postbackId, eventType, macros' });
    }
    
    const result = await EnhancedPostbackService.deliverPostbackWithRetry(
      postbackId, 
      eventType, 
      macros, 
      clickId
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error in postback delivery:', error);
    res.status(500).json({ error: 'Postback delivery failed' });
  }
});

// Postback statistics endpoint
router.get('/postbacks/stats', async (req, res) => {
  try {
    const { timeframe = 'daily' } = req.query;
    const stats = await EnhancedPostbackService.getPostbackStats(timeframe as 'hourly' | 'daily' | 'weekly');
    res.json(stats);
  } catch (error) {
    console.error('Error getting postback stats:', error);
    res.status(500).json({ error: 'Failed to get postback statistics' });
  }
});

// Bulk retry failed postbacks
router.post('/postbacks/retry-failed', async (req, res) => {
  try {
    const { hours = 24 } = req.body;
    const result = await EnhancedPostbackService.bulkRetryFailedPostbacks(hours);
    res.json(result);
  } catch (error) {
    console.error('Error in bulk retry:', error);
    res.status(500).json({ error: 'Bulk retry failed' });
  }
});

// Validate postback endpoint
router.post('/postbacks/validate', async (req, res) => {
  try {
    const { url, timeout = 5000 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const result = await EnhancedPostbackService.validatePostbackEndpoint(url, timeout);
    res.json(result);
  } catch (error) {
    console.error('Error validating postback endpoint:', error);
    res.status(500).json({ error: 'Endpoint validation failed' });
  }
});

// Postback IP whitelisting endpoints
router.get('/postbacks/whitelist', async (req, res) => {
  try {
    const { search, active, page, limit } = req.query;
    const filters = {
      search: search as string,
      active: active !== undefined ? active === 'true' : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };
    
    const result = await IPWhitelistService.getWhitelist(filters);
    
    // Filter for postback-related entries
    const postbackWhitelist = {
      data: result.data.filter(entry => 
        entry.description?.toLowerCase().includes('postback') ||
        entry.description?.toLowerCase().includes('tracker')
      ),
      total: result.data.filter(entry => 
        entry.description?.toLowerCase().includes('postback') ||
        entry.description?.toLowerCase().includes('tracker')
      ).length
    };
    
    res.json(postbackWhitelist);
  } catch (error) {
    console.error('Error getting postback whitelist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/postbacks/whitelist', async (req, res) => {
  try {
    const { ip, cidr, description, expiresAt } = req.body;
    
    if (!ip || !description) {
      return res.status(400).json({ error: 'Missing required fields: ip, description' });
    }
    
    const entry = await IPWhitelistService.addToWhitelist({
      ip,
      cidr,
      description: `Postback: ${description}`,
      addedBy: 'postback_admin',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: true
    });
    
    res.json(entry);
  } catch (error) {
    console.error('Error adding postback IP to whitelist:', error);
    res.status(500).json({ error: 'Failed to add IP to postback whitelist' });
  }
});

// Test postback configuration
router.post('/postbacks/test', async (req, res) => {
  try {
    const { url, method = 'GET', macros = {}, hmacSecret } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Create test macros
    const testMacros = {
      clickid: 'test_click_123',
      status: 'test',
      offer_id: 'test_offer',
      partner_id: 'test_partner',
      revenue: '10.00',
      currency: 'USD',
      ...macros
    };
    
    const startTime = Date.now();
    
    // Build URL with macros (simplified)
    let testUrl = url;
    Object.entries(testMacros).forEach(([key, value]) => {
      testUrl = testUrl.replace(`{${key}}`, encodeURIComponent(String(value)));
      testUrl = testUrl.replace(`[${key}]`, encodeURIComponent(String(value)));
    });
    
    // Test the postback
    const headers: Record<string, string> = {
      'User-Agent': 'Postback-Test/1.0',
      'Content-Type': 'application/json',
    };
    
    if (hmacSecret) {
      // Add HMAC for testing
      const crypto = await import('crypto');
      const signature = crypto.createHmac('sha256', hmacSecret)
        .update(JSON.stringify(testMacros))
        .digest('hex');
      headers['X-Signature'] = signature;
    }
    
    const response = await fetch(testUrl, {
      method: method as string,
      headers,
      body: method === 'POST' ? JSON.stringify(testMacros) : undefined,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const responseText = await response.text().catch(() => '');
    const duration = Date.now() - startTime;
    
    res.json({
      success: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
      responseBody: responseText.substring(0, 1000),
      duration: `${duration}ms`,
      testUrl,
      testMacros
    });
    
  } catch (error) {
    console.error('Error testing postback:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      duration: '0ms'
    });
  }
});

// Get postback delivery logs
router.get('/postbacks/logs', async (req, res) => {
  try {
    const { postbackId, status, limit = 100, offset = 0 } = req.query;
    
    // This would require implementing a proper logs query in the service
    // For now, return a placeholder response
    res.json({
      logs: [],
      total: 0,
      message: 'Postback logs endpoint - implementation in progress'
    });
  } catch (error) {
    console.error('Error getting postback logs:', error);
    res.status(500).json({ error: 'Failed to get postback logs' });
  }
});

export default router;