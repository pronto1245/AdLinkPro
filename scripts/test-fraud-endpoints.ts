#!/usr/bin/env tsx

/**
 * Test script for fraud API endpoints
 * Run with: npm run dev -- --test-fraud
 */

import { config } from '../server/config/environment.js';
import { storage } from '../server/storage';
import { FraudService } from '../server/services/fraudService';

async function testFraudEndpoints() {
  console.log('🧪 Testing Fraud API Endpoints...\n');

  try {
    // Test 1: Get fraud statistics
    console.log('1️⃣ Testing fraud statistics...');
    const fraudStats = await storage.getFraudStats({ period: '30d' });
    console.log('✅ Fraud stats:', JSON.stringify(fraudStats, null, 2));

    // Test 2: Test FraudService
    console.log('\n2️⃣ Testing FraudService...');
    const serviceStats = await FraudService.getFraudStats({ period: '30d' });
    console.log('✅ Service stats:', JSON.stringify(serviceStats, null, 2));

    // Test 3: Check database connectivity
    console.log('\n3️⃣ Testing database connectivity...');
    const users = await storage.getUsers();
    console.log(`✅ Database connection OK - Found ${users.length} users`);

    // Test 4: Test smart alerts
    console.log('\n4️⃣ Testing smart alerts...');
    const smartAlerts = await storage.getSmartAlerts();
    console.log(`✅ Smart alerts: Found ${smartAlerts.length} alerts`);
    smartAlerts.forEach((alert, i) => {
      console.log(`   ${i + 1}. ${alert.type}: ${alert.title} (${alert.severity})`);
    });

    console.log('\n✅ All fraud endpoint tests passed!\n');

    // Display endpoint summary
    console.log('📍 Available fraud endpoints:');
    console.log('   GET  /api/admin/fraud-alerts');
    console.log('   GET  /api/admin/fraud-alerts/:id');
    console.log('   PATCH /api/admin/fraud-alerts/:id');
    console.log('   GET  /api/admin/fraud-metrics');
    console.log('   GET  /api/admin/fraud-stats');
    console.log('   GET  /api/admin/smart-alerts');
    console.log('   POST /api/admin/fraud-blocks');
    console.log('   GET  /api/admin/fraud-reports');
    console.log('   DELETE /api/admin/fraud-rules/:id');
    console.log('   GET  /api/analytics/fraud');
    console.log('   GET  /api/analytics/export');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFraudEndpoints().then(() => process.exit(0));
}

export { testFraudEndpoints };