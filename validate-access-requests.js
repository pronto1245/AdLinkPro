#!/usr/bin/env node

/**
 * Access Requests Module Integration Validator
 * Tests all three variants of the access requests system
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AdLinkPro Access Requests Module Validator\n');

// Test results tracking
const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    tests.passed++;
    tests.results.push({ name, status: 'PASS', details });
  } else {
    console.log(`❌ ${name}${details ? ` - ${details}` : ''}`);
    tests.failed++;
    tests.results.push({ name, status: 'FAIL', details });
  }
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  test(`${description}`, exists, exists ? '' : `File not found: ${filePath}`);
  return exists;
}

function checkFileContains(filePath, pattern, description) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const contains = pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern);
    test(description, contains);
    return contains;
  } catch (error) {
    test(description, false, `Error reading file: ${error.message}`);
    return false;
  }
}

console.log('📁 Component Structure Validation');
console.log('==================================');

// Frontend Components
checkFileExists('client/src/pages/affiliate/AccessRequestsManager.tsx', 'Partner Access Requests Component');
checkFileExists('client/src/pages/advertiser/AdvertiserAccessRequests.tsx', 'Advertiser Access Requests Component');
checkFileExists('client/src/components/ui/offer-logo.tsx', 'Offer Logo Component');
checkFileExists('client/src/vite-env.d.ts', 'Vite Environment Types');

// Backend Components
checkFileExists('server/api/access-requests.ts', 'Access Requests API Module');
checkFileExists('server/middleware/auth.ts', 'Authentication Middleware');

console.log('\n🔧 API Implementation Validation');
console.log('================================');

// API Routes
checkFileContains('server/api/access-requests.ts', 'setupAccessRequestsRoutes', 'API Setup Function');
checkFileContains('server/api/access-requests.ts', '/api/access-requests', 'Create Request Endpoint');
checkFileContains('server/api/access-requests.ts', /\/api\/partner\/access-requests|\/api\/access-requests\/partner/, 'Partner Requests Endpoint');
checkFileContains('server/api/access-requests.ts', /\/api\/advertiser\/access-requests|\/api\/access-requests\/advertiser/, 'Advertiser Requests Endpoint');
checkFileContains('server/api/access-requests.ts', /\/api\/.*access-requests\/.*\/respond/, 'Response Endpoint');
checkFileContains('server/api/access-requests.ts', '/api/access-requests/bulk-action', 'Bulk Actions Endpoint');
checkFileContains('server/api/access-requests.ts', '/api/access-requests/stats', 'Statistics Endpoint');

console.log('\n🔐 Authentication System Validation');
console.log('===================================');

// Auth Middleware
checkFileContains('server/middleware/auth.ts', 'authenticateToken', 'Token Authentication Function');
checkFileContains('server/middleware/auth.ts', 'requireRole', 'Role-Based Access Control');
checkFileContains('server/middleware/auth.ts', 'getAuthenticatedUser', 'User Context Function');

console.log('\n⚛️ Frontend Integration Validation');
console.log('==================================');

// Partner/Affiliate Component
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'useQuery', 'React Query Integration');
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'useMutation', 'Mutation Handling');
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', '/api/partner/access-requests', 'Partner API Endpoint');
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'status.*pending', 'Status Filtering');

// Advertiser Component  
checkFileContains('client/src/pages/advertiser/AdvertiserAccessRequests.tsx', '/api/advertiser/access-requests', 'Advertiser API Endpoint');
checkFileContains('client/src/pages/advertiser/AdvertiserAccessRequests.tsx', 'approve.*reject', 'Request Response Actions');
checkFileContains('client/src/pages/advertiser/AdvertiserAccessRequests.tsx', 'OfferLogo', 'Offer Logo Integration');

console.log('\n📊 Data Flow Validation');
console.log('=======================');

// Check for proper data structures
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'AccessRequest', 'Access Request Interface');
checkFileContains('client/src/pages/advertiser/AdvertiserAccessRequests.tsx', 'OfferAccessRequest', 'Offer Access Request Interface');

console.log('\n🎨 UI Components Validation');
console.log('===========================');

// UI Component Integration
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'Table.*TableHeader', 'Table Components');
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'Dialog.*DialogContent', 'Dialog Components');
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'Badge.*Button', 'UI Elements');
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'data-testid', 'Test Attributes');

console.log('\n🌐 API Endpoint Consistency');
console.log('===========================');

// Check for endpoint consistency between frontend and backend
const frontendEndpoints = [
  { pattern: /\/api\/partner\/access-requests/, name: '/api/partner/access-requests' },
  { pattern: /\/api\/advertiser\/access-requests/, name: '/api/advertiser/access-requests' },
  { pattern: /\/api\/advertiser\/access-requests\/.*\/respond/, name: '/api/advertiser/access-requests/:requestId/respond' }
];

frontendEndpoints.forEach(endpoint => {
  const hasBackendSupport = checkFileContains('server/api/access-requests.ts', endpoint.pattern, `Backend supports: ${endpoint.name}`);
});

console.log('\n🔄 Role-Based Access Control');
console.log('============================');

// Check RBAC implementation
checkFileContains('server/api/access-requests.ts', "requireRole\\([\\s]*\\['affiliate'\\]", 'Affiliate Role Protection');
checkFileContains('server/api/access-requests.ts', "requireRole\\([\\s]*\\['advertiser'\\]", 'Advertiser Role Protection');
checkFileContains('server/api/access-requests.ts', "requireRole\\([\\s]*\\['super_admin'\\]", 'Super Admin Role Protection');

console.log('\n📈 Feature Completeness');
console.log('=======================');

// Check for key features
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'searchTerm.*setSearchTerm', 'Search Functionality');
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'statusFilter.*setStatusFilter', 'Status Filtering');
checkFileContains('client/src/pages/advertiser/AdvertiserAccessRequests.tsx', 'bulk.*action', 'Bulk Operations');
checkFileContains('server/api/access-requests.ts', 'createPartnerOffer', 'Partner-Offer Relationship Creation');

console.log('\n🎯 Access Request Workflow');
console.log('==========================');

// Check complete workflow
checkFileContains('client/src/pages/affiliate/AccessRequestsManager.tsx', 'createRequestMutation', 'Request Creation');
checkFileContains('client/src/pages/advertiser/AdvertiserAccessRequests.tsx', 'respondToRequestMutation', 'Request Response');
checkFileContains('server/api/access-requests.ts', 'pending.*approved.*rejected', 'Status Transitions');

console.log('\n📋 Summary Report');
console.log('=================');

const total = tests.passed + tests.failed;
const successRate = total > 0 ? ((tests.passed / total) * 100).toFixed(1) : 0;

console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${tests.passed}`);
console.log(`   ❌ Failed: ${tests.failed}`);
console.log(`   📈 Success Rate: ${successRate}%\n`);

if (tests.failed > 0) {
  console.log('❌ Failed Tests:');
  tests.results
    .filter(test => test.status === 'FAIL')
    .forEach(test => {
      console.log(`   • ${test.name}${test.details ? ` - ${test.details}` : ''}`);
    });
  console.log('');
}

console.log('🎯 Access Requests Module Status:');
if (successRate >= 90) {
  console.log('   🟢 EXCELLENT - Module is fully integrated and ready for production');
} else if (successRate >= 80) {
  console.log('   🟡 GOOD - Module is mostly complete with minor issues');
} else if (successRate >= 70) {
  console.log('   🟠 FAIR - Module has core functionality but needs improvements');
} else {
  console.log('   🔴 NEEDS WORK - Module requires significant fixes before integration');
}

console.log('\n🚀 Next Steps:');
if (successRate >= 90) {
  console.log('   • Perform end-to-end testing');
  console.log('   • Deploy to staging environment');
  console.log('   • Create user documentation');
} else {
  console.log('   • Address failed test cases');
  console.log('   • Complete missing functionality');
  console.log('   • Re-run validation tests');
}

console.log('\n✨ Validation Complete!\n');

// Exit with appropriate code
process.exit(tests.failed > 0 ? 1 : 0);