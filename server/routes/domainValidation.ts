import express from 'express';
import { enhancedDNS } from '../services/enhancedDNS.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Validate domain DNS configuration before adding
 * 
 * This endpoint allows real-time validation of domain DNS settings
 * to provide immediate feedback to users
 */
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { domain, type = 'cname' } = req.body;

    if (!domain) {
      return res.status(400).json({
        valid: false,
        message: 'Domain name is required'
      });
    }

    // Basic domain format validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid domain format. Please use a valid domain name like track.example.com'
      });
    }

    // Check if domain already exists for this advertiser
    const { db } = await import('../db.js');
    const { customDomains } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const existingDomain = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.domain, domain.toLowerCase()))
      .limit(1);

    if (existingDomain.length > 0) {
      return res.status(409).json({
        valid: false,
        message: 'This domain is already registered in the system'
      });
    }

    // Perform DNS validation based on type
    let dnsResult;
    let configured = false;
    let validationMessage = 'Domain is valid and can be added';

    if (type === 'cname') {
      dnsResult = await enhancedDNS.resolveCname(domain);
      if (dnsResult.success && dnsResult.records) {
        // Check if CNAME is already pointing to our platform
        configured = dnsResult.records.some(record => 
          record.includes('arbiconnect.app') || 
          record.includes('affiliate-tracker.replit.app')
        );
        
        if (configured) {
          validationMessage = 'DNS is already configured correctly. You can proceed with verification immediately after adding.';
        } else {
          validationMessage = `Domain is valid. Current CNAME points to: ${dnsResult.records[0] || 'unknown'}. You'll need to update it after adding the domain.`;
        }
      } else {
        // No CNAME record found - this is normal for new domains
        validationMessage = 'Domain is valid. You\'ll need to add a CNAME record after adding the domain.';
      }
    } else if (type === 'a_record') {
      dnsResult = await enhancedDNS.resolveA(domain);
      if (dnsResult.success && dnsResult.records) {
        const expectedIp = process.env.SERVER_IP || '0.0.0.0';
        configured = dnsResult.records.includes(expectedIp);
        
        if (configured) {
          validationMessage = 'DNS is already configured correctly. You can proceed with verification immediately after adding.';
        } else {
          validationMessage = `Domain is valid. Current A record points to: ${dnsResult.records[0] || 'unknown'}. You'll need to update it after adding the domain.`;
        }
      } else {
        validationMessage = 'Domain is valid. You\'ll need to add an A record after adding the domain.';
      }
    }

    // Check if domain is reachable
    let reachable = false;
    try {
      const response = await fetch(`http://${domain}`, { 
        method: 'HEAD', 
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });
      reachable = true;
    } catch (error) {
      // Domain not reachable - this is normal for new domains
    }

    return res.json({
      valid: true,
      configured,
      reachable,
      message: validationMessage,
      details: {
        type,
        domain: domain.toLowerCase(),
        hasExistingRecords: dnsResult?.success || false,
        fromCache: dnsResult?.fromCache || false
      }
    });

  } catch (error: any) {
    console.error('Domain validation error:', error);
    
    // Handle specific DNS errors with user-friendly messages
    if (error.type) {
      switch (error.type) {
        case 'TIMEOUT':
          return res.status(408).json({
            valid: false,
            message: 'DNS validation timed out. The domain may be valid, but DNS servers are slow.'
          });
        case 'NETWORK_ERROR':
          return res.status(503).json({
            valid: false,
            message: 'Network error during validation. Please check your connection and try again.'
          });
        case 'INVALID_DOMAIN':
          return res.status(400).json({
            valid: false,
            message: 'Invalid domain name format. Please check the domain name.'
          });
        default:
          return res.status(500).json({
            valid: false,
            message: 'DNS validation failed. The domain may still be valid - you can try adding it.'
          });
      }
    }

    return res.status(500).json({
      valid: false,
      message: 'Unable to validate domain at this time. You can still try adding it.'
    });
  }
});

export { router as domainValidationRouter };