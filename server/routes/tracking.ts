import { Router } from 'express';
import { storage } from '../storage';
import { nanoid } from 'nanoid';
import { insertClickSchema, insertEventSchema } from '@shared/schema';
import { z } from 'zod';
import { PostbackService, type PostbackEvent } from '../services/postback.js';

const router = Router();

// Middleware для логирования всех запросов
router.use((req, res, next) => {
  console.log(`🔗 TRACKING REQUEST: ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Click tracking endpoint - main entry point for partner traffic
router.get('/click', async (req, res) => {
  try {
    const {
      offer: offerId,
      partner: partnerId,
      subid,
      sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sub9, sub10,
      sub11, sub12, sub13, sub14, sub15, sub16,
      utm_source, utm_campaign, utm_medium, utm_content, utm_term,
      referrer
    } = req.query;

    // Validate required parameters
    if (!offerId || !partnerId) {
      return res.status(400).json({
        error: 'Missing required parameters: offer and partner'
      });
    }

    // Generate unique clickid (12 characters)
    const clickid = nanoid(12);

    // Get IP and User-Agent data
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
    const userAgent = req.headers['user-agent'] || '';

    // Parse sub2 for key-value pairs (key1-value1|key2-value2)
    let sub2Raw = null;
    let sub2Map = null;
    if (sub2) {
      sub2Raw = sub2 as string;
      try {
        const pairs = sub2Raw.split('|');
        const map: Record<string, string> = {};
        pairs.forEach(pair => {
          const [key, value] = pair.split('-', 2);
          if (key && value) {
            map[key] = value;
          }
        });
        sub2Map = map;
      } catch (e) {
        // If parsing fails, keep sub2Raw only
      }
    }

    // TODO: Implement GeoIP and User-Agent parsing
    // For now using basic placeholder data
    const clickData = {
      clickid,
      advertiserId: '534c1a63-0cfd-4d0f-a07e-465f379a7645', // Will be determined from offer
      partnerId: partnerId as string,
      offerId: offerId as string,
      site: req.get('host') || '',
      referrer: (referrer as string) || req.get('referer') || '',
      
      // Sub parameters
      sub1: sub1 as string,
      sub2Raw,
      sub2Map,
      sub3: sub3 as string,
      sub4: sub4 as string,
      sub5: sub5 as string,
      sub6: sub6 as string,
      sub7: sub7 as string,
      sub8: sub8 as string,
      sub9: sub9 as string,
      sub10: sub10 as string,
      sub11: sub11 as string,
      sub12: sub12 as string,
      sub13: sub13 as string,
      sub14: sub14 as string,
      sub15: sub15 as string,
      sub16: sub16 as string,

      // UTM parameters
      utmSource: utm_source as string,
      utmCampaign: utm_campaign as string,
      utmMedium: utm_medium as string,
      utmContent: utm_content as string,
      utmTerm: utm_term as string,

      // IP and geo data (placeholders)
      ip,
      countryIso: 'US', // TODO: GeoIP lookup
      region: '',
      city: '',
      isp: '',
      operator: '',
      isProxy: false,

      // User agent data (placeholders)
      userAgent,
      browserName: '', // TODO: User-Agent parsing
      browserVersion: '',
      osName: '',
      osVersion: '',
      deviceModel: '',
      deviceType: 'desktop', // TODO: Device detection
      connection: '',
      lang: req.get('accept-language')?.split(',')[0] || '',
    };

    // Record click in database
    const click = await storage.createTrackingClick(clickData);

    // Record 'open' event automatically  
    await storage.createEvent({
      clickid,
      advertiserId: clickData.advertiserId,
      partnerId: clickData.partnerId,
      type: 'open',
    });

    // Trigger postback for click event (lp_click)
    try {
      const postbackEvent: PostbackEvent = {
        type: 'lp_click',
        clickId: clickid,
        data: {
          clickid,
          partner_id: partnerId as string,
          offer_id: offerId as string,
          sub1: sub1 as string,
          sub2: sub2 as string,
          sub3: sub3 as string,
          sub4: sub4 as string,
          sub5: sub5 as string,
          sub6: sub6 as string,
          sub7: sub7 as string,
          sub8: sub8 as string,
          sub9: sub9 as string,
          sub10: sub10 as string,
          sub11: sub11 as string,
          sub12: sub12 as string,
          sub13: sub13 as string,
          sub14: sub14 as string,
          sub15: sub15 as string,
          sub16: sub16 as string,
          utm_source: utm_source as string,
          utm_campaign: utm_campaign as string,
          utm_medium: utm_medium as string,
          utm_content: utm_content as string,
          utm_term: utm_term as string,
        },
        partnerId: partnerId as string,
        offerId: offerId as string,
      };
      
      // Send postbacks to external trackers (non-blocking)
      PostbackService.triggerPostbacks(postbackEvent).catch(error => {
        console.error('Postback sending failed:', error);
      });
    } catch (error) {
      console.error('Postback trigger failed:', error);
    }

    // Get offer details for redirect
    const offer = await storage.getOffer(offerId as string);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Redirect to landing page
    res.redirect(302, offer.landingPageUrl || 'https://example.com');
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Event tracking endpoint for postbacks and conversions
router.post('/event', async (req, res) => {
  try {
    const eventData = insertEventSchema.parse(req.body);
    
    // Validate clickid exists
    const clicks = await storage.getTrackingClicks({ clickId: eventData.clickid });
    const click = clicks[0];
    if (!click) {
      return res.status(404).json({ error: 'Click not found' });
    }

    // Add advertiser and partner from click
    const event = await storage.createEvent({
      ...eventData,
      advertiserId: click.advertiserId,
      partnerId: click.partnerId,
    });

    // Trigger postback for conversion event
    try {
      const postbackEvent: PostbackEvent = {
        type: eventData.type as any,
        clickId: eventData.clickid,
        data: {
          clickid: eventData.clickid,
          status: eventData.type,
          partner_id: click.partnerId,
          offer_id: click.offerId,
          revenue: eventData.revenue?.toString() || '0.00',
          currency: eventData.currency || 'USD',
          txid: eventData.txid || '',
        },
        partnerId: click.partnerId,
        offerId: click.offerId,
        advertiserId: click.advertiserId,
      };
      
      // Send postbacks to external trackers (non-blocking)
      PostbackService.triggerPostbacks(postbackEvent).catch(error => {
        console.error('Event postback sending failed:', error);
      });
    } catch (error) {
      console.error('Event postback trigger failed:', error);
    }

    res.status(201).json(event);
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

// Get click details
router.get('/click/:clickid', async (req, res) => {
  try {
    const { clickid } = req.params;
    const clicks = await storage.getTrackingClicks({ clickId: clickid });
    const click = clicks[0];
    
    if (!click) {
      return res.status(404).json({ error: 'Click not found' });
    }

    const events = await storage.getEvents({ clickId: clickid });
    
    res.json({
      click,
      events
    });
  } catch (error) {
    console.error('Get click error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get events for a click
router.get('/events/:clickid', async (req, res) => {
  try {
    const { clickid } = req.params;
    const events = await storage.getEvents({ clickId: clickid });
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual postback trigger endpoint for testing/retrying
router.post('/postback/send', async (req, res) => {
  try {
    const {
      clickid,
      event_type,
      revenue,
      currency = 'USD',
      txid,
      force = false
    } = req.body;

    if (!clickid || !event_type) {
      return res.status(400).json({
        error: 'Missing required parameters: clickid and event_type'
      });
    }

    // Get click data
    const clicks = await storage.getTrackingClicks({ clickId: clickid });
    const click = clicks[0];
    if (!click) {
      return res.status(404).json({ error: 'Click not found' });
    }

    // Build postback event
    const postbackEvent: PostbackEvent = {
      type: event_type,
      clickId: clickid,
      data: {
        clickid,
        status: event_type,
        partner_id: click.partnerId,
        offer_id: click.offerId,
        revenue: revenue?.toString() || '0.00',
        currency,
        txid: txid || '',
      },
      partnerId: click.partnerId,
      offerId: click.offerId,
      advertiserId: click.advertiserId,
    };

    // Send postbacks
    const results = await PostbackService.triggerPostbacks(postbackEvent);
    
    res.json({
      success: true,
      message: 'Postbacks sent successfully',
      results: results.length,
      clickid,
      event_type
    });

  } catch (error) {
    console.error('Manual postback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test external tracker postback endpoint
router.post('/postback/test', async (req, res) => {
  try {
    const {
      tracker_url,
      method = 'GET',
      auth,
      hmac,
      timeout = 30,
      test_data = {}
    } = req.body;

    if (!tracker_url) {
      return res.status(400).json({
        error: 'Missing required parameter: tracker_url'
      });
    }

    // Create test event
    const testEvent: PostbackEvent = {
      type: 'lead',
      clickId: 'test_click_123',
      data: {
        clickid: 'test_click_123',
        status: 'lead',
        partner_id: 'test_partner',
        offer_id: 'test_offer',
        revenue: '25.00',
        currency: 'USD',
        country: 'US',
        device: 'desktop',
        ...test_data
      }
    };

    // Send test postback
    const result = await PostbackService.sendExternalTrackerPostback(
      tracker_url,
      testEvent,
      null, // no click data for test
      {
        method,
        auth,
        hmac,
        timeout
      }
    );

    res.json({
      success: result.success,
      test_url: tracker_url,
      response: result.response,
      error: result.error
    });

  } catch (error) {
    console.error('Test postback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Direct tracking link handler - redirects to offer landing page
router.get('/:trackingCode', async (req, res) => {
  try {
    const { trackingCode } = req.params;
    console.log(`🔥🔥🔥 TRACKING LINK HIT! Code: ${trackingCode} - URL: ${req.url}`);
    console.log(`🔍 Looking for tracking code: ${trackingCode}`);
    
    // Find tracking link
    const trackingLink = await storage.getTrackingLinkByCode(trackingCode);
    console.log(`📊 Found tracking link:`, trackingLink ? `ID: ${trackingLink.id}` : 'NOT FOUND');
    
    if (!trackingLink) {
      console.log(`❌ Tracking link not found for code: ${trackingCode}`);
      return res.status(404).send('Tracking link not found');
    }

    // Get offer details
    const offer = await storage.getOffer(trackingLink.offerId);
    if (!offer) {
      console.log(`❌ Offer not found for tracking link: ${trackingCode}`);
      return res.status(404).send('Offer not found');
    }

    // Generate unique clickId
    const clickId = nanoid(12);
    
    // Get IP and User Agent
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    
    // Create click record
    await storage.createTrackingClick({
      clickId,
      partnerId: trackingLink.partnerId,
      offerId: trackingLink.offerId,
      advertiserId: offer.advertiserId,
      ip,
      userAgent,
      referrer: req.get('referer') || '',
      subId1: trackingLink.subId1,
      subId2: trackingLink.subId2,
      subId3: trackingLink.subId3,
      subId4: trackingLink.subId4,
      subId5: trackingLink.subId5,
      country: 'Unknown',
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
      status: 'click',
      revenue: '0.00',
      createdAt: new Date()
    });

    // Update tracking link click count
    await storage.updateTrackingLinkStats(trackingCode, { clickCount: 1 });

    // Build landing URL with parameters
    let landingUrl = offer.landingPageUrl || 'https://example.com';
    
    // Replace macros in landing URL
    landingUrl = landingUrl
      .replace('{client_id}', clickId)
      .replace('{external_id}', clickId)
      .replace('{clickid}', clickId)
      .replace('{sub1}', trackingLink.subId1 || '')
      .replace('{sub2}', trackingLink.subId2 || '')
      .replace('{sub3}', trackingLink.subId3 || '')
      .replace('{sub4}', trackingLink.subId4 || '')
      .replace('{sub5}', trackingLink.subId5 || '');

    console.log(`🔗 Tracking link ${trackingCode} clicked. Redirecting to: ${landingUrl}`);

    // Redirect to landing page
    res.redirect(302, landingUrl);
  } catch (error) {
    console.error('Tracking link error:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;