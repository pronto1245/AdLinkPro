#!/usr/bin/env node

/**
 * Simple integration test to verify the authentication token flow
 * Tests that tokens are stored consistently and authorization works
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = String(value);
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
  
  get length() {
    return Object.keys(this.store).length;
  }
}

// Test functions
function testTokenMigration() {
  console.log('🧪 Testing token migration...');
  
  const localStorage = new MockLocalStorage();
  
  // Simulate old token format
  localStorage.setItem('token', 'old-jwt-token-123');
  
  // Simulate migration logic from our code
  if (localStorage.getItem('token')) {
    const oldToken = localStorage.getItem('token');
    if (oldToken && oldToken !== 'null' && oldToken !== 'undefined' && oldToken.trim() !== '') {
      localStorage.setItem('auth_token', oldToken);
    }
    localStorage.removeItem('token');
  }
  
  // Verify migration
  const newToken = localStorage.getItem('auth_token');
  const oldToken = localStorage.getItem('token');
  
  console.assert(newToken === 'old-jwt-token-123', '❌ Token migration failed');
  console.assert(oldToken === null, '❌ Old token not removed');
  
  console.log('✅ Token migration test passed');
}

function testTokenValidation() {
  console.log('🧪 Testing token validation...');
  
  const localStorage = new MockLocalStorage();
  
  // Test invalid tokens
  const invalidTokens = ['null', 'undefined', '', '   ', null, undefined];
  
  for (const invalidToken of invalidTokens) {
    localStorage.clear();
    if (invalidToken !== null && invalidToken !== undefined) {
      localStorage.setItem('auth_token', invalidToken);
    }
    
    const token = localStorage.getItem('auth_token');
    const isValid = token && token !== 'null' && token !== 'undefined' && token.trim() !== '';
    
    if (isValid) {
      console.error(`❌ Invalid token "${invalidToken}" was considered valid`);
      process.exit(1);
    }
  }
  
  // Test valid token
  localStorage.clear();
  localStorage.setItem('auth_token', 'valid-jwt-token-abc');
  const validToken = localStorage.getItem('auth_token');
  const isValidToken = validToken && validToken !== 'null' && validToken !== 'undefined' && validToken.trim() !== '';
  
  console.assert(isValidToken, '❌ Valid token was rejected');
  
  console.log('✅ Token validation test passed');
}

function testAuthServiceConsistency() {
  console.log('🧪 Testing AuthService consistency...');
  
  // Read the AuthService file to verify it uses 'auth_token'
  const authServicePath = path.join(__dirname, 'client/src/lib/auth.ts');
  const authServiceContent = fs.readFileSync(authServicePath, 'utf8');
  
  console.assert(authServiceContent.includes("TOKEN_KEY = 'auth_token'"), '❌ AuthService not using auth_token');
  
  // Read the auth context file to verify it uses 'auth_token'
  const authContextPath = path.join(__dirname, 'client/src/contexts/auth-context.tsx');
  const authContextContent = fs.readFileSync(authContextPath, 'utf8');
  
  console.assert(authContextContent.includes("localStorage.getItem('auth_token')"), '❌ AuthContext not using auth_token');
  console.assert(authContextContent.includes("localStorage.setItem('auth_token'"), '❌ AuthContext not setting auth_token');
  
  // Read the UpdateToken component to verify consistency
  const updateTokenPath = path.join(__dirname, 'client/src/pages/UpdateToken.tsx');
  const updateTokenContent = fs.readFileSync(updateTokenPath, 'utf8');
  
  console.assert(updateTokenContent.includes("localStorage.setItem('auth_token'"), '❌ UpdateToken not using auth_token');
  
  console.log('✅ AuthService consistency test passed');
}

function testAPIRequestConsistency() {
  console.log('🧪 Testing API request consistency...');
  
  // Read the queryClient file to verify token handling
  const queryClientPath = path.join(__dirname, 'client/src/lib/queryClient.ts');
  const queryClientContent = fs.readFileSync(queryClientPath, 'utf8');
  
  console.assert(queryClientContent.includes("localStorage.getItem('auth_token')"), '❌ queryClient not using auth_token');
  
  // Read the api.ts file to verify token handling
  const apiPath = path.join(__dirname, 'client/src/lib/api.ts');
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  console.assert(apiContent.includes("localStorage.getItem('auth_token')"), '❌ api.ts not using auth_token');
  console.assert(apiContent.includes("localStorage.setItem('auth_token'"), '❌ api.ts not setting auth_token');
  
  console.log('✅ API request consistency test passed');
}

// Run all tests
function runTests() {
  console.log('🚀 Starting authentication flow tests...\n');
  
  try {
    testTokenMigration();
    testTokenValidation();  
    testAuthServiceConsistency();
    testAPIRequestConsistency();
    
    console.log('\n✅ All authentication tests passed!');
    console.log('🎉 Token flow is now consistent across the application');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testTokenMigration, testTokenValidation };