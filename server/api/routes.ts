// Enhanced API routes with idempotency and queue integration
import express from "express";
import { EventDto, AffiliateWebhookDto, PspWebhookDto } from "../../enhanced-postback-dto";
import { normalize, mapExternalStatus, Status } from "../domain/status";
import { enqueuePostbacks, ConversionRow } from "../queue/enqueue";
import { eq, and, count } from "drizzle-orm";
import { db } from "../db";
import { events } from "@shared/schema";

export const router = express.Router();

// Database interface for conversions (using real database instead of mock)
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
  details: any;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to find conversion in database
async function findConversion(advertiserId: string, type: 'reg' | 'purchase', txid: string): Promise<DatabaseConversion | null> {
  try {
    const conversion = await db
      .select()
      .from(events)
      .where(and(
        eq(events.advertiserId, advertiserId),
        eq(events.type, type),
        eq(events.txid, txid)
      ))
      .limit(1);
    
    return conversion[0] as DatabaseConversion || null;
  } catch (error) {
    console.error('Error finding conversion:', error);
    return null;
  }
}

// Helper function to insert conversion into database
async function insertConversion(data: Omit<DatabaseConversion, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseConversion> {
  try {
    const conversionData = {
      ...data,
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(events).values(conversionData);
    return conversionData;
  } catch (error) {
    console.error('Error inserting conversion:', error);
    throw error;
  }
}

// Helper function to update conversion in database
async function updateConversion(id: string, data: Partial<DatabaseConversion>): Promise<DatabaseConversion> {
  try {
    const updatedData = {
      ...data,
      updatedAt: new Date()
    };
    
    await db
      .update(events)
      .set(updatedData)
      .where(eq(events.id, id));
    
    const updated = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    if (updated.length === 0) {
      throw new Error('Conversion not found');
    }
    
    return updated[0] as DatabaseConversion;
  } catch (error) {
    console.error('Error updating conversion:', error);
    throw error;
  }
}

// POST /api/v2/event (инициация от фронта/сервиса)
router.post("/event", async (req, res, next) => {
  try {
    const dto = EventDto.parse(req.body);
    
    // Extract context from auth/request (simulated)
    const advertiserId = "1"; // req.advertiserId
    const partnerId = "2";    // req.partnerId
    const campaignId = "campaign_001"; // req.campaignId
    const offerId = "offer_001";       // req.offerId
    const flowId = "flow_001";         // req.flowId

    console.log('📥 Event received:', {
      type: dto.type,
      txid: dto.txid,
      clickid: dto.clickid,
      value: dto.value
    });

    // Check for existing conversion (idempotency)
    const existing = await findConversion(advertiserId, dto.type, dto.txid);
    
    // Normalize status
    const nextStatus = normalize(existing?.conversionStatus, "initiated", dto.type);
    
    const conversionData = {
      advertiserId,
      partnerId,
      campaignId,
      offerId,
      flowId,
      clickid: dto.clickid,
      type: dto.type,
      txid: dto.txid,
      currency: dto.currency || "USD",
      revenue: dto.value?.toString() ?? "0",
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
router.post("/webhook/affiliate", async (req, res, next) => {
  try {
    const dto = AffiliateWebhookDto.parse(req.body);
    const advertiserId = "1"; // req.advertiserId
    
    console.log('📥 Affiliate webhook received:', {
      type: dto.type,
      txid: dto.txid,
      status: dto.status,
      payout: dto.payout
    });

    // Find existing conversion
    const existing = await findConversion(advertiserId, "reg", dto.txid);
    
    // Map external status and normalize
    const mappedStatus = mapExternalStatus(dto.status, 'affiliate');
    const nextStatus = normalize(existing?.conversionStatus, mappedStatus, "reg");
    
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
        partnerId: "unknown",
        clickid: "", // Will be updated when front-end event arrives
        type: "reg",
        txid: dto.txid,
        currency: dto.currency || "USD",
        revenue: "0",
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
router.post("/webhook/psp", async (req, res, next) => {
  try {
    const dto = PspWebhookDto.parse(req.body);
    const advertiserId = "1"; // req.advertiserId
    
    console.log('📥 PSP webhook received:', {
      type: dto.type,
      txid: dto.txid,
      status: dto.status,
      amount: dto.amount
    });

    // Find existing conversion
    const existing = await findConversion(advertiserId, "purchase", dto.txid);
    
    // Map external status and normalize
    const mappedStatus = mapExternalStatus(dto.status, 'psp');
    const nextStatus = normalize(existing?.conversionStatus, mappedStatus, "purchase");
    
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
        partnerId: "unknown",
        clickid: "", // Will be updated when front-end event arrives
        type: "purchase",
        txid: dto.txid,
        revenue,
        currency: dto.currency || "USD",
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
router.get("/conversions", async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // Get conversions from real database instead of mock
    const conversions = await db
      .select({
        id: events.id,
        advertiserId: events.advertiserId,
        type: events.type,
        txid: events.txid,
        status: events.conversionStatus,
        revenue: events.revenue,
        currency: events.currency,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt
      })
      .from(events)
      .limit(Number(limit))
      .offset(Number(offset));
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(events);
    
    res.json({
      conversions,
      total: totalResult[0]?.count || 0,
      offset: Number(offset),
      limit: Number(limit)
    });
    
  } catch (error) {
    console.error('❌ Conversions list error:', error);
    res.status(500).json({ error: 'Failed to fetch conversions' });
  }
});

export default router;