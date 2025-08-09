import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { postbackProfiles, postbackDeliveries } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Postback profile schema
const postbackProfileSchema = z.object({
  name: z.string().min(1),
  tracker_type: z.enum(['keitaro', 'custom']),
  scope_type: z.enum(['global', 'campaign', 'offer', 'flow']),
  scope_id: z.string().optional(),
  priority: z.number().default(100),
  enabled: z.boolean().default(true),
  endpoint_url: z.string().url(),
  method: z.enum(['GET', 'POST']),
  id_param: z.enum(['subid', 'clickid']).default('clickid'),
  auth_query_key: z.string().optional(),
  auth_query_val: z.string().optional(),
  auth_header_name: z.string().optional(),
  auth_header_val: z.string().optional(),
  status_map: z.record(z.string()).default({
    open: 'open',
    reg: 'lead',
    deposit: 'sale',
    lp_click: 'click'
  }),
  params_template: z.record(z.string()).default({
    clickid: '{{clickid}}',
    status: '{{status}}',
    revenue: '{{revenue}}',
    currency: '{{currency}}',
    country: '{{country_iso}}'
  }),
  url_encode: z.boolean().default(true),
  hmac_enabled: z.boolean().default(false),
  hmac_secret: z.string().optional(),
  hmac_payload_tpl: z.string().optional(),
  hmac_param_name: z.string().optional(),
  retries: z.number().default(5),
  timeout_ms: z.number().default(4000),
  backoff_base_sec: z.number().default(2),
  filter_revenue_gt0: z.boolean().default(false),
  filter_country_whitelist: z.array(z.string()).default([]),
  filter_country_blacklist: z.array(z.string()).default([]),
  filter_exclude_bots: z.boolean().default(true)
});

// GET /api/postback/profiles - Get postback profiles for advertiser
router.get('/profiles', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profiles = await db.select()
      .from(postbackProfiles)
      .where(eq(postbackProfiles.owner_id, BigInt(userId)))
      .orderBy(postbackProfiles.priority);

    res.json(profiles.map(profile => ({
      ...profile,
      id: profile.id.toString(),
      owner_id: profile.owner_id.toString(),
      scope_id: profile.scope_id?.toString()
    })));
    
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/postback/profiles - Create postback profile
router.post('/profiles', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = postbackProfileSchema.parse(req.body);
    
    const result = await db.insert(postbackProfiles).values({
      owner_id: BigInt(userId),
      name: data.name,
      tracker_type: data.tracker_type,
      scope_type: data.scope_type,
      scope_id: data.scope_id ? BigInt(data.scope_id) : null,
      priority: data.priority,
      enabled: data.enabled,
      endpoint_url: data.endpoint_url,
      method: data.method,
      id_param: data.id_param,
      auth_query_key: data.auth_query_key,
      auth_query_val: data.auth_query_val,
      auth_header_name: data.auth_header_name,
      auth_header_val: data.auth_header_val,
      status_map: data.status_map,
      params_template: data.params_template,
      url_encode: data.url_encode,
      hmac_enabled: data.hmac_enabled,
      hmac_secret: data.hmac_secret,
      hmac_payload_tpl: data.hmac_payload_tpl,
      hmac_param_name: data.hmac_param_name,
      retries: data.retries,
      timeout_ms: data.timeout_ms,
      backoff_base_sec: data.backoff_base_sec,
      filter_revenue_gt0: data.filter_revenue_gt0,
      filter_country_whitelist: data.filter_country_whitelist,
      filter_country_blacklist: data.filter_country_blacklist,
      filter_exclude_bots: data.filter_exclude_bots
    }).returning();

    res.json({
      ...result[0],
      id: result[0].id.toString(),
      owner_id: result[0].owner_id.toString(),
      scope_id: result[0].scope_id?.toString()
    });
    
  } catch (error) {
    console.error('Create profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/postback/profiles/:id - Update postback profile
router.put('/profiles/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = postbackProfileSchema.parse(req.body);
    
    const result = await db.update(postbackProfiles)
      .set({
        name: data.name,
        tracker_type: data.tracker_type,
        scope_type: data.scope_type,
        scope_id: data.scope_id ? BigInt(data.scope_id) : null,
        priority: data.priority,
        enabled: data.enabled,
        endpoint_url: data.endpoint_url,
        method: data.method,
        id_param: data.id_param,
        auth_query_key: data.auth_query_key,
        auth_query_val: data.auth_query_val,
        auth_header_name: data.auth_header_name,
        auth_header_val: data.auth_header_val,
        status_map: data.status_map,
        params_template: data.params_template,
        url_encode: data.url_encode,
        hmac_enabled: data.hmac_enabled,
        hmac_secret: data.hmac_secret,
        hmac_payload_tpl: data.hmac_payload_tpl,
        hmac_param_name: data.hmac_param_name,
        retries: data.retries,
        timeout_ms: data.timeout_ms,
        backoff_base_sec: data.backoff_base_sec,
        filter_revenue_gt0: data.filter_revenue_gt0,
        filter_country_whitelist: data.filter_country_whitelist,
        filter_country_blacklist: data.filter_country_blacklist,
        filter_exclude_bots: data.filter_exclude_bots,
        updated_at: new Date()
      })
      .where(
        and(
          eq(postbackProfiles.id, BigInt(profileId)),
          eq(postbackProfiles.owner_id, BigInt(userId))
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      ...result[0],
      id: result[0].id.toString(),
      owner_id: result[0].owner_id.toString(),
      scope_id: result[0].scope_id?.toString()
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/postback/profiles/:id - Delete postback profile
router.delete('/profiles/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await db.delete(postbackProfiles)
      .where(
        and(
          eq(postbackProfiles.id, BigInt(profileId)),
          eq(postbackProfiles.owner_id, BigInt(userId))
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ success: true });
    
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/postback/profiles/:id/test - Test postback profile
router.post('/profiles/:id/test', async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const testData = z.object({
      clickid: z.string(),
      type: z.string(),
      revenue: z.string().optional(),
      currency: z.string().optional()
    }).parse(req.body);

    // Get profile
    const profile = await db.select()
      .from(postbackProfiles)
      .where(
        and(
          eq(postbackProfiles.id, BigInt(profileId)),
          eq(postbackProfiles.owner_id, BigInt(userId))
        )
      )
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prof = profile[0];
    
    // Build test parameters
    const mappedStatus = prof.status_map[testData.type as keyof typeof prof.status_map] || testData.type;
    const params: Record<string, string> = {};
    
    for (const [key, template] of Object.entries(prof.params_template as Record<string, string>)) {
      params[key] = template
        .replace(/\{\{clickid\}\}/g, testData.clickid)
        .replace(/\{\{status\}\}/g, mappedStatus)
        .replace(/\{\{revenue\}\}/g, testData.revenue || '0')
        .replace(/\{\{currency\}\}/g, testData.currency || 'USD')
        .replace(/\{\{country_iso\}\}/g, 'US');
    }

    // Build test URL/body
    let testUrl = prof.endpoint_url;
    let testBody = '';
    
    if (prof.method === 'GET') {
      const url = new URL(prof.endpoint_url);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, prof.url_encode ? encodeURIComponent(value) : value);
      }
      testUrl = url.toString();
    } else {
      testBody = JSON.stringify(params);
    }

    // Simulate request (don't actually send in test mode)
    const testResult = {
      method: prof.method,
      url: testUrl,
      body: testBody || null,
      headers: {
        'User-Agent': 'AffiliateTracker/1.0 (Test)',
        ...(prof.method === 'POST' && { 'Content-Type': 'application/json' }),
        ...(prof.auth_header_name && prof.auth_header_val && {
          [prof.auth_header_name]: prof.auth_header_val
        })
      },
      params,
      status: 'test_mode',
      note: 'This is a test request - not actually sent'
    };

    res.json(testResult);
    
  } catch (error) {
    console.error('Test profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/postback/deliveries - Get delivery logs
router.get('/deliveries', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const deliveries = await db.select({
      id: postbackDeliveries.id,
      profile_id: postbackDeliveries.profile_id,
      profile_name: postbackProfiles.name,
      event_id: postbackDeliveries.event_id,
      clickid: postbackDeliveries.clickid,
      attempt: postbackDeliveries.attempt,
      max_attempts: postbackDeliveries.max_attempts,
      request_method: postbackDeliveries.request_method,
      request_url: postbackDeliveries.request_url,
      request_body: postbackDeliveries.request_body,
      response_code: postbackDeliveries.response_code,
      response_body: postbackDeliveries.response_body,
      error: postbackDeliveries.error,
      duration_ms: postbackDeliveries.duration_ms,
      created_at: postbackDeliveries.created_at
    })
    .from(postbackDeliveries)
    .innerJoin(postbackProfiles, eq(postbackDeliveries.profile_id, postbackProfiles.id))
    .where(eq(postbackProfiles.owner_id, BigInt(userId)))
    .orderBy(desc(postbackDeliveries.created_at))
    .limit(100);

    res.json(deliveries.map(delivery => ({
      ...delivery,
      id: delivery.id.toString(),
      profile_id: delivery.profile_id.toString(),
      event_id: delivery.event_id?.toString()
    })));
    
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes for affiliate users (limited scope)
router.get('/affiliate/profiles', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Affiliates can only create global and offer-level postbacks
    const profiles = await db.select()
      .from(postbackProfiles)
      .where(
        and(
          eq(postbackProfiles.owner_id, BigInt(userId)),
          eq(postbackProfiles.scope_type, 'global') // Only global for affiliates
        )
      )
      .orderBy(postbackProfiles.priority);

    res.json(profiles.map(profile => ({
      ...profile,
      id: profile.id.toString(),
      owner_id: profile.owner_id.toString(),
      scope_id: profile.scope_id?.toString()
    })));
    
  } catch (error) {
    console.error('Get affiliate profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/affiliate/profiles', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Restrict affiliate postbacks to global scope only
    const data = postbackProfileSchema
      .omit({ scope_type: true, scope_id: true })
      .parse(req.body);
    
    const result = await db.insert(postbackProfiles).values({
      owner_id: BigInt(userId),
      name: data.name,
      tracker_type: data.tracker_type,
      scope_type: 'global', // Force global for affiliates
      scope_id: null,
      priority: data.priority,
      enabled: data.enabled,
      endpoint_url: data.endpoint_url,
      method: data.method,
      id_param: data.id_param,
      auth_query_key: data.auth_query_key,
      auth_query_val: data.auth_query_val,
      auth_header_name: data.auth_header_name,
      auth_header_val: data.auth_header_val,
      status_map: data.status_map,
      params_template: data.params_template,
      url_encode: data.url_encode,
      hmac_enabled: data.hmac_enabled,
      hmac_secret: data.hmac_secret,
      hmac_payload_tpl: data.hmac_payload_tpl,
      hmac_param_name: data.hmac_param_name,
      retries: data.retries,
      timeout_ms: data.timeout_ms,
      backoff_base_sec: data.backoff_base_sec,
      filter_revenue_gt0: data.filter_revenue_gt0,
      filter_country_whitelist: data.filter_country_whitelist,
      filter_country_blacklist: data.filter_country_blacklist,
      filter_exclude_bots: data.filter_exclude_bots
    }).returning();

    res.json({
      ...result[0],
      id: result[0].id.toString(),
      owner_id: result[0].owner_id.toString(),
      scope_id: result[0].scope_id?.toString()
    });
    
  } catch (error) {
    console.error('Create affiliate profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/affiliate/deliveries', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const deliveries = await db.select({
      id: postbackDeliveries.id,
      profile_id: postbackDeliveries.profile_id,
      profile_name: postbackProfiles.name,
      event_id: postbackDeliveries.event_id,
      clickid: postbackDeliveries.clickid,
      attempt: postbackDeliveries.attempt,
      max_attempts: postbackDeliveries.max_attempts,
      request_method: postbackDeliveries.request_method,
      request_url: postbackDeliveries.request_url,
      response_code: postbackDeliveries.response_code,
      error: postbackDeliveries.error,
      duration_ms: postbackDeliveries.duration_ms,
      created_at: postbackDeliveries.created_at
    })
    .from(postbackDeliveries)
    .innerJoin(postbackProfiles, eq(postbackDeliveries.profile_id, postbackProfiles.id))
    .where(eq(postbackProfiles.owner_id, BigInt(userId)))
    .orderBy(desc(postbackDeliveries.created_at))
    .limit(50);

    res.json(deliveries.map(delivery => ({
      ...delivery,
      id: delivery.id.toString(),
      profile_id: delivery.profile_id.toString(),
      event_id: delivery.event_id?.toString()
    })));
    
  } catch (error) {
    console.error('Get affiliate deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;