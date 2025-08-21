#!/usr/bin/env node

/**
 * Simple API test script to validate the enhanced backend functionality
 * Tests key endpoints without requiring a database connection
 */

const apiBase = process.env.API_BASE || 'http://localhost:5000';

// Test cases
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    url: '/api/health',
    expected: 200
  },
  {
    name: 'Admin Routes Available (should require auth)',
    method: 'GET', 
    url: '/api/admin/auth/me',
    expected: 401 // Should require authentication
  },
  {
    name: 'Invalid Endpoint',
    method: 'GET',
    url: '/api/invalid-endpoint',
    expected: 404
  }
];

async function runTest(test) {
  try {
    const response = await fetch(`${apiBase}${test.url}`, {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const success = response.status === test.expected;
    console.log(`${success ? '✅' : '❌'} ${test.name}: ${response.status} (expected ${test.expected})`);
    
    return success;
  } catch (error) {
    console.log(`❌ ${test.name}: Error - ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Testing Enhanced Backend API...\n');
  
  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await runTest(test);
    if (result) passed++;
  }

  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is ready.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the server logs.');
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

export { runAllTests };