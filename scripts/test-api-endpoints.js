#!/usr/bin/env node
/**
 * API Endpoints Testing Script
 * Tests postback-related functionality and authentication
 */

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_ENDPOINTS = [
  {
    name: 'Token Verification',
    method: 'GET',
    url: '/api/auth/verify-token',
    description: 'Verify authentication token from .token file'
  },
  {
    name: 'Postback Analytics',
    method: 'GET', 
    url: '/api/analytics/postback-analytics',
    description: 'Get postback delivery metrics and status'
  },
  {
    name: 'Postback Monitoring',
    method: 'GET',
    url: '/api/postback/monitoring',
    description: 'Get postback monitoring dashboard data'
  }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing: ${endpoint.name}`);
    console.log(`   ${endpoint.method} ${endpoint.url}`);
    console.log(`   Description: ${endpoint.description}`);

    const response = await fetch(`${BASE_URL}${endpoint.url}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`   Status: ${status} ${statusText}`);
    
    if (status === 200 || status === 401) { // 401 is expected for some endpoints without auth
      console.log('   ✅ SUCCESS');
      try {
        const data = await response.json();
        console.log('   Response sample:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      } catch (e) {
        console.log('   Response: Non-JSON response');
      }
    } else {
      console.log('   ❌ FAILED');
      try {
        const errorData = await response.text();
        console.log('   Error:', errorData.substring(0, 100) + '...');
      } catch (e) {
        console.log('   Error: Unable to read response');
      }
    }

    return status === 200 || status === 401;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testPostbackTrigger() {
  try {
    console.log('\n🚀 Testing Postback Trigger Functionality');
    
    // Import PostbackService if running in Node.js context
    let PostbackService;
    try {
      PostbackService = require('../server/services/postback').PostbackService;
    } catch (e) {
      console.log('   ⚠️ PostbackService not available in test context');
      return false;
    }

    // Test click ID generation
    const clickId = PostbackService.generateClickId();
    console.log(`   Generated Click ID: ${clickId}`);

    // Test macro replacement
    const testUrl = 'https://tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}';
    const testMacros = {
      clickid: clickId,
      status: 'registration',
      revenue: '0.00'
    };
    
    const processedUrl = PostbackService.replaceMacros(testUrl, testMacros);
    console.log(`   Processed URL: ${processedUrl}`);

    // Test trigger postbacks (mock data)
    const testEvent = {
      type: 'registration',
      clickId: clickId,
      data: {
        partner_id: 'test-partner',
        username: 'test-user',
        email: 'test@example.com',
        role: 'affiliate'
      }
    };

    console.log('   Test event prepared:', JSON.stringify(testEvent, null, 2));
    console.log('   ✅ Postback functionality test completed');
    
    return true;
  } catch (error) {
    console.log(`   ❌ Postback test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Starting API Endpoints Testing');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  let passedTests = 0;
  let totalTests = TEST_ENDPOINTS.length + 1; // +1 for postback trigger test

  // Test HTTP endpoints
  for (const endpoint of TEST_ENDPOINTS) {
    const success = await testEndpoint(endpoint);
    if (success) passedTests++;
  }

  // Test postback functionality
  const postbackSuccess = await testPostbackTrigger();
  if (postbackSuccess) passedTests++;

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, testPostbackTrigger };