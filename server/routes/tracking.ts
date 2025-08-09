import { Router } from 'express';
import { storage } from '../storage';
import { nanoid } from 'nanoid';
import { insertClickSchema, insertEventSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

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
    const click = await storage.recordClick(clickData);

    // Record 'open' event automatically
    await storage.recordEvent({
      clickid,
      advertiserId: clickData.advertiserId,
      partnerId: clickData.partnerId,
      type: 'open',
    });

    // Get offer details for redirect
    const offer = await storage.getOffer(offerId as string);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Redirect to landing page
    res.redirect(302, offer.landingUrl || offer.targetUrl || 'https://example.com');
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
    const click = await storage.getClick(eventData.clickid);
    if (!click) {
      return res.status(404).json({ error: 'Click not found' });
    }

    // Add advertiser and partner from click
    const event = await storage.recordEvent({
      ...eventData,
      advertiserId: click.advertiserId,
      partnerId: click.partnerId,
    });

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
    const click = await storage.getClick(clickid);
    
    if (!click) {
      return res.status(404).json({ error: 'Click not found' });
    }

    const events = await storage.getEvents(clickid);
    
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
    const events = await storage.getEvents(clickid);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;