import express from 'express';
import { db } from '../../db';
import { offers, users } from '@shared/schema';
import { trackingClicks } from '@shared/tracking-schema';
import { FraudService } from '../../services/fraudService';
import { GeoService } from '../../services/geoService';
import { randomUUID } from 'crypto';

const router = express.Router();

// Create sample tracking data for testing
router.post('/sample', async (req, res) => {
  try {
    const { count = 20 } = req.body;
    
    // Get existing offers and users for realistic references
    const existingOffers = await db.select().from(offers).limit(10);
    const existingUsers = await db.select().from(users).where(eq(users.role, 'affiliate')).limit(10);
    
    if (!existingOffers.length || !existingUsers.length) {
      return res.status(400).json({ error: 'Need offers and affiliate users to create sample data' });
    }

    const sampleIPs = [
      '192.168.1.100', '10.0.0.50', '203.0.113.45', '198.51.100.10',
      '85.25.139.78', '177.54.123.89', '91.186.55.44', '46.148.120.33'
    ];
    
    const sampleUserAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
      'python-requests/2.25.1', // Bot user agent
      'curl/7.68.0' // Another bot user agent
    ];

    const sampleCountries = ['RU', 'US', 'DE', 'UA', 'FR', 'IT', 'GB', 'ES'];
    const sampleDevices = ['Desktop', 'Mobile', 'Tablet'];
    const sampleBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const sampleOS = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];

    const sampleData = [];
    
    for (let i = 0; i < count; i++) {
      const offer = existingOffers[Math.floor(Math.random() * existingOffers.length)];
      const user = existingUsers[Math.floor(Math.random() * existingUsers.length)];
      const ip = sampleIPs[Math.floor(Math.random() * sampleIPs.length)];
      const userAgent = sampleUserAgents[Math.floor(Math.random() * sampleUserAgents.length)];
      const country = sampleCountries[Math.floor(Math.random() * sampleCountries.length)];
      
      // Generate random SubIDs with varying probability
      const generateSubId = (probability: number) => 
        Math.random() < probability ? `sub_${Math.floor(Math.random() * 1000)}` : null;

      const clickData = {
        id: randomUUID(),
        clickId: `click_${Date.now()}_${i}`,
        partnerId: user.id,
        offerId: offer.id,
        ip,
        userAgent,
        referer: Math.random() > 0.3 ? 'https://facebook.com/ads' : null,
        country,
        device: sampleDevices[Math.floor(Math.random() * sampleDevices.length)],
        browser: sampleBrowsers[Math.floor(Math.random() * sampleBrowsers.length)],
        os: sampleOS[Math.floor(Math.random() * sampleOS.length)],
        
        // SubIDs 1-30 with realistic probability distribution
        subId1: generateSubId(0.8),
        subId2: generateSubId(0.7),
        subId3: generateSubId(0.6),
        subId4: generateSubId(0.5),
        subId5: generateSubId(0.4),
        subId6: generateSubId(0.35),
        subId7: generateSubId(0.3),
        subId8: generateSubId(0.25),
        subId9: generateSubId(0.2),
        subId10: generateSubId(0.18),
        subId11: generateSubId(0.15),
        subId12: generateSubId(0.12),
        subId13: generateSubId(0.1),
        subId14: generateSubId(0.08),
        subId15: generateSubId(0.06),
        subId16: generateSubId(0.05),
        subId17: generateSubId(0.04),
        subId18: generateSubId(0.03),
        subId19: generateSubId(0.02),
        subId20: generateSubId(0.02),
        subId21: generateSubId(0.01),
        subId22: generateSubId(0.01),
        subId23: generateSubId(0.01),
        subId24: generateSubId(0.005),
        subId25: generateSubId(0.005),
        subId26: generateSubId(0.003),
        subId27: generateSubId(0.003),
        subId28: generateSubId(0.002),
        subId29: generateSubId(0.002),
        subId30: generateSubId(0.001),
        
        landingUrl: `https://landing.example.com/${offer.id}`,
        isUnique: Math.random() > 0.1,
        status: Math.random() > 0.8 ? 'converted' : 'active',
        mobileCarrier: Math.random() > 0.5 ? 'Vodafone' : null,
        connectionType: Math.random() > 0.5 ? 'wifi' : 'mobile',
        timeOnLanding: Math.floor(Math.random() * 300),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
      };

      // Run fraud analysis
      const fraudResult = await FraudService.analyzeFraud({
        ip: clickData.ip,
        userAgent: clickData.userAgent,
        country: clickData.country,
        device: clickData.device,
        browser: clickData.browser,
        referer: clickData.referer || undefined,
        clickId: clickData.clickId
      });

      // Apply fraud analysis results
      clickData.fraudScore = fraudResult.fraudScore;
      clickData.isBot = fraudResult.isBot;
      clickData.vpnDetected = fraudResult.vpnDetected;
      clickData.riskLevel = fraudResult.riskLevel;

      sampleData.push(clickData);
    }

    // Insert all sample data
    await db.insert(trackingClicks).values(sampleData);

    res.json({ 
      success: true, 
      message: `Created ${count} sample tracking records with fraud analysis`,
      data: sampleData.map(d => ({
        clickId: d.clickId,
        ip: d.ip,
        country: d.country,
        fraudScore: d.fraudScore,
        isBot: d.isBot,
        riskLevel: d.riskLevel
      }))
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
    res.status(500).json({ error: 'Failed to create sample data' });
  }
});

// Get tracking analytics with real data
router.get('/analytics', async (req, res) => {
  try {
    const { 
      dateFrom, 
      dateTo, 
      search, 
      quickFilter,
      page = 1,
      limit = 50
    } = req.query;

    let query = db
      .select({
        id: trackingClicks.id,
        clickId: trackingClicks.clickId,
        ip: trackingClicks.ip,
        country: trackingClicks.country,
        device: trackingClicks.device,
        browser: trackingClicks.browser,
        os: trackingClicks.os,
        fraudScore: trackingClicks.fraudScore,
        isBot: trackingClicks.isBot,
        vpnDetected: trackingClicks.vpnDetected,
        riskLevel: trackingClicks.riskLevel,
        status: trackingClicks.status,
        createdAt: trackingClicks.createdAt,
        offerName: offers.name,
        partnerName: users.username
      })
      .from(trackingClicks)
      .leftJoin(offers, eq(trackingClicks.offerId, offers.id))
      .leftJoin(users, eq(trackingClicks.partnerId, users.id));

    // Apply filters
    const conditions = [];
    
    if (dateFrom && dateTo) {
      conditions.push(
        and(
          gte(trackingClicks.createdAt, new Date(dateFrom as string)),
          lte(trackingClicks.createdAt, new Date(dateTo as string))
        )
      );
    }

    if (search) {
      conditions.push(
        or(
          ilike(trackingClicks.clickId, `%${search}%`),
          ilike(trackingClicks.ip, `%${search}%`),
          ilike(offers.name, `%${search}%`)
        )
      );
    }

    if (quickFilter) {
      switch (quickFilter) {
        case 'bots':
          conditions.push(eq(trackingClicks.isBot, true));
          break;
        case 'fraud':
          conditions.push(gte(trackingClicks.fraudScore, 50));
          break;
        case 'conversions':
          conditions.push(eq(trackingClicks.status, 'converted'));
          break;
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.limit(Number(limit)).offset(offset);

    const results = await query;

    res.json({
      success: true,
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: results.length
      }
    });

  } catch (error) {
    console.error('Error fetching tracking analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Clear all tracking data (for testing)
router.delete('/clear', async (req, res) => {
  try {
    await db.delete(trackingClicks);
    res.json({ success: true, message: 'All tracking data cleared' });
  } catch (error) {
    console.error('Error clearing tracking data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

export default router;