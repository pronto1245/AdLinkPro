#!/usr/bin/env tsx
/**
 * Manual test script for the new email service
 * Usage: npx tsx tests/manual/test-email-service.mts
 */

import { sendEmail } from '../../src/services/email';

async function testEmailService() {
  console.log('🧪 Testing Email Service');
  console.log('========================');

  // Test 1: Without SENDGRID_API_KEY (should skip)
  console.log('\n1. Testing without SENDGRID_API_KEY...');
  delete process.env.SENDGRID_API_KEY;
  
  const result1 = await sendEmail(
    'test@example.com',
    'Test Subject Without API Key',
    '<h1>This should be skipped</h1>'
  );
  
  console.log('Result:', result1);
  console.log('Expected: { ok: true, skipped: true }');
  console.log('✅ Test 1 passed:', result1.ok && result1.skipped);

  // Test 2: With invalid parameters
  console.log('\n2. Testing with missing parameters...');
  process.env.SENDGRID_API_KEY = 'fake-key-for-testing';
  
  const result2 = await sendEmail('', 'Subject', '<h1>HTML</h1>');
  
  console.log('Result:', result2);
  console.log('Expected: { ok: false }');
  console.log('✅ Test 2 passed:', !result2.ok);

  // Test 3: With all valid parameters (but fake API key, so it will fail)
  console.log('\n3. Testing with valid parameters but fake API key...');
  
  const result3 = await sendEmail(
    'test@example.com',
    'Test Subject',
    '<h1>Hello World</h1><p>This is a test email.</p>'
  );
  
  console.log('Result:', result3);
  console.log('Expected: { ok: false } (because API key is fake)');
  console.log('✅ Test 3 passed:', !result3.ok);

  console.log('\n🎉 All manual tests completed!');
  console.log('\nNOTE: To test with real SendGrid, set a valid SENDGRID_API_KEY in your environment.');
}

// Run tests
testEmailService().catch(console.error);