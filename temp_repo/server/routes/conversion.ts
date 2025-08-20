import { Router } from 'express';
import { db } from '../db';
import { trackingClicks, postbackLogs } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { PostbackService } from '../services/postback';

const router = Router();

// Handle conversion events
// Auth middleware (простая версия для конверсий)
const requireAuth = async (req: any, res: any, next: any) => {
  // Для конверсий можем использовать API ключ или более простую авторизацию
  next();
};

router.post('/event', requireAuth, async (req, res) => {
  try {
    const { 
      clickId, 
      eventType, 
      status, 
      payout, 
      currency = 'USD',
      transactionId,
      subId1,
      subId2,
      subId3,
      subId4,
      subId5 
    } = req.body;

    if (!clickId || !eventType) {
      return res.status(400).json({ 
        error: 'ClickId and eventType are required' 
      });
    }

    // Get click data
    const [click] = await db.select()
      .from(trackingClicks)
      .where(eq(trackingClicks.clickId, clickId));

    if (!click) {
      return res.status(404).json({ 
        error: 'Click not found' 
      });
    }

    // Update click status (payout will be stored in conversion_data JSON field)
    const conversionData = {
      payout: payout ? parseFloat(payout) : 0,
      currency: currency || 'USD',
      transactionId: transactionId || clickId,
      timestamp: new Date().toISOString()
    };

    await db.update(trackingClicks)
      .set({ 
        status: status || 'converted',
        conversionData: conversionData
      })
      .where(eq(trackingClicks.clickId, clickId));

    // Prepare postback data
    const postbackData = {
      clickid: clickId,
      status: status || 'approved',
      payout: payout || '0',
      currency,
      offer_id: click.offerId,
      partner_id: click.partnerId,
      transaction_id: transactionId || clickId,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      sub1: subId1 || click.subId1 || '',
      sub2: subId2 || click.subId2 || '',
      sub3: subId3 || click.subId3 || '',
      sub4: subId4 || click.subId4 || '',
      sub5: subId5 || click.subId5 || '',
      ip: click.ip || '',
      country: click.country || '',
      device: click.device || '',
      browser: click.browser || '',
      os: click.os || ''
    };

    // Trigger postbacks
    const postbackEvent = {
      type: eventType as any,
      clickId,
      data: postbackData
    };

    console.log('About to trigger postbacks for event:', postbackEvent);
    const results = await PostbackService.triggerPostbacks(postbackEvent);
    console.log('Postback trigger completed, results:', results.length);
    
    console.log(`Conversion event processed: ${eventType} for click ${clickId}`);

    res.json({
      success: true,
      message: 'Conversion event processed',
      clickId,
      eventType,
      status: status || 'approved',
      payout,
      postbacksSent: results.filter(r => r.status === 'fulfilled').length,
      postbacksFailed: results.filter(r => r.status === 'rejected').length
    });

  } catch (error) {
    console.error('Error processing conversion event:', error);
    res.status(500).json({ 
      error: 'Failed to process conversion event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to generate sample conversion
router.post('/test-conversion', requireAuth, async (req, res) => {
  try {
    // Get a random recent click
    const [recentClick] = await db.select()
      .from(trackingClicks)
      .where(eq(trackingClicks.status, 'active'))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (!recentClick) {
      return res.status(404).json({ 
        error: 'No active clicks found to convert' 
      });
    }

    // Generate test conversion
    const testConversion = {
      clickId: recentClick.clickId,
      eventType: 'conversion',
      status: 'approved',
      payout: (Math.random() * 100 + 10).toFixed(2),
      currency: 'USD',
      transactionId: `test_${Date.now()}`
    };

    // Process the conversion
    const conversionResponse = await fetch(`${req.protocol}://${req.get('host')}/api/conversion/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      body: JSON.stringify(testConversion)
    });

    const result = await conversionResponse.json();

    res.json({
      success: true,
      message: 'Test conversion generated',
      conversion: testConversion,
      result
    });

  } catch (error) {
    console.error('Error generating test conversion:', error);
    res.status(500).json({ 
      error: 'Failed to generate test conversion' 
    });
  }
});

// Get conversion statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let query = db.select({
      total: sql`COUNT(*)`,
      converted: sql`COUNT(CASE WHEN status = 'converted' THEN 1 END)`,
      totalPayout: sql`SUM(CASE WHEN conversion_data IS NOT NULL THEN CAST(conversion_data->>'payout' AS DECIMAL) ELSE 0 END)`,
      avgPayout: sql`AVG(CASE WHEN conversion_data IS NOT NULL THEN CAST(conversion_data->>'payout' AS DECIMAL) ELSE NULL END)`
    }).from(trackingClicks);

    if (dateFrom && dateTo) {
      query = query.where(
        and(
          sql`created_at >= ${dateFrom}`,
          sql`created_at <= ${dateTo}`
        )
      );
    }

    const [stats] = await query;

    res.json({
      success: true,
      stats: {
        totalClicks: parseInt(stats.total) || 0,
        conversions: parseInt(stats.converted) || 0,
        conversionRate: stats.total ? 
          ((parseInt(stats.converted) / parseInt(stats.total)) * 100).toFixed(2) + '%' : '0%',
        totalPayout: parseFloat(stats.totalPayout) || 0,
        averagePayout: parseFloat(stats.avgPayout) || 0
      }
    });

  } catch (error) {
    console.error('Error fetching conversion stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversion statistics' 
    });
  }
});

export default router;