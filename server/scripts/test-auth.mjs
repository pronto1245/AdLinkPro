#!/usr/bin/env node

/**
 * Test script to verify authentication for user 9791207@gmail.com
 */

import fetch from 'node-fetch';
import { config } from '../config/environment.js';

const BASE_URL = `http://localhost:${config.PORT || 5000}`;

async function testAuth() {
  console.log('🧪 [TEST] Starting authentication tests...\n');
  
  try {
    // Test 1: Check if user exists
    console.log('🔍 [TEST] Checking if user exists...');
    const checkUserResponse = await fetch(`${BASE_URL}/api/auth/fixed/check-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '9791207@gmail.com'
      })
    });
    
    const checkUserResult = await checkUserResponse.json();
    console.log('📋 [TEST] User check result:', checkUserResult);
    
    if (!checkUserResult.exists) {
      console.log('❌ [TEST] User does not exist in database');
      console.log('💡 [TEST] Please run the ensure-user script first');
      return;
    }
    
    // Test 2: Try to login with correct password
    console.log('\n🔐 [TEST] Testing login with correct password...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/fixed/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '9791207@gmail.com',
        password: process.env.OWNER_PASSWORD || 'owner123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('📋 [TEST] Login result:', {
      status: loginResponse.status,
      success: loginResponse.ok,
      hasToken: !!loginResult.token,
      user: loginResult.user,
      error: loginResult.error
    });
    
    if (loginResponse.ok && loginResult.token) {
      console.log('✅ [TEST] Login successful!');
      
      // Test 3: Verify JWT token
      console.log('\n🔍 [TEST] Testing JWT token validation...');
      const meResponse = await fetch(`${BASE_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${loginResult.token}`,
        }
      });
      
      const meResult = await meResponse.json();
      console.log('📋 [TEST] /api/me result:', {
        status: meResponse.status,
        user: meResult
      });
      
      if (meResponse.ok) {
        console.log('✅ [TEST] JWT token validation successful!');
      } else {
        console.log('❌ [TEST] JWT token validation failed');
      }
    } else {
      console.log('❌ [TEST] Login failed:', loginResult.error);
    }
    
    // Test 4: Try login with wrong password
    console.log('\n🔐 [TEST] Testing login with wrong password...');
    const wrongPasswordResponse = await fetch(`${BASE_URL}/api/auth/fixed/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '9791207@gmail.com',
        password: 'wrongpassword'
      })
    });
    
    const wrongPasswordResult = await wrongPasswordResponse.json();
    console.log('📋 [TEST] Wrong password result:', {
      status: wrongPasswordResponse.status,
      shouldBe401: wrongPasswordResponse.status === 401,
      error: wrongPasswordResult.error
    });
    
    if (wrongPasswordResponse.status === 401) {
      console.log('✅ [TEST] Wrong password correctly rejected');
    } else {
      console.log('❌ [TEST] Wrong password should be rejected with 401');
    }
    
    console.log('\n🎉 [TEST] Authentication tests completed!');
    
  } catch (error) {
    console.error('💥 [TEST] Test error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 [TEST] Server is not running. Please start the server first with: npm run dev');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuth().catch(console.error);
}

export { testAuth };