import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { 
  clickEventSchema, 
  conversionEventSchema, 
  parseSub2,
  clicks,
  events,
  type ClickEventData,
  type ConversionEventData,
  type NewClick,
  type NewEvent
} from '@shared/tracking-events-schema';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

// UA parser (simplified - in production use ua-parser-js or similar)
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browserName = 'unknown';
  let browserVersion = '';
  
  if (ua.includes('chrome')) {
    browserName = 'Chrome';
    const match = ua.match(/chrome\/([0-9.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/firefox\/([0-9.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('safari')) {
    browserName = 'Safari';
    const match = ua.match(/version\/([0-9.]+)/);
    browserVersion = match ? match[1] : '';
  }
  
  // OS detection
  let osName = 'unknown';
  let osVersion = '';
  
  if (ua.includes('windows')) {
    osName = 'Windows';
    if (ua.includes('windows nt 10.0')) osVersion = '10';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.1')) osVersion = '7';
  } else if (ua.includes('mac os')) {
    osName = 'macOS';
    const match = ua.match(/mac os x ([0-9_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  } else if (ua.includes('android')) {
    osName = 'Android';
    const match = ua.match(/android ([0-9.]+)/);
    osVersion = match ? match[1] : '';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    osName = 'iOS';
    const match = ua.match(/os ([0-9_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  }
  
  // Device model (simplified)
  let deviceModel = '';
  if (ua.includes('iphone')) deviceModel = 'iPhone';
  else if (ua.includes('ipad')) deviceModel = 'iPad';
  else if (ua.includes('android')) {
    const match = ua.match(/android[^;]*;\s*([^)]+)/);
    deviceModel = match ? match[1].trim() : 'Android Device';
  }
  
  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceModel
  };
}

// IP geolocation (mock - in production use MaxMind GeoIP2 or similar)
function getGeoData(ip: string) {
  // Mock implementation - replace with real geolocation service
  const mockGeoData = {
    '127.0.0.1': { country: 'US', region: 'CA', city: 'San Francisco', isp: 'Local ISP', operator: null },
    '192.168.1.1': { country: 'US', region: 'NY', city: 'New York', isp: 'Verizon', operator: 'Verizon' },
  };
  
  return mockGeoData[ip as keyof typeof mockGeoData] || {
    country: 'US',
    region: 'Unknown',
    city: 'Unknown',
    isp: 'Unknown ISP',
    operator: null
  };
}

// Check if IP is proxy (mock - use real proxy detection service)
function isProxyIp(ip: string): boolean {
  // Mock implementation
  return false;
}

// Generate unique clickid
function generateClickId(): string {
  return nanoid(16); // 16 character unique ID
}

// GET /click - Initial click tracking and redirect
router.get('/click', async (req: Request, res: Response) => {
  try {
    const query = req.query;
    
    // Validate basic required params
    const offerId = query.offer_id as string;
    const landingUrl = query.landing_url as string;
    
    if (!offerId || !landingUrl) {
      return res.status(400).json({ 
        error: 'Missing required parameters: offer_id, landing_url' 
      });
    }
    
    // Generate clickid if not provided
    const clickid = (query.clickid as string) || generateClickId();
    const visitorCode = (query.visitor_code as string) || nanoid(32);
    
    // Get client IP
    const ip = req.headers['x-forwarded-for'] as string || 
               req.headers['x-real-ip'] as string || 
               req.connection.remoteAddress || 
               req.ip || 
               '127.0.0.1';
    
    // Parse user agent
    const userAgent = req.headers['user-agent'] || '';
    const parsedUA = parseUserAgent(userAgent);
    
    // Get geo data
    const geoData = getGeoData(ip);
    
    // Prepare click data
    const clickData: NewClick = {
      clickid,
      visitorCode,
      
      // Attribution from query params
      campaignId: query.campaign_id as string,
      sourceId: query.source_id as string,
      flowId: query.flow_id as string,
      offerId: query.offer_id as string,
      landingId: query.landing_id as string,
      adCampaignId: query.ad_campaign_id as string,
      externalId: query.external_id as string,
      creativeId: query.creative_id as string,
      
      // Marketing
      referrer: req.headers.referer,
      site: req.headers.host,
      utmSource: query.utm_source as string,
      utmMedium: query.utm_medium as string,
      utmCampaign: query.utm_campaign as string,
      utmTerm: query.utm_term as string,
      utmContent: query.utm_content as string,
      
      // Subs
      sub1: query.sub1 as string,
      sub2: query.sub2 as string,
      sub3: query.sub3 as string,
      sub4: query.sub4 as string,
      sub5: query.sub5 as string,
      sub6: query.sub6 as string,
      sub7: query.sub7 as string,
      sub8: query.sub8 as string,
      sub9: query.sub9 as string,
      sub10: query.sub10 as string,
      
      // Parse sub2
      sub2Raw: query.sub2 as string,
      sub2Map: query.sub2 ? parseSub2(query.sub2 as string) : null,
      
      // Client data (from headers/detection)
      userAgent,
      deviceType: query.device_type as any || 'desktop', // Will be detected by client
      
      // Server enriched
      ip,
      countryIso: geoData.country,
      region: geoData.region,
      city: geoData.city,
      isp: geoData.isp,
      operator: geoData.operator,
      isProxy: isProxyIp(ip),
      
      // UA parsing
      browserName: parsedUA.browserName,
      browserVersion: parsedUA.browserVersion,
      osName: parsedUA.osName,
      osVersion: parsedUA.osVersion,
      deviceModel: parsedUA.deviceModel,
      
      // Timestamps
      tsClient: query.ts_client ? Number(query.ts_client) : Date.now(),
    };
    
    // Store click in database (mock for now)
    console.log('Click stored:', clickData);
    
    // Build redirect URL with tracking parameters
    const redirectUrl = new URL(landingUrl);
    redirectUrl.searchParams.set('clickid', clickid);
    redirectUrl.searchParams.set('visitor_code', visitorCode);
    
    // Pass through subs
    for (let i = 1; i <= 10; i++) {
      const subValue = query[`sub${i}`] as string;
      if (subValue) {
        redirectUrl.searchParams.set(`sub${i}`, subValue);
      }
    }
    
    // Log click event
    console.log(`Click tracked: ${clickid} -> ${offerId} (${geoData.country})`);
    
    // Redirect to landing page
    res.redirect(302, redirectUrl.toString());
    
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /event - Conversion event tracking
router.post('/event', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const eventData = conversionEventSchema.parse(req.body);
    
    // Check if click exists (mock for now)
    console.log('Checking click:', eventData.clickid);
    
    // Get client IP for enrichment
    const ip = req.headers['x-forwarded-for'] as string || 
               req.headers['x-real-ip'] as string || 
               req.connection.remoteAddress || 
               req.ip || 
               '127.0.0.1';
    
    // Parse user agent
    const parsedUA = parseUserAgent(eventData.user_agent);
    
    // Get geo data
    const geoData = getGeoData(ip);
    
    // Store conversion event
    const newEvent: NewEvent = {
      clickid: eventData.clickid,
      type: eventData.type,
      revenue: eventData.revenue?.toString(),
      revenueDeposit: eventData.revenue_deposit?.toString(),
      revenueReg: eventData.revenue_reg?.toString(),
      currency: eventData.currency,
      txid: eventData.txid,
      timeOnPageMs: eventData.time_on_page_ms,
      tsClient: eventData.ts_client,
      raw: req.body // Store raw data for audit
    };
    
    const insertedEvent = { id: 'mock-event-id', ...newEvent };
    
    // Update click with additional data if provided
    if (eventData.campaign_id || eventData.offer_id || eventData.sub2) {
      const updateData: Partial<NewClick> = {};
      
      if (eventData.campaign_id) updateData.campaignId = eventData.campaign_id;
      if (eventData.offer_id) updateData.offerId = eventData.offer_id;
      if (eventData.sub2) {
        updateData.sub2Raw = eventData.sub2;
        updateData.sub2Map = parseSub2(eventData.sub2);
      }
      
      // Update browser/device info if more detailed
      updateData.browserName = parsedUA.browserName;
      updateData.browserVersion = parsedUA.browserVersion;
      updateData.osName = parsedUA.osName;
      updateData.osVersion = parsedUA.osVersion;
      updateData.deviceModel = parsedUA.deviceModel;
      updateData.deviceType = eventData.device_type;
      updateData.lang = eventData.lang;
      updateData.tz = eventData.tz;
      updateData.screen = eventData.screen;
      updateData.connection = eventData.connection;
      
      if (Object.keys(updateData).length > 0) {
        console.log('Click update:', updateData);
      }
    }
    
    // TODO: Send postback to external tracker (Keitaro)
    // await sendPostback(eventData, insertedEvent);
    
    console.log(`Event tracked: ${eventData.type} for ${eventData.clickid} (Revenue: ${eventData.revenue || 0})`);
    
    res.json({ 
      success: true, 
      event_id: insertedEvent.id,
      clickid: eventData.clickid 
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    console.error('Event tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /pixel - Pixel tracking for lp_leave events
router.get('/pixel', async (req: Request, res: Response) => {
  try {
    const { clickid, time_on_page } = req.query;
    
    if (clickid && time_on_page) {
      // Create lp_leave event
      const eventData: NewEvent = {
        clickid: clickid as string,
        type: 'lp_leave',
        timeOnPageMs: Number(time_on_page),
        tsClient: Date.now(),
        raw: req.query
      };
      
      console.log('Pixel event:', eventData);
    }
    
    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    res.set('Content-Type', 'image/png');
    res.set('Content-Length', pixel.length.toString());
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pixel);
    
  } catch (error) {
    console.error('Pixel tracking error:', error);
    res.status(500).send('Error');
  }
});

export default router;