#!/usr/bin/env node

/**
 * Test script for postback endpoints
 * Tests the newly implemented and fixed postback API endpoints
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Test endpoints
const ENDPOINTS_TO_TEST = [
  // V1 Postback API
  {
    method: 'GET',
    path: '/api/v1/postback',
    description: 'V1 Postback API endpoint',
    requiresAuth: true
  },
  // Admin postback endpoints
  {
    method: 'GET', 
    path: '/api/admin/postback-logs',
    description: 'Admin postback logs',
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/admin/postback-templates',
    description: 'Admin postback templates',
    requiresAuth: true
  },
  // Standard postback endpoints  
  {
    method: 'GET',
    path: '/api/postback/profiles', 
    description: 'Postback profiles (affiliate)',
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/postback/deliveries',
    description: 'Postback deliveries',
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/postback/logs',
    description: 'Postback logs alias',
    requiresAuth: false
  },
  // Postback profiles endpoints
  {
    method: 'GET',
    path: '/api/postback-profiles',
    description: 'Postback profiles collection',
    requiresAuth: true
  },
  // Health check (no auth needed)
  {
    method: 'GET',
    path: '/api/health',
    description: 'Health check endpoint',
    requiresAuth: false
  }
];

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PostbackEndpointTester/1.0',
        ...options.headers
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Test single endpoint
 */
async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  
  console.log(`\n🔍 Testing: ${endpoint.description}`);
  console.log(`   ${endpoint.method} ${endpoint.path}`);
  
  try {
    const options = {
      method: endpoint.method
    };
    
    // Add mock auth header for protected endpoints
    if (endpoint.requiresAuth) {
      options.headers = {
        'Authorization': 'Bearer mock-token-for-testing'
      };
    }
    
    const response = await makeRequest(url, options);
    
    console.log(`   Status: ${response.statusCode} ${response.statusMessage}`);
    
    // Check if endpoint exists (not 404)
    if (response.statusCode === 404) {
      console.log('   ❌ ENDPOINT NOT FOUND');
      return false;
    }
    
    // Check if endpoint is implemented (not 501)
    if (response.statusCode === 501) {
      console.log('   ❌ ENDPOINT NOT IMPLEMENTED');
      return false;
    }
    
    // Auth required endpoints should return 401/403 without proper auth
    if (endpoint.requiresAuth && (response.statusCode === 401 || response.statusCode === 403)) {
      console.log('   ✅ AUTHENTICATION REQUIRED (EXPECTED)');
      return true;
    }
    
    // Success responses
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('   ✅ SUCCESS');
      if (typeof response.data === 'object') {
        console.log('   📄 Response sample:', JSON.stringify(response.data).substring(0, 200) + '...');
      }
      return true;
    }
    
    // Other responses
    console.log('   ⚠️  UNEXPECTED RESPONSE');
    if (typeof response.data === 'object') {
      console.log('   📄 Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('   📄 Response:', response.data);
    }
    
    return false;
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

/**
 * Run all endpoint tests
 */
async function runTests() {
  console.log('🚀 Starting Postback Endpoints Test');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = ENDPOINTS_TO_TEST.length;
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const success = await testEndpoint(endpoint);
    if (success) passedTests++;
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL POSTBACK ENDPOINTS ARE WORKING!');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} ENDPOINTS NEED ATTENTION`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});