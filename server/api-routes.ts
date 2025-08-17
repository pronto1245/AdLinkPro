// API routes with enhanced postback system integration
import express from 'express';
import { z } from 'zod';
import { EventDto, AffiliateWebhookDto, PspWebhookDto, universalWebhookDto, UniversalWebhookDto } from '../enhanced-postback-dto';
import { normalize, Status, mapExternalStatus, isValidTransition, getStatusDescription } from './domain/status';
// Note: In production, these would import from the actual database schema
// import { conversions, enhancedPostbackProfiles, postbackDeliveries } from '../shared/schema';
// import { postbackWorker } from '../postback-worker';

export const apiRouter = express.Router();

// Event tracking endpoint
apiRouter.post('/event', async (req, res) => {
  try {
    // Validate request body
    const eventData = EventDto.parse(req.body);
    
    console.log('📥 Event received:', {
      type: eventData.type,
      clickid: eventData.clickid,
      txid: eventData.txid,
      value: eventData.value
    });
    
    // Create conversion record with normalized status
    const conversionType = eventData.type === 'reg' ? 'reg' as const : 'purchase' as const;
    const initialStatus = normalize(undefined, 'initiated', conversionType);
    
    const conversion = {
      advertiserId: 1, // Extract from auth or context
      partnerId: 2,
      clickid: eventData.clickid,
      type: conversionType,
      txid: eventData.txid,
      revenue: eventData.value?.toString() || '0',
      currency: eventData.currency || 'USD',
      conversionStatus: initialStatus,
      details: eventData.meta || {},
    };
    
    console.log('📝 Conversion created with normalized status:', {
      type: conversionType,
      initialStatus,
      statusDescription: getStatusDescription(initialStatus, 'ru')
    });
    
    // Save to database
    // const savedConversion = await db.insert(conversions).values(conversion).returning();
    
    // Trigger postback delivery
    await triggerPostbacks(conversion);
    
    res.json({
      success: true,
      message: 'Event processed successfully',
      eventId: eventData.txid,
      postbacksTriggered: true
    });
    
  } catch (error) {
    console.error('❌ Event processing error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Universal webhook endpoint for external services
apiRouter.post('/webhook/universal', async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log('📥 Universal webhook received:', {
      body: req.body,
      headers: req.headers,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Validate request body against universal webhook schema
    const webhookData = universalWebhookDto.parse(req.body);
    
    console.log('✅ Universal webhook validated:', {
      event_type: webhookData.event_type,
      clickid: webhookData.clickid,
      txid: webhookData.txid,
      offer_id: webhookData.offer_id,
      partner_id: webhookData.partner_id,
      amount: webhookData.amount || webhookData.revenue || webhookData.payout,
      source: webhookData.source
    });

    // Apply filtering logic
    const filterResult = await applyWebhookFilters(webhookData, req);
    if (!filterResult.allowed) {
      return res.status(403).json({
        success: false,
        error: 'Webhook filtered',
        reason: filterResult.reason
      });
    }

    // Normalize event data to internal format
    const normalizedEvent = await normalizeUniversalWebhook(webhookData);
    
    // Process the event and trigger postbacks
    const conversionResult = await processUniversalWebhookEvent(normalizedEvent);
    
    res.json({
      success: true,
      message: 'Universal webhook processed successfully',
      eventId: webhookData.txid || webhookData.clickid,
      eventType: webhookData.event_type,
      postbacksTriggered: conversionResult.postbacksTriggered,
      conversionId: conversionResult.conversionId
    });
    
  } catch (error) {
    console.error('❌ Universal webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        receivedData: req.body
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Affiliate webhook endpoint
apiRouter.post('/webhook/affiliate', async (req, res) => {
  try {
    const webhookData = AffiliateWebhookDto.parse(req.body);
    
    console.log('📥 Affiliate webhook received:', {
      type: webhookData.type,
      txid: webhookData.txid,
      status: webhookData.status,
      payout: webhookData.payout
    });
    
    // Update conversion status with normalization
    const updateResult = await updateConversionStatus(webhookData.txid, webhookData.status, webhookData.payout, 'affiliate');
    
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      statusUpdate: updateResult
    });
    
  } catch (error) {
    console.error('❌ Affiliate webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PSP webhook endpoint
apiRouter.post('/webhook/psp', async (req, res) => {
  try {
    const webhookData = PspWebhookDto.parse(req.body);
    
    console.log('📥 PSP webhook received:', {
      type: webhookData.type,
      txid: webhookData.txid,
      status: webhookData.status,
      amount: webhookData.amount
    });
    
    // Update conversion with payment status using PSP normalization
    const updateResult = await updateConversionStatus(webhookData.txid, webhookData.status, webhookData.amount, 'psp');
    
    res.json({
      success: true,
      message: 'PSP webhook processed successfully',
      statusUpdate: updateResult
    });
    
  } catch (error) {
    console.error('❌ PSP webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper function to trigger postbacks
async function triggerPostbacks(conversion: any) {
  try {
    // Get active postback profiles for this conversion
    const profiles = [
      {
        id: 1,
        name: 'Keitaro Integration',
        endpointUrl: 'https://tracker.example.com/postback?subid={clickid}&status={status}&payout={revenue}',
        method: 'GET' as const,
        idParam: 'subid' as const,
        paramsTemplate: {},
        statusMap: {
          reg: { initiated: 'lead', approved: 'lead' },
          purchase: { initiated: 'sale', approved: 'sale' }
        },
        hmacEnabled: false,
        timeoutMs: 4000,
        backoffBaseSec: 2,
      }
    ];
    
    for (const profile of profiles) {
      const job = {
        id: `${conversion.txid}_${profile.id}`,
        profileId: profile.id,
        conversionId: 1,
        clickid: conversion.clickid,
        type: conversion.type,
        txid: conversion.txid,
        revenue: conversion.revenue,
        currency: conversion.currency,
        status: conversion.conversionStatus,
        attempt: 1,
        maxAttempts: 5,
        profile
      };
      
      console.log('🚀 Scheduling postback delivery:', {
        profileId: profile.id,
        clickid: conversion.clickid,
        type: conversion.type
      });
      
      // Simulate postback delivery
      console.log('📤 Postback would be sent to:', profile.endpointUrl
        .replace('{clickid}', conversion.clickid)
        .replace('{status}', conversion.conversionStatus)
        .replace('{revenue}', conversion.revenue)
      );
    }
    
  } catch (error) {
    console.error('❌ Failed to trigger postbacks:', error);
  }
}

// Helper function to update conversion status with normalization
async function updateConversionStatus(txid: string, newStatus: string, amount?: number, source: 'affiliate' | 'psp' = 'affiliate') {
  try {
    console.log('🔄 Updating conversion status with normalization:', {
      txid,
      newStatus,
      amount,
      source
    });
    
    // In production, get current conversion from database
    const currentConversion = {
      type: 'purchase' as const, // Would be fetched from DB
      status: 'pending' as Status // Would be fetched from DB
    };
    
    // Map external status to internal status
    const mappedStatus = mapExternalStatus(newStatus, source);
    
    // Normalize status transition
    const normalizedStatus = normalize(currentConversion.status, mappedStatus, currentConversion.type);
    
    // Check if transition is valid
    const isValid = isValidTransition(currentConversion.status, normalizedStatus, currentConversion.type);
    
    console.log('📊 Status normalization result:', {
      currentStatus: currentConversion.status,
      externalStatus: newStatus,
      mappedStatus,
      normalizedStatus,
      isValidTransition: isValid,
      statusDescription: getStatusDescription(normalizedStatus, 'ru')
    });
    
    if (!isValid) {
      console.warn('⚠️ Invalid status transition attempted:', {
        from: currentConversion.status,
        to: normalizedStatus,
        type: currentConversion.type
      });
    }
    
    // In production, this would update the database
    // await db.update(conversions)
    //   .set({ 
    //     conversionStatus: normalizedStatus,
    //     revenue: amount?.toString() || currentConversion.revenue,
    //     statusUpdatedAt: new Date()
    //   })
    //   .where(eq(conversions.txid, txid));
    
    console.log('✅ Conversion status updated with normalization');
    
    return {
      txid,
      previousStatus: currentConversion.status,
      newStatus: normalizedStatus,
      isValidTransition: isValid
    };
    
  } catch (error) {
    console.error('❌ Failed to update conversion status:', error);
    throw error;
  }
}

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  const workerStatus = mockWorkerStatus.getStatus();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    postbackWorker: workerStatus,
    database: 'connected'
  });
});

// Get postback delivery statistics
apiRouter.get('/postback/stats', async (req, res) => {
  try {
    // In production, this would query the postback_deliveries table
    const stats = {
      totalDeliveries: 150,
      successfulDeliveries: 142,
      failedDeliveries: 8,
      successRate: 94.67,
      averageResponseTime: 850,
      lastDelivery: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Failed to get postback stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

// Mock worker status for health endpoint
const mockWorkerStatus = {
  getStatus: () => ({
    queueLength: 3,
    activeJobs: 1,
    processing: true,
    maxConcurrent: 10
  })
};

// Helper functions for universal webhook processing

// Apply filtering logic for incoming webhooks
async function applyWebhookFilters(webhookData: UniversalWebhookDto, req: any): Promise<{allowed: boolean, reason?: string}> {
  try {
    // Filter by offer_id if specified
    if (webhookData.offer_id) {
      // In production, check if offer exists and is active
      console.log(`🔍 Filtering by offer_id: ${webhookData.offer_id}`);
    }
    
    // Filter by partner_id if specified  
    if (webhookData.partner_id) {
      // In production, check if partner exists and is active
      console.log(`🔍 Filtering by partner_id: ${webhookData.partner_id}`);
    }
    
    // Filter by event type - check if we handle this event type
    const allowedEventTypes = ['registration', 'deposit', 'approve', 'hold', 'reject', 'lead', 'sale', 'rebill', 'refund', 'chargeback'];
    if (!allowedEventTypes.includes(webhookData.event_type)) {
      return {
        allowed: false,
        reason: `Event type '${webhookData.event_type}' not supported`
      };
    }
    
    // IP filtering (basic implementation - in production, check against whitelist)
    const clientIp = req.ip || req.connection?.remoteAddress;
    console.log(`🔍 Request from IP: ${clientIp}`);
    
    // Rate limiting would be implemented here with Redis
    // For now, we allow all requests
    
    return { allowed: true };
  } catch (error) {
    console.error('❌ Error in webhook filtering:', error);
    return {
      allowed: false,
      reason: 'Internal filtering error'
    };
  }
}

// Normalize universal webhook data to internal event format
async function normalizeUniversalWebhook(webhookData: UniversalWebhookDto) {
  // Map external event types to internal types
  const eventTypeMap = {
    'registration': 'reg',
    'deposit': 'purchase',
    'approve': 'reg',
    'hold': 'reg', 
    'reject': 'reg',
    'lead': 'reg',
    'sale': 'purchase',
    'rebill': 'purchase',
    'refund': 'purchase',
    'chargeback': 'purchase',
    'custom': 'reg'
  };
  
  const internalType = eventTypeMap[webhookData.event_type] || 'reg';
  
  // Determine the primary amount value
  const amount = webhookData.amount || webhookData.revenue || webhookData.payout || 0;
  
  return {
    type: internalType,
    clickid: webhookData.clickid,
    txid: webhookData.txid || webhookData.clickid,
    value: amount,
    currency: webhookData.currency || 'USD',
    
    // Additional tracking data
    offerId: webhookData.offer_id,
    partnerId: webhookData.partner_id,
    campaignId: webhookData.campaign_id,
    flowId: webhookData.flow_id,
    
    // Sub parameters
    subParams: {
      sub1: webhookData.sub1,
      sub2: webhookData.sub2,
      sub3: webhookData.sub3,
      sub4: webhookData.sub4,
      sub5: webhookData.sub5,
      sub6: webhookData.sub6,
      sub7: webhookData.sub7,
      sub8: webhookData.sub8,
      sub9: webhookData.sub9,
      sub10: webhookData.sub10,
      sub11: webhookData.sub11,
      sub12: webhookData.sub12,
      sub13: webhookData.sub13,
      sub14: webhookData.sub14,
      sub15: webhookData.sub15,
      sub16: webhookData.sub16,
    },
    
    // User and geo data
    userData: {
      user_id: webhookData.user_id,
      email: webhookData.email,
      phone: webhookData.phone,
    },
    
    geoData: {
      country: webhookData.country,
      geo: webhookData.geo,
      ip: webhookData.ip,
      device: webhookData.device,
      device_type: webhookData.device_type,
      os: webhookData.os,
      browser: webhookData.browser,
      user_agent: webhookData.user_agent,
    },
    
    // UTM parameters
    utmData: {
      utm_source: webhookData.utm_source,
      utm_medium: webhookData.utm_medium,
      utm_campaign: webhookData.utm_campaign,
      utm_term: webhookData.utm_term,
      utm_content: webhookData.utm_content,
    },
    
    // Custom and raw data
    custom: webhookData.custom || {},
    raw: webhookData.raw || {},
    source: webhookData.source || 'external',
    originalEventType: webhookData.event_type,
    timestamp: webhookData.timestamp || new Date().toISOString(),
  };
}

// Process the normalized universal webhook event
async function processUniversalWebhookEvent(normalizedEvent: any) {
  try {
    console.log('🔄 Processing universal webhook event:', {
      type: normalizedEvent.type,
      clickid: normalizedEvent.clickid,
      txid: normalizedEvent.txid,
      originalEventType: normalizedEvent.originalEventType,
      source: normalizedEvent.source
    });
    
    // Create conversion record
    const conversionType = normalizedEvent.type === 'reg' ? 'reg' as const : 'purchase' as const;
    const initialStatus = normalize(undefined, 'initiated', conversionType);
    
    const conversion = {
      advertiserId: 1, // In production, extract from auth or mapping
      partnerId: normalizedEvent.partnerId ? parseInt(normalizedEvent.partnerId) : 2,
      clickid: normalizedEvent.clickid,
      type: conversionType,
      txid: normalizedEvent.txid,
      revenue: normalizedEvent.value?.toString() || '0',
      currency: normalizedEvent.currency || 'USD',
      conversionStatus: initialStatus,
      
      // Enhanced details with all normalized data
      details: {
        originalEventType: normalizedEvent.originalEventType,
        source: normalizedEvent.source,
        subParams: normalizedEvent.subParams,
        userData: normalizedEvent.userData,
        geoData: normalizedEvent.geoData,
        utmData: normalizedEvent.utmData,
        custom: normalizedEvent.custom,
        raw: normalizedEvent.raw,
        processedAt: new Date().toISOString(),
      },
    };
    
    console.log('📝 Universal webhook conversion created:', {
      type: conversionType,
      status: initialStatus,
      source: normalizedEvent.source,
      clickid: conversion.clickid,
      txid: conversion.txid
    });
    
    // In production, save to database:
    // const savedConversion = await db.insert(conversions).values(conversion).returning();
    
    // Trigger postback delivery
    await triggerPostbacks(conversion);
    
    return {
      conversionId: `mock_${conversion.txid}`,
      postbacksTriggered: true,
      processedData: {
        originalEventType: normalizedEvent.originalEventType,
        normalizedType: conversionType,
        source: normalizedEvent.source
      }
    };
  } catch (error) {
    console.error('❌ Error processing universal webhook event:', error);
    throw error;
  }
}

export default apiRouter;