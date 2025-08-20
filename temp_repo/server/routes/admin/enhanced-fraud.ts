import express from 'express';
import { EnhancedFraudService } from '../services/enhancedFraudService';
import { IPWhitelistService } from '../services/ipWhitelistService';

const router = express.Router();

// Enhanced fraud detection endpoints
router.get('/fraud-stats/realtime', async (req, res) => {
  try {
    const stats = await EnhancedFraudService.getRealTimeFraudStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting real-time fraud stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// IP Whitelist management endpoints
router.get('/whitelist', async (req, res) => {
  try {
    const { search, active, page, limit } = req.query;
    const filters = {
      search: search as string,
      active: active !== undefined ? active === 'true' : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };
    
    const result = await IPWhitelistService.getWhitelist(filters);
    res.json(result);
  } catch (error) {
    console.error('Error getting whitelist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/whitelist', async (req, res) => {
  try {
    const { ip, cidr, description, addedBy, expiresAt } = req.body;
    
    if (!ip || !description || !addedBy) {
      return res.status(400).json({ error: 'Missing required fields: ip, description, addedBy' });
    }
    
    const entry = await IPWhitelistService.addToWhitelist({
      ip,
      cidr,
      description,
      addedBy,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: true
    });
    
    res.json(entry);
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    res.status(500).json({ error: 'Failed to add IP to whitelist' });
  }
});

router.put('/whitelist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = await IPWhitelistService.updateWhitelistEntry(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Whitelist entry not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating whitelist entry:', error);
    res.status(500).json({ error: 'Failed to update whitelist entry' });
  }
});

router.delete('/whitelist/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    await IPWhitelistService.removeFromWhitelist(ip);
    res.json({ success: true, message: `Removed ${ip} from whitelist` });
  } catch (error) {
    console.error('Error removing from whitelist:', error);
    res.status(500).json({ error: 'Failed to remove IP from whitelist' });
  }
});

router.get('/whitelist/check/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const isWhitelisted = await IPWhitelistService.isWhitelisted(ip);
    res.json({ ip, isWhitelisted });
  } catch (error) {
    console.error('Error checking whitelist:', error);
    res.status(500).json({ error: 'Failed to check whitelist status' });
  }
});

router.post('/whitelist/bulk', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries must be an array' });
    }
    
    const results = await IPWhitelistService.bulkAddToWhitelist(entries);
    res.json({ success: true, added: results.length, entries: results });
  } catch (error) {
    console.error('Error bulk adding to whitelist:', error);
    res.status(500).json({ error: 'Failed to bulk add to whitelist' });
  }
});

router.post('/whitelist/auto-trust', async (req, res) => {
  try {
    await IPWhitelistService.autoWhitelistTrustedSources();
    res.json({ success: true, message: 'Auto-whitelisted trusted sources' });
  } catch (error) {
    console.error('Error auto-whitelisting:', error);
    res.status(500).json({ error: 'Failed to auto-whitelist trusted sources' });
  }
});

export default router;