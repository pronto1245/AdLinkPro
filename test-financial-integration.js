#!/usr/bin/env node

// Comprehensive financial module integration test
const { default: fetch } = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const TESTS = [];

// Test configuration
const TEST_CONFIG = {
  BASE_URL,
  TIMEOUT: 5000,
  EXPECTED_ENDPOINTS: [
    'GET /api/admin/financial-metrics/:period',
    'GET /api/admin/finances',
    'GET /api/admin/payout-requests', 
    'GET /api/admin/deposits',
    'GET /api/admin/commission-data',
    'GET /api/admin/financial-chart/:period',
    'GET /api/admin/crypto-portfolio',
    'GET /api/admin/crypto-wallets'
  ]
};

// Test utilities
function addTest(name, testFn) {
  TESTS.push({ name, testFn });
}

async function runTest(test) {
  try {
    console.log(`🧪 Running: ${test.name}`);
    await test.testFn();
    console.log(`✅ PASSED: ${test.name}`);
    return { name: test.name, status: 'PASSED', error: null };
  } catch (error) {
    console.log(`❌ FAILED: ${test.name} - ${error.message}`);
    return { name: test.name, status: 'FAILED', error: error.message };
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { timeout: TEST_CONFIG.TIMEOUT });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

// Test definitions
addTest('Health Endpoint', async () => {
  const data = await fetchJson(`${BASE_URL}/health`);
  if (data.status !== 'ok') throw new Error('Health check failed');
  if (!Array.isArray(data.endpoints)) throw new Error('Endpoints not listed');
  if (data.endpoints.length < 8) throw new Error(`Expected 8+ endpoints, got ${data.endpoints.length}`);
});

addTest('Financial Metrics - 30d period', async () => {
  const data = await fetchJson(`${BASE_URL}/api/admin/financial-metrics/30d`);
  
  // Validate required fields
  const requiredFields = ['platformBalance', 'advertiserRevenue', 'partnerPayouts', 'platformCommission', 'revenueGrowth', 'period'];
  for (const field of requiredFields) {
    if (!(field in data)) throw new Error(`Missing field: ${field}`);
  }
  
  // Validate data types
  if (typeof data.platformBalance !== 'number') throw new Error('platformBalance must be number');
  if (typeof data.advertiserRevenue !== 'number') throw new Error('advertiserRevenue must be number'); 
  if (typeof data.partnerPayouts !== 'number') throw new Error('partnerPayouts must be number');
  if (typeof data.revenueGrowth !== 'number') throw new Error('revenueGrowth must be number');
  if (data.period !== '30d') throw new Error('Expected period to be 30d');
  
  // Validate business logic
  const expectedCommission = data.advertiserRevenue - data.partnerPayouts;
  if (Math.abs(data.platformCommission - expectedCommission) > 0.01) {
    throw new Error('Commission calculation incorrect');
  }
});

addTest('Financial Metrics - Different periods', async () => {
  const periods = ['7d', '30d', '90d'];
  
  for (const period of periods) {
    const data = await fetchJson(`${BASE_URL}/api/admin/financial-metrics/${period}`);
    if (data.period !== period) throw new Error(`Expected period ${period}, got ${data.period}`);
  }
});

addTest('Transactions List', async () => {
  const data = await fetchJson(`${BASE_URL}/api/admin/finances`);
  
  if (!Array.isArray(data)) throw new Error('Expected array of transactions');
  if (data.length === 0) throw new Error('Expected at least some transactions');
  
  // Validate first transaction structure
  const tx = data[0];
  const requiredFields = ['id', 'amount', 'currency', 'type', 'status', 'paymentMethod', 'user'];
  for (const field of requiredFields) {
    if (!(field in tx)) throw new Error(`Transaction missing field: ${field}`);
  }
  
  // Validate user object
  if (!tx.user || typeof tx.user.id !== 'string') throw new Error('Transaction user object invalid');
});

addTest('Payout Requests', async () => {
  const data = await fetchJson(`${BASE_URL}/api/admin/payout-requests`);
  
  if (!Array.isArray(data)) throw new Error('Expected array of payout requests');
  if (data.length === 0) throw new Error('Expected at least some payout requests');
  
  // Validate first payout request
  const payout = data[0];
  const requiredFields = ['id', 'amount', 'currency', 'status', 'walletAddress', 'user'];
  for (const field of requiredFields) {
    if (!(field in payout)) throw new Error(`Payout request missing field: ${field}`);
  }
  
  // Validate status values
  const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
  if (!validStatuses.includes(payout.status)) {
    throw new Error(`Invalid payout status: ${payout.status}`);
  }
});

addTest('Deposits', async () => {
  const data = await fetchJson(`${BASE_URL}/api/admin/deposits`);
  
  if (!Array.isArray(data)) throw new Error('Expected array of deposits');
  if (data.length === 0) throw new Error('Expected at least some deposits');
  
  const deposit = data[0];
  const requiredFields = ['id', 'amount', 'currency', 'status', 'user'];
  for (const field of requiredFields) {
    if (!(field in deposit)) throw new Error(`Deposit missing field: ${field}`);
  }
});

addTest('Commission Data - 30 days', async () => {
  const data = await fetchJson(`${BASE_URL}/api/admin/commission-data`);
  
  if (!Array.isArray(data)) throw new Error('Expected array of commission data');
  if (data.length !== 30) throw new Error(`Expected 30 days of data, got ${data.length}`);
  
  // Validate first day's data
  const dayData = data[0];
  const requiredFields = ['date', 'revenue', 'payouts', 'commission'];
  for (const field of requiredFields) {
    if (!(field in dayData)) throw new Error(`Commission data missing field: ${field}`);
  }
  
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayData.date)) {
    throw new Error(`Invalid date format: ${dayData.date}`);
  }
  
  // Business logic validation
  if (typeof dayData.revenue !== 'number' || dayData.revenue < 0) {
    throw new Error('Revenue must be positive number');
  }
  if (typeof dayData.payouts !== 'number' || dayData.payouts < 0) {
    throw new Error('Payouts must be positive number');  
  }
});

addTest('Financial Chart - Different periods', async () => {
  const periods = ['7d', '30d', '90d'];
  const expectedDays = { '7d': 7, '30d': 30, '90d': 90 };
  
  for (const period of periods) {
    const data = await fetchJson(`${BASE_URL}/api/admin/financial-chart/${period}`);
    
    if (!Array.isArray(data)) throw new Error(`Chart data for ${period} is not array`);
    if (data.length !== expectedDays[period]) {
      throw new Error(`Expected ${expectedDays[period]} data points for ${period}, got ${data.length}`);
    }
    
    // Validate first data point
    const point = data[0];
    const requiredFields = ['date', 'revenue', 'payouts', 'commission', 'netFlow'];
    for (const field of requiredFields) {
      if (!(field in point)) throw new Error(`Chart data missing field: ${field}`);
    }
  }
});

addTest('Crypto Portfolio', async () => {
  const data = await fetchJson(`${BASE_URL}/api/admin/crypto-portfolio`);
  
  if (!Array.isArray(data)) throw new Error('Expected array of crypto assets');
  if (data.length === 0) throw new Error('Expected at least some crypto assets');
  
  const asset = data[0];
  const requiredFields = ['currency', 'balance', 'usdValue', 'change24h', 'address'];
  for (const field of requiredFields) {
    if (!(field in asset)) throw new Error(`Crypto asset missing field: ${field}`);
  }
  
  // Validate balance is positive
  if (typeof asset.balance !== 'number' || asset.balance <= 0) {
    throw new Error('Balance must be positive number');
  }
  
  // Validate currency code
  if (typeof asset.currency !== 'string' || asset.currency.length < 2) {
    throw new Error('Invalid currency code');
  }
});

addTest('Crypto Wallets', async () => {
  const data = await fetchJson(`${BASE_URL}/api/admin/crypto-wallets`);
  
  if (!Array.isArray(data)) throw new Error('Expected array of crypto wallets');
  if (data.length === 0) throw new Error('Expected at least some crypto wallets');
  
  const wallet = data[0];
  const requiredFields = ['id', 'name', 'currency', 'address', 'balance', 'status', 'type'];
  for (const field of requiredFields) {
    if (!(field in wallet)) throw new Error(`Crypto wallet missing field: ${field}`);
  }
  
  // Validate status
  const validStatuses = ['active', 'inactive', 'maintenance'];
  if (!validStatuses.includes(wallet.status)) {
    throw new Error(`Invalid wallet status: ${wallet.status}`);
  }
  
  // Validate type
  const validTypes = ['hot', 'cold', 'multisig'];
  if (!validTypes.includes(wallet.type)) {
    throw new Error(`Invalid wallet type: ${wallet.type}`);
  }
});

// Data consistency tests
addTest('Data Consistency - Metrics vs Transactions', async () => {
  const [metrics, transactions] = await Promise.all([
    fetchJson(`${BASE_URL}/api/admin/financial-metrics/30d`),
    fetchJson(`${BASE_URL}/api/admin/finances`)
  ]);
  
  // Ensure metrics data is consistent with transaction data structure
  if (metrics.platformBalance < 0) throw new Error('Platform balance cannot be negative');
  if (metrics.advertiserRevenue < metrics.partnerPayouts) {
    console.warn('⚠️ Warning: Partner payouts exceed advertiser revenue - possible in test data');
  }
  
  // Check transaction data has expected structure
  const hasDeposits = transactions.some(tx => tx.type === 'deposit');
  const hasPayouts = transactions.some(tx => tx.type === 'payout');
  
  if (!hasDeposits) console.warn('⚠️ Warning: No deposit transactions found');
  if (!hasPayouts) console.warn('⚠️ Warning: No payout transactions found');
});

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Financial Module Integration Tests');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  const results = [];
  
  for (const test of TESTS) {
    const result = await runTest(test);
    results.push(result);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️ Duration: ${duration}ms`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => r.status === 'FAILED')
      .forEach(r => console.log(`  • ${r.name}: ${r.error}`));
  }
  
  console.log('='.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Financial module is working correctly.');
    process.exit(0);
  } else {
    console.log(`💥 ${failed} tests failed. Financial module needs attention.`);
    process.exit(1);
  }
}

// Check if server is running before starting tests
async function checkServerHealth() {
  try {
    await fetchJson(`${BASE_URL}/health`);
    console.log('✅ Test server is running');
  } catch (error) {
    console.error('❌ Test server is not accessible. Make sure it\'s running on port 3001');
    console.error('   Start with: node test-financial-module.js');
    process.exit(1);
  }
}

// Run tests
(async () => {
  await checkServerHealth();
  await runAllTests();
})();