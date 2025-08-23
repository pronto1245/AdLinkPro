// Enhanced API routes with idempotency and queue integration
import express from 'express';
import { EventDto, AffiliateWebhookDto, PspWebhookDto } from '../../enhanced-postback-dto';
import { normalize, mapExternalStatus, Status } from '../domain/status';
import { enqueuePostbacks } from '../queue/enqueue';

export const router = express.Router();

// Simulated database interface (in production, use real Drizzle client)
interface DatabaseConversion {
  id: string;
  advertiserId: string;
  partnerId: string;
  campaignId?: string;
  offerId?: string;
  flowId?: string;
  clickid: string;
  type: 'reg' | 'purchase';
  txid: string;
  currency: string;
  revenue: string;
  conversionStatus: Status;
  details: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database for development
const mockDatabase: DatabaseConversion[] = [];

// Helper function to find conversion
async function findConversion(advertiserId: string, type: 'reg' | 'purchase', txid: string): Promise<DatabaseConversion | null> {
  const conversion = mockDatabase.find(c =>
    c.advertiserId === advertiserId &&
    c.type === type &&
    c.txid === txid
  );
  return conversion || null;
}

// Helper function to insert conversion
async function insertConversion(data: Omit<DatabaseConversion, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseConversion> {
  const conversion: DatabaseConversion = {
    ...data,
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockDatabase.push(conversion);
  return conversion;
}

// Helper function to update conversion
async function updateConversion(id: string, updateData: Partial<DatabaseConversion>): Promise<DatabaseConversion> {
  const index = mockDatabase.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Conversion not found');
  }

  mockDatabase[index] = {
    ...mockDatabase[index],
    ...updateData,
    updatedAt: new Date()
  };

  return mockDatabase[index];
}

// POST /api/v2/event (инициация от фронта/сервиса)
router.post('/event', async (req, res, next) => {
  try {
    const dto = EventDto.parse(req.body);

    // Extract context from auth/request (simulated)
    const advertiserId = '1'; // req.advertiserId
    const partnerId = '2';    // req.partnerId
    const campaignId = 'campaign_001'; // req.campaignId
    const offerId = 'offer_001';       // req.offerId
    const flowId = 'flow_001';         // req.flowId

    console.log('📥 Event received:', {
      type: dto.type,
      txid: dto.txid,
      clickid: dto.clickid,
      value: dto.value
    });

    // Check for existing conversion (idempotency)
    const existing = await findConversion(advertiserId, dto.type, dto.txid);

    // Normalize status
    const nextStatus = normalize(existing?.conversionStatus, 'initiated', dto.type);

    const conversionData = {
      advertiserId,
      partnerId,
      campaignId,
      offerId,
      flowId,
      clickid: dto.clickid,
      type: dto.type,
      txid: dto.txid,
      currency: dto.currency || 'USD',
      revenue: dto.value?.toString() ?? '0',
      conversionStatus: nextStatus,
      details: {
        ...(existing?.details ?? {}),
        event: dto,
        source: 'api_event'
      }
    };

    let conversion: DatabaseConversion;

    if (!existing) {
      // Create new conversion
      conversion = await insertConversion(conversionData);
      console.log('✅ New conversion created:', {
        id: conversion.id,
        status: conversion.conversionStatus
      });
    } else {
      // Update existing conversion (idempotent)
      conversion = await updateConversion(existing.id, conversionData);
      console.log('🔄 Existing conversion updated:', {
        id: conversion.id,
        previousStatus: existing.conversionStatus,
        newStatus: conversion.conversionStatus
      });
    }

    // Enqueue postback tasks
    await enqueuePostbacks(conversion);

    const statusCode = existing ? 200 : 201;
    return res.status(statusCode).json({
      id: conversion.id,
      status: conversion.conversionStatus,
      created: !existing
    });

  } catch (error) {
    console.error('❌ Event processing error:', error);
    next(error);
  }
});

// POST /api/v2/webhook/affiliate (регистрация)
router.post('/webhook/affiliate', async (req, res, next) => {
  try {
    const dto = AffiliateWebhookDto.parse(req.body);
    const advertiserId = '1'; // req.advertiserId

    console.log('📥 Affiliate webhook received:', {
      type: dto.type,
      txid: dto.txid,
      status: dto.status,
      payout: dto.payout
    });

    // Find existing conversion
    const existing = await findConversion(advertiserId, 'reg', dto.txid);

    // Map external status and normalize
    const mappedStatus = mapExternalStatus(dto.status, 'affiliate');
    const nextStatus = normalize(existing?.conversionStatus, mappedStatus, 'reg');

    console.log('📊 Status processing:', {
      externalStatus: dto.status,
      mappedStatus,
      previousStatus: existing?.conversionStatus,
      normalizedStatus: nextStatus
    });

    let conversion: DatabaseConversion;

    if (!existing) {
      // Create conversion from webhook only
      conversion = await insertConversion({
        advertiserId,
        partnerId: 'unknown',
        clickid: '', // Will be updated when front-end event arrives
        type: 'reg',
        txid: dto.txid,
        currency: dto.currency || 'USD',
        revenue: '0',
        conversionStatus: nextStatus,
        details: {
          webhook: dto,
          source: 'affiliate_webhook'
        }
      });
      console.log('✅ Conversion created from webhook:', conversion.id);
    } else {
      // Update existing conversion
      const updateData = {
        conversionStatus: nextStatus,
        revenue: (dto.payout ?? 0).toString(),
        currency: dto.currency ?? existing.currency,
        details: {
          ...(existing.details ?? {}),
          webhook: dto,
          source: 'affiliate_webhook'
        }
      };

      conversion = await updateConversion(existing.id, updateData);
      console.log('🔄 Conversion updated from webhook:', {
        id: conversion.id,
        statusChange: `${existing.conversionStatus} → ${nextStatus}`
      });
    }

    // Enqueue postback tasks
    await enqueuePostbacks(conversion);

    // Return 204 No Content for webhooks (standard practice)
    res.status(204).end();

  } catch (error) {
    console.error('❌ Affiliate webhook error:', error);
    next(error);
  }
});

// POST /api/v2/webhook/psp (покупки)
router.post('/webhook/psp', async (req, res, next) => {
  try {
    const dto = PspWebhookDto.parse(req.body);
    const advertiserId = '1'; // req.advertiserId

    console.log('📥 PSP webhook received:', {
      type: dto.type,
      txid: dto.txid,
      status: dto.status,
      amount: dto.amount
    });

    // Find existing conversion
    const existing = await findConversion(advertiserId, 'purchase', dto.txid);

    // Map external status and normalize
    const mappedStatus = mapExternalStatus(dto.status, 'psp');
    const nextStatus = normalize(existing?.conversionStatus, mappedStatus, 'purchase');

    console.log('📊 PSP status processing:', {
      externalStatus: dto.status,
      mappedStatus,
      previousStatus: existing?.conversionStatus,
      normalizedStatus: nextStatus
    });

    const revenue = (dto.amount ?? 0).toString();

    let conversion: DatabaseConversion;

    if (!existing) {
      // Create conversion from PSP webhook
      conversion = await insertConversion({
        advertiserId,
        partnerId: 'unknown',
        clickid: '', // Will be updated when front-end event arrives
        type: 'purchase',
        txid: dto.txid,
        revenue,
        currency: dto.currency || 'USD',
        conversionStatus: nextStatus,
        details: {
          webhook: dto,
          source: 'psp_webhook'
        }
      });
      console.log('✅ Purchase conversion created from PSP:', conversion.id);
    } else {
      // Update existing conversion
      const updateData = {
        conversionStatus: nextStatus,
        revenue,
        currency: dto.currency ?? existing.currency,
        details: {
          ...(existing.details ?? {}),
          webhook: dto,
          source: 'psp_webhook'
        }
      };

      conversion = await updateConversion(existing.id, updateData);
      console.log('🔄 Purchase conversion updated from PSP:', {
        id: conversion.id,
        statusChange: `${existing.conversionStatus} → ${nextStatus}`,
        revenueChange: `${existing.revenue} → ${revenue}`
      });
    }

    // Enqueue postback tasks
    await enqueuePostbacks(conversion);

    // Return 204 No Content for webhooks
    res.status(204).end();

  } catch (error) {
    console.error('❌ PSP webhook error:', error);
    next(error);
  }
});

// GET /api/v2/conversions (для отладки)
router.get('/conversions', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const conversions = mockDatabase
      .slice(Number(offset), Number(offset) + Number(limit))
      .map(c => ({
        id: c.id,
        advertiserId: c.advertiserId,
        type: c.type,
        txid: c.txid,
        status: c.conversionStatus,
        revenue: c.revenue,
        currency: c.currency,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }));

    res.json({
      conversions,
      total: mockDatabase.length,
      offset: Number(offset),
      limit: Number(limit)
    });

  } catch (error) {
    console.error('❌ Conversions list error:', error);
    res.status(500).json({ error: 'Failed to fetch conversions' });
  }
});

export default router;
