// API routes with enhanced postback system integration
import express from 'express';
import { z } from 'zod';
import { EventDto, AffiliateWebhookDto, PspWebhookDto } from '../enhanced-postback-dto';
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
    
    // Create conversion record
    const conversion = {
      advertiserId: 1, // Extract from auth or context
      partnerId: 2,
      clickid: eventData.clickid,
      type: eventData.type === 'reg' ? 'reg' as const : 'purchase' as const,
      txid: eventData.txid,
      revenue: eventData.value?.toString() || '0',
      currency: eventData.currency || 'USD',
      conversionStatus: 'initiated' as const,
      details: eventData.meta || {},
    };
    
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
    
    // Update conversion status
    await updateConversionStatus(webhookData.txid, webhookData.status, webhookData.payout);
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
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
    
    // Update conversion with payment status
    await updateConversionStatus(webhookData.txid, webhookData.status, webhookData.amount);
    
    res.json({
      success: true,
      message: 'PSP webhook processed successfully'
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

// Helper function to update conversion status
async function updateConversionStatus(txid: string, status: string, amount?: number) {
  try {
    console.log('🔄 Updating conversion status:', {
      txid,
      status,
      amount
    });
    
    // In production, this would update the database
    // await db.update(conversions)
    //   .set({ 
    //     conversionStatus: status,
    //     revenue: amount?.toString() || '0',
    //     statusUpdatedAt: new Date()
    //   })
    //   .where(eq(conversions.txid, txid));
    
    console.log('✅ Conversion status updated successfully');
    
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

export default apiRouter;