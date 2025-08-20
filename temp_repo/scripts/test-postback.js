#!/usr/bin/env node
/**
 * Simple test script for postback functionality
 * Tests the postback API and service integration
 */

const { PostbackService } = require('../server/services/postback');

async function testPostbackSystem() {
  console.log('🧪 Testing Postback System\n');
  
  try {
    // Test 1: Anti-fraud check
    console.log('1️⃣ Testing Anti-fraud checks...');
    const mockClickData = {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referer: 'https://google.com',
      country: 'US',
      device: 'desktop'
    };
    
    const mockEvent = {
      type: 'conversion',
      clickId: 'test_12345',
      data: { revenue: '25.50', currency: 'USD' },
      offerId: 'offer_1',
      partnerId: 'partner_1'
    };
    
    const fraudCheck = await PostbackService.performAntiFraudCheck(mockClickData, mockEvent);
    console.log(`   Risk Score: ${fraudCheck.riskScore}`);
    console.log(`   Fraudulent: ${fraudCheck.isFraudulent}`);
    console.log(`   Reasons: ${fraudCheck.reasons.join(', ')}\n`);
    
    // Test 2: Macro replacement
    console.log('2️⃣ Testing Macro replacement...');
    const template = 'https://tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}&country={country}';
    const macros = {
      clickid: 'test_12345',
      status: 'lead',
      revenue: '25.50',
      country: 'US'
    };
    
    const processedUrl = PostbackService.replaceMacros(template, macros);
    console.log(`   Template: ${template}`);
    console.log(`   Result: ${processedUrl}\n`);
    
    // Test 3: Click ID generation
    console.log('3️⃣ Testing Click ID generation...');
    const clickIds = [];
    for (let i = 0; i < 5; i++) {
      clickIds.push(PostbackService.generateClickId());
    }
    console.log(`   Generated IDs: ${clickIds.join(', ')}\n`);
    
    // Test 4: Retry configuration
    console.log('4️⃣ Testing Retry configuration...');
    const retryConfig = {
      maxRetryAttempts: 5,
      baseRetryDelay: 30,
      maxRetryDelay: 1800,
      exponentialBackoff: true
    };
    
    console.log('   Retry delays for 5 attempts:');
    for (let attempt = 0; attempt < 5; attempt++) {
      const delay = Math.min(
        retryConfig.baseRetryDelay * Math.pow(2, attempt),
        retryConfig.maxRetryDelay
      );
      console.log(`     Attempt ${attempt + 1}: ${delay} seconds`);
    }
    console.log();
    
    // Test 5: URL building
    console.log('5️⃣ Testing Tracking URL generation...');
    const trackingUrl = PostbackService.generateTrackingUrl(
      'https://platform.com',
      'partner_123',
      'offer_456',
      { sub1: 'campaign_a', sub2: 'source_fb' }
    );
    console.log(`   Generated URL: ${trackingUrl}\n`);
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Mock database functions if running in isolation
if (typeof global !== 'undefined' && !global.db) {
  global.db = {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [{ id: 'test' }] }) })
  };
}

// Run tests if called directly
if (require.main === module) {
  testPostbackSystem();
}

module.exports = { testPostbackSystem };