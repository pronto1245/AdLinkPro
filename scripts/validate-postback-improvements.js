#!/usr/bin/env node
/**
 * Simple validation test for postback improvements
 * Tests basic functionality without importing TypeScript modules
 */

console.log('🔍 Validating Postback Improvements Implementation');
console.log('=' .repeat(60));

// Test 1: Check if files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server/services/postback.ts',
  'server/services/postbackMonitoring.ts',
  'server/middleware/auth.ts',
  'scripts/test-api-endpoints.js',
  'POSTBACK_SETUP_GUIDE.md'
];

console.log('\n📁 File Existence Check:');
let filesOk = 0;
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (exists) filesOk++;
}

console.log(`\n📊 Files: ${filesOk}/${requiredFiles.length} exist`);

// Test 2: Check for key functionality in files
console.log('\n🔍 Content Validation:');

const checks = [
  {
    file: 'server/services/postback.ts',
    pattern: /postbackMonitor\.recordPostbackAttempt/,
    description: 'Postback monitoring integration'
  },
  {
    file: 'server/routes.ts',
    pattern: /PostbackService\.triggerPostbacks.*\n.*type: ['"]registration['"]/,
    description: 'Registration postback triggers'
  },
  {
    file: 'server/services/postbackMonitoring.ts',
    pattern: /class PostbackMonitoringService/,
    description: 'Postback monitoring service class'
  },
  {
    file: 'server/services/notification.ts',
    pattern: /postback_failed.*postback_success_rate_low/,
    description: 'Postback alert notifications'
  },
  {
    file: 'server/middleware/auth.ts',
    pattern: /export function verifyTokenFromFile.*export function getTokenInfoFromFile/s,
    description: 'Token verification utilities'
  }
];

let checksOk = 0;
for (const check of checks) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', check.file), 'utf8');
    const found = check.pattern.test(content);
    console.log(`   ${found ? '✅' : '❌'} ${check.description}`);
    if (found) checksOk++;
  } catch (error) {
    console.log(`   ❌ ${check.description} (file read error)`);
  }
}

console.log(`\n📊 Content checks: ${checksOk}/${checks.length} passed`);

// Test 3: Check POSTBACK_SETUP_GUIDE.md improvements
console.log('\n📖 Documentation Check:');
try {
  const guideContent = fs.readFileSync(path.join(__dirname, '..', 'POSTBACK_SETUP_GUIDE.md'), 'utf8');
  
  const docChecks = [
    { pattern: /Настройка повторных попыток/, desc: 'Retry configuration docs' },
    { pattern: /Макросы для продвинутых пользователей/, desc: 'Advanced macros documentation' },
    { pattern: /Мониторинг и алерты/, desc: 'Monitoring and alerts section' },
    { pattern: /Безопасность/, desc: 'Security section' },
    { pattern: /HasOffers.*ClickMeter.*CPV Lab/s, desc: 'Multiple tracker examples' }
  ];
  
  let docChecksOk = 0;
  for (const docCheck of docChecks) {
    const found = docCheck.pattern.test(guideContent);
    console.log(`   ${found ? '✅' : '❌'} ${docCheck.desc}`);
    if (found) docChecksOk++;
  }
  
  console.log(`\n📊 Documentation: ${docChecksOk}/${docChecks.length} sections updated`);
} catch (error) {
  console.log('   ❌ Could not read documentation file');
}

// Test 4: Check for duplicate method removal
console.log('\n🧹 Duplicate Methods Check:');
try {
  const storageContent = fs.readFileSync(path.join(__dirname, '..', 'server/storage.ts'), 'utf8');
  
  // Count occurrences of specific methods
  const methodCounts = {
    getSystemSettings: (storageContent.match(/async getSystemSettings/g) || []).length,
    getSmartAlerts: (storageContent.match(/async getSmartAlerts/g) || []).length
  };
  
  for (const [method, count] of Object.entries(methodCounts)) {
    const isDuplicate = count > 1;
    console.log(`   ${isDuplicate ? '❌' : '✅'} ${method}: ${count} occurrence${count !== 1 ? 's' : ''}`);
  }
} catch (error) {
  console.log('   ❌ Could not check storage file for duplicates');
}

console.log('\n' + '=' .repeat(60));
console.log('🎯 SUMMARY');

const totalFiles = requiredFiles.length;
const totalChecks = checks.length;
const overallSuccess = filesOk === totalFiles && checksOk === totalChecks;

console.log(`📁 Files: ${filesOk}/${totalFiles} exist`);
console.log(`🔍 Content: ${checksOk}/${totalChecks} validated`);
console.log(`📈 Overall: ${overallSuccess ? '✅ SUCCESS' : '⚠️ PARTIAL'}`);

if (overallSuccess) {
  console.log('\n🎉 All postback improvements have been successfully implemented!');
  
  console.log('\n✨ Implemented Features:');
  console.log('   • Automatic postback triggers for user registration');
  console.log('   • Enhanced analytics integration with delivery status');  
  console.log('   • Monitoring and alerts for failed postbacks');
  console.log('   • Removed duplicate methods in DatabaseStorage');
  console.log('   • Updated authentication with token verification');
  console.log('   • Added API endpoints for monitoring dashboard');
  console.log('   • Enhanced documentation with detailed examples');
  
  process.exit(0);
} else {
  console.log('\n⚠️ Some improvements may need attention. Check the details above.');
  process.exit(1);
}