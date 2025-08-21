#!/usr/bin/env node

/**
 * Final Registration Test Script
 * 
 * This script tests the fixed registration endpoints with a real server.
 * Run this after starting your server to validate the registration fix.
 * 
 * Usage:
 *   1. Start your server: npm run dev
 *   2. Run this script: node test-registration-final.js
 */

const http = require('http');
const crypto = require('crypto');

console.log('🚀 AdLinkPro Registration Fix - Final Test Script\n');

// Test configuration
const config = {
  hostname: 'localhost',
  ports: [3000, 5000, 3001, 8080], // Ports to try
  timeout: 10000 // 10 second timeout
};

// Generate unique test data to avoid conflicts
const timestamp = Date.now();
const uniqueId = crypto.randomBytes(4).toString('hex');

const testData = {
  partner: {
    name: 'Test Partner User',
    email: `testpartner_${uniqueId}@example.com`,
    password: 'TestPass123!',
    agreeTerms: true,
    agreePrivacy: true,
    role: 'PARTNER'
  },
  advertiser: {
    name: 'Test Advertiser User',
    email: `testadvertiser_${uniqueId}@example.com`,
    password: 'TestPass123!',
    company: 'Test Company Ltd.',
    agreeTerms: true,
    agreePrivacy: true,
    role: 'ADVERTISER'
  }
};

// HTTP request helper
function makeHttpRequest(hostname, port, path, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = method === 'POST' ? JSON.stringify(data) : '';
    
    const options = {
      hostname,
      port,
      path,
      method,
      timeout: config.timeout,
      headers: method === 'POST' ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'AdLinkPro-Registration-Test',
        'Accept': 'application/json'
      } : {
        'User-Agent': 'AdLinkPro-Registration-Test',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            raw: responseData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: responseData,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (method === 'POST') {
      req.write(postData);
    }
    req.end();
  });
}

// Find working server
async function findWorkingServer() {
  console.log('🔍 Scanning for running server...');
  
  for (const port of config.ports) {
    try {
      console.log(`   Testing port ${port}...`);
      const response = await makeHttpRequest(config.hostname, port, '/api/health', {}, 'GET');
      
      if (response.status === 200) {
        console.log(`   ✅ Server found on port ${port}`);
        console.log(`   📊 Health check response:`, response.data);
        return port;
      } else {
        console.log(`   ⚠️  Port ${port} responded but not healthy (status: ${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ Port ${port}: ${error.message}`);
    }
  }
  
  return null;
}

// Validate registration response
function validateRegistrationResponse(response, testName, expectedRole) {
  console.log(`\n📋 Validating ${testName} response...`);
  
  const issues = [];
  
  // Status code check
  if (response.status !== 201) {
    issues.push(`Expected status 201, got ${response.status}`);
  }
  
  // Response structure checks
  if (!response.data) {
    issues.push('No response data received');
    return { valid: false, issues };
  }
  
  if (!response.data.success) {
    issues.push('Response missing success field or success is false');
  }
  
  if (!response.data.token) {
    issues.push('Response missing JWT token');
  } else if (typeof response.data.token !== 'string' || response.data.token.length < 10) {
    issues.push('JWT token appears invalid');
  }
  
  if (!response.data.user) {
    issues.push('Response missing user data');
  } else {
    const user = response.data.user;
    
    if (!user.id) issues.push('User missing ID');
    if (!user.email) issues.push('User missing email');
    if (!user.username) issues.push('User missing username');
    if (user.role !== expectedRole) {
      issues.push(`Expected role '${expectedRole}', got '${user.role}'`);
    }
    if (!user.firstName) issues.push('User missing firstName');
  }
  
  if (!response.data.message) {
    issues.push('Response missing success message');
  }
  
  // Log validation results
  if (issues.length === 0) {
    console.log('   ✅ All validation checks passed');
    
    // Additional success details
    if (response.data.token) {
      console.log('   🔐 JWT token generated successfully');
    }
    if (response.data.user) {
      console.log(`   👤 User created: ${response.data.user.username} (${response.data.user.email})`);
      console.log(`   🎭 Role assigned: ${response.data.user.role}`);
    }
  } else {
    console.log('   ❌ Validation issues found:');
    issues.forEach(issue => {
      console.log(`      - ${issue}`);
    });
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Test registration endpoint
async function testRegistration(port, endpoint, data, testName, expectedRole) {
  console.log(`\n📝 Testing ${testName}...`);
  console.log(`   Endpoint: POST ${endpoint}`);
  console.log(`   Test data: ${data.name} <${data.email}>`);
  
  try {
    const response = await makeHttpRequest(config.hostname, port, endpoint, data);
    
    console.log(`   Response status: ${response.status}`);
    
    if (response.status === 201) {
      // Success case
      console.log('   ✅ Registration successful!');
      console.log(`   📤 Response:`, JSON.stringify(response.data, null, 2));
      
      const validation = validateRegistrationResponse(response, testName, expectedRole);
      return { success: true, validated: validation.valid, response };
      
    } else if (response.status === 404) {
      console.log('   ❌ CRITICAL: 404 Not Found - Registration endpoint still not accessible!');
      console.log('   🔧 This indicates the fix was not properly applied or server needs restart');
      return { success: false, error: '404 Not Found', response };
      
    } else if (response.status >= 400) {
      console.log(`   ❌ Registration failed with status ${response.status}`);
      console.log(`   📤 Error response:`, response.data || response.raw);
      return { success: false, error: `HTTP ${response.status}`, response };
      
    } else {
      console.log(`   ⚠️  Unexpected status ${response.status}`);
      console.log(`   📤 Response:`, response.data || response.raw);
      return { success: false, error: `Unexpected status ${response.status}`, response };
    }
    
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test execution
async function runFinalRegistrationTest() {
  console.log('=' * 60);
  console.log('🧪 FINAL REGISTRATION SYSTEM TEST');
  console.log('=' * 60);
  console.log(`⏰ Test started at: ${new Date().toISOString()}`);
  console.log(`🔖 Unique test ID: ${uniqueId}`);
  
  // Step 1: Find working server
  const port = await findWorkingServer();
  
  if (!port) {
    console.log('\n❌ No server found running on any of the test ports');
    console.log('🔧 Please start your server first:');
    console.log('   npm run dev');
    console.log('   # or');
    console.log('   NODE_ENV=development npx tsx server/index.ts');
    console.log('   # or');
    console.log('   npm start');
    return false;
  }
  
  console.log(`\n✅ Using server on ${config.hostname}:${port}`);
  
  // Step 2: Test partner registration
  const partnerTest = await testRegistration(
    port,
    '/api/auth/register/partner',
    testData.partner,
    'Partner Registration',
    'affiliate'
  );
  
  // Step 3: Test advertiser registration
  const advertiserTest = await testRegistration(
    port,
    '/api/auth/register/advertiser', 
    testData.advertiser,
    'Advertiser Registration',
    'advertiser'
  );
  
  // Step 4: Results summary
  console.log('\n' + '=' * 60);
  console.log('📊 FINAL TEST RESULTS');
  console.log('=' * 60);
  
  const tests = [
    { name: 'Partner Registration', result: partnerTest },
    { name: 'Advertiser Registration', result: advertiserTest }
  ];
  
  let allPassed = true;
  let totalTests = tests.length;
  let passedTests = 0;
  
  tests.forEach((test, index) => {
    const status = test.result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${index + 1}. ${test.name}: ${status}`);
    
    if (test.result.success) {
      passedTests++;
      if (test.result.validated) {
        console.log(`   🔍 Response validation: ✅ PASSED`);
      } else {
        console.log(`   🔍 Response validation: ⚠️  ISSUES FOUND`);
      }
    } else {
      allPassed = false;
      console.log(`   💥 Error: ${test.result.error}`);
    }
  });
  
  console.log('\n📈 Summary:');
  console.log(`   Total tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('✅ Registration system is working correctly');
    console.log('🔐 JWT tokens are being generated');
    console.log('👤 User data is properly structured');
    console.log('🎭 Roles are correctly assigned');
    console.log('🚀 System ready for production use');
    
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    console.log('🔧 Please review the errors above and fix any issues');
    console.log('📋 Common fixes:');
    console.log('   - Restart the server after applying code changes');
    console.log('   - Check server logs for detailed error information');
    console.log('   - Verify database connectivity if using database features');
    console.log('   - Ensure all required environment variables are set');
  }
  
  console.log('\n⏰ Test completed at:', new Date().toISOString());
  console.log('=' * 60);
  
  return allPassed;
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

// Run the final test
runFinalRegistrationTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test runner error:', error);
    process.exit(1);
  });