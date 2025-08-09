import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { db } from '../db.js';
import { clicks, events, postbackProfiles, postbackDeliveries } from '../../shared/schema.js';
import { eq, and, or, sql } from 'drizzle-orm';

const router = Router();

// Click tracking schema
const clickSchema = z.object({
  campaign_id: z.string().optional(),
  source_id: z.string().optional(),
  flow_id: z.string().optional(),
  offer_id: z.string().optional(),
  landing_id: z.string().optional(),
  ad_campaign_id: z.string().optional(),
  external_id: z.string().optional(),
  creative_id: z.string().optional(),
  sub1: z.string().optional(),
  sub2: z.string().optional(),
  sub3: z.string().optional(),
  sub4: z.string().optional(),
  sub5: z.string().optional(),
  sub6: z.string().optional(),
  sub7: z.string().optional(),
  sub8: z.string().optional(),
  sub9: z.string().optional(),
  sub10: z.string().optional(),
  clickid: z.string().optional(),
  visitor_code: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional()
});

// Event tracking schema
const eventSchema = z.object({
  type: z.enum(['open', 'lp_click', 'reg', 'deposit', 'sale', 'lead', 'lp_leave']),
  clickid: z.string().min(1, 'ClickID is required'),
  visitor_code: z.string().optional(),
  campaign_id: z.string().optional(),
  source_id: z.string().optional(),
  flow_id: z.string().optional(),
  offer_id: z.string().optional(),
  landing_id: z.string().optional(),
  ad_campaign_id: z.string().optional(),
  external_id: z.string().optional(),
  creative_id: z.string().optional(),
  sub1: z.string().optional(),
  sub2: z.string().optional(),
  sub3: z.string().optional(),
  sub4: z.string().optional(),
  sub5: z.string().optional(),
  sub6: z.string().optional(),
  sub7: z.string().optional(),
  sub8: z.string().optional(),
  sub9: z.string().optional(),
  sub10: z.string().optional(),
  site: z.string().optional(),
  referrer: z.string().optional(),
  user_agent: z.string().optional(),
  lang: z.string().optional(),
  tz: z.string().optional(),
  screen: z.string().optional(),
  connection: z.string().optional(),
  device_type: z.string().optional(),
  ts_client: z.number().optional(),
  revenue: z.number().optional(),
  revenue_deposit: z.number().optional(),
  currency: z.string().optional(),
  txid: z.string().optional(),
  time_on_page_ms: z.number().optional()
});

// Parse sub2 format: key-value|key2-value2
function parseSub2(sub2Raw?: string): Record<string, string> {
  if (!sub2Raw || sub2Raw.length > 200) return {};
  
  try {
    const decoded = decodeURIComponent(sub2Raw);
    const pairs = decoded.split('|').slice(0, 8); // Max 8 pairs
    const result: Record<string, string> = {};
    
    const allowedKeys = (process.env.SUB2_ALLOWED_KEYS || 'geo,dev,src,adset,lang,tier,abtest,cohort,pp,fpr,seg').split(',');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('-', 2);
      if (key && value && allowedKeys.includes(key)) {
        result[key] = value;
      }
    }
    
    return result;
  } catch (error) {
    return {};
  }
}

// Get GeoIP data (mock implementation)
function getGeoData(ip: string) {
  // In production, use real GeoIP service like MaxMind
  return {
    country_iso: 'US',
    region: 'California',
    city: 'San Francisco',
    isp: 'Example ISP',
    operator: 'Example Operator',
    is_proxy: false
  };
}

// Parse User Agent (mock implementation)
function parseUserAgent(userAgent?: string) {
  if (!userAgent) return {};
  
  // In production, use a real UA parser library
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(userAgent);
  
  return {
    browser_name: 'Chrome',
    browser_version: '120.0',
    os_name: isMobile ? 'iOS' : 'Windows',
    os_version: isMobile ? '17.0' : '11',
    device_model: isMobile ? 'iPhone' : null,
    device_type: isMobile ? 'mobile' : 'desktop'
  };
}

// GET /click - Handle click tracking and redirect
router.get('/click', async (req, res) => {
  try {
    const params = clickSchema.parse(req.query);
    const clickid = params.clickid || nanoid();
    const ip = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Get enrichment data
    const geoData = getGeoData(ip);
    const uaData = parseUserAgent(userAgent);
    const sub2Map = parseSub2(params.sub2);
    
    // Store click
    await db.insert(clicks).values({
      clickid,
      visitor_code: params.visitor_code,
      campaign_id: params.campaign_id ? BigInt(params.campaign_id) : null,
      source_id: params.source_id ? BigInt(params.source_id) : null,
      flow_id: params.flow_id ? BigInt(params.flow_id) : null,
      offer_id: params.offer_id ? BigInt(params.offer_id) : null,
      landing_id: params.landing_id ? BigInt(params.landing_id) : null,
      ad_campaign_id: params.ad_campaign_id,
      external_id: params.external_id,
      creative_id: params.creative_id,
      site: req.hostname,
      referrer: req.headers.referer || null,
      sub1: params.sub1,
      sub2_raw: params.sub2,
      sub2_map: sub2Map,
      sub3: params.sub3,
      sub4: params.sub4,
      sub5: params.sub5,
      sub6: params.sub6,
      sub7: params.sub7,
      sub8: params.sub8,
      sub9: params.sub9,
      sub10: params.sub10,
      ip: ip as any,
      country_iso: geoData.country_iso,
      region: geoData.region,
      city: geoData.city,
      isp: geoData.isp,
      operator: geoData.operator,
      is_proxy: geoData.is_proxy,
      user_agent: userAgent,
      browser_name: uaData.browser_name,
      browser_version: uaData.browser_version,
      os_name: uaData.os_name,
      os_version: uaData.os_version,
      device_model: uaData.device_model,
      device_type: uaData.device_type,
      connection: null,
      lang: null
    });

    // Build redirect URL (should point to the actual landing page)
    const redirectUrl = new URL(params.landing_id ? `https://landing-${params.landing_id}.com` : 'https://example-landing.com');
    
    // Add tracking parameters to redirect
    redirectUrl.searchParams.set('clickid', clickid);
    if (params.sub1) redirectUrl.searchParams.set('sub1', params.sub1);
    if (params.sub2) redirectUrl.searchParams.set('sub2', params.sub2);
    if (params.sub3) redirectUrl.searchParams.set('sub3', params.sub3);
    if (params.sub4) redirectUrl.searchParams.set('sub4', params.sub4);
    if (params.sub5) redirectUrl.searchParams.set('sub5', params.sub5);
    if (params.utm_source) redirectUrl.searchParams.set('utm_source', params.utm_source);
    if (params.utm_medium) redirectUrl.searchParams.set('utm_medium', params.utm_medium);
    if (params.utm_campaign) redirectUrl.searchParams.set('utm_campaign', params.utm_campaign);

    console.log(`CLICK TRACKED: ${clickid} -> ${redirectUrl.toString()}`);
    
    // 302 redirect to landing page
    res.redirect(302, redirectUrl.toString());
    
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(400).json({ error: 'Invalid click parameters' });
  }
});

// POST /event - Handle event tracking
router.post('/event', async (req, res) => {
  try {
    const data = eventSchema.parse(req.body);
    const ip = req.ip || req.connection.remoteAddress || '';
    
    // Check idempotency key
    const idempotencyKey = `${data.clickid}-${data.type}-${data.txid || '-'}`;
    
    const existingEvent = await db.select()
      .from(events)
      .where(
        and(
          eq(events.clickid, data.clickid),
          eq(events.type, data.type),
          data.txid ? eq(events.txid, data.txid) : sql`txid IS NULL`
        )
      )
      .limit(1);
    
    if (existingEvent.length > 0) {
      console.log(`DUPLICATE EVENT: ${idempotencyKey}`);
      return res.json({ status: 'duplicate', event_id: existingEvent[0].id });
    }

    // Get enrichment data
    const geoData = getGeoData(ip);
    const uaData = parseUserAgent(data.user_agent);
    
    // Store event
    const eventResult = await db.insert(events).values({
      clickid: data.clickid,
      type: data.type,
      revenue: data.revenue || data.revenue_deposit || null,
      currency: data.currency || 'USD',
      txid: data.txid,
      time_on_page_ms: data.time_on_page_ms
    }).returning();

    const eventId = eventResult[0].id;
    
    console.log(`EVENT TRACKED: ${data.type} for ${data.clickid} (${eventId})`);

    // Find and trigger postback profiles
    await triggerPostbacks(data, eventId);
    
    res.json({ 
      status: 'success', 
      event_id: eventId,
      clickid: data.clickid,
      type: data.type
    });
    
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(400).json({ error: 'Invalid event data' });
  }
});

// Function to trigger postbacks
async function triggerPostbacks(eventData: any, eventId: bigint) {
  try {
    // Find applicable postback profiles
    // Priority: flow -> offer -> campaign -> global
    const profiles = await db.select()
      .from(postbackProfiles)
      .where(
        and(
          eq(postbackProfiles.enabled, true),
          or(
            eq(postbackProfiles.scope_type, 'global'),
            and(
              eq(postbackProfiles.scope_type, 'campaign'),
              eq(postbackProfiles.scope_id, BigInt(eventData.campaign_id || 0))
            ),
            and(
              eq(postbackProfiles.scope_type, 'offer'),
              eq(postbackProfiles.scope_id, BigInt(eventData.offer_id || 0))
            ),
            and(
              eq(postbackProfiles.scope_type, 'flow'),
              eq(postbackProfiles.scope_id, BigInt(eventData.flow_id || 0))
            )
          )
        )
      )
      .orderBy(postbackProfiles.priority);

    for (const profile of profiles) {
      // Apply filters
      if (profile.filter_revenue_gt0 && (!eventData.revenue || eventData.revenue <= 0)) {
        continue;
      }

      // Queue postback delivery (in production, use a proper queue system)
      await queuePostbackDelivery(profile, eventData, eventId);
    }
    
  } catch (error) {
    console.error('Postback trigger error:', error);
  }
}

// Function to queue and execute postback delivery
async function queuePostbackDelivery(profile: any, eventData: any, eventId: bigint) {
  try {
    // Map event type to profile status
    const mappedStatus = profile.status_map[eventData.type] || eventData.type;
    
    // Build parameters using template
    const params: Record<string, string> = {};
    for (const [key, template] of Object.entries(profile.params_template as Record<string, string>)) {
      params[key] = replaceTemplate(template, {
        ...eventData,
        status: mappedStatus,
        country_iso: 'US', // From geo enrichment
        event_id: eventId.toString()
      });
    }

    // Add authentication
    if (profile.auth_query_key && profile.auth_query_val) {
      params[profile.auth_query_key] = profile.auth_query_val;
    }

    // HMAC signature
    if (profile.hmac_enabled && profile.hmac_secret && profile.hmac_payload_tpl) {
      const payload = replaceTemplate(profile.hmac_payload_tpl, {
        ...eventData,
        status: mappedStatus
      });
      const signature = crypto.createHmac('sha256', profile.hmac_secret).update(payload).digest('hex');
      params[profile.hmac_param_name || 'signature'] = signature;
    }

    // Execute delivery with retries
    await executePostbackDelivery(profile, params, eventData.clickid, eventId, 1);
    
  } catch (error) {
    console.error('Postback delivery error:', error);
  }
}

// Execute postback delivery with retry logic
async function executePostbackDelivery(
  profile: any, 
  params: Record<string, string>, 
  clickid: string, 
  eventId: bigint, 
  attempt: number
) {
  const startTime = Date.now();
  let requestUrl = '';
  let requestBody = '';
  
  try {
    if (profile.method === 'GET') {
      const url = new URL(profile.endpoint_url);
      for (const [key, value] of Object.entries(params)) {
        if (profile.url_encode) {
          url.searchParams.set(key, encodeURIComponent(value));
        } else {
          url.searchParams.set(key, value);
        }
      }
      requestUrl = url.toString();
    } else {
      requestUrl = profile.endpoint_url;
      requestBody = JSON.stringify(params);
    }

    const headers: Record<string, string> = {
      'User-Agent': 'AffiliateTracker/1.0'
    };

    if (profile.method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    if (profile.auth_header_name && profile.auth_header_val) {
      headers[profile.auth_header_name] = profile.auth_header_val;
    }

    // Make HTTP request
    const response = await fetch(requestUrl, {
      method: profile.method,
      headers,
      body: profile.method === 'POST' ? requestBody : undefined,
      signal: AbortSignal.timeout(profile.timeout_ms || 4000)
    });

    const responseBody = await response.text();
    const duration = Date.now() - startTime;

    // Log delivery
    await db.insert(postbackDeliveries).values({
      profile_id: BigInt(profile.id),
      event_id: eventId,
      clickid,
      attempt,
      max_attempts: profile.retries || 5,
      request_method: profile.method,
      request_url: requestUrl,
      request_body: requestBody || null,
      request_headers: headers,
      response_code: response.status,
      response_body: responseBody.slice(0, 2048), // First 2KB
      error: null,
      duration_ms: duration
    });

    console.log(`POSTBACK SUCCESS: ${profile.name} -> ${response.status} (${duration}ms)`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log failed delivery
    await db.insert(postbackDeliveries).values({
      profile_id: BigInt(profile.id),
      event_id: eventId,
      clickid,
      attempt,
      max_attempts: profile.retries || 5,
      request_method: profile.method,
      request_url: requestUrl,
      request_body: requestBody || null,
      request_headers: {},
      response_code: null,
      response_body: null,
      error: errorMessage,
      duration_ms: duration
    });

    console.log(`POSTBACK FAILED: ${profile.name} -> ${errorMessage} (${duration}ms)`);

    // Retry logic
    if (attempt < (profile.retries || 5)) {
      const delay = (profile.backoff_base_sec || 2) * Math.pow(2, attempt - 1) * 1000;
      const jitter = delay * 0.2 * Math.random();
      
      setTimeout(() => {
        executePostbackDelivery(profile, params, clickid, eventId, attempt + 1);
      }, delay + jitter);
    }
  }
}

// Template replacement function
function replaceTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key]?.toString() || '';
  });
}

export default router;