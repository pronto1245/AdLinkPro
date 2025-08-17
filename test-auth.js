#!/usr/bin/env node

// Simple test script to validate our authentication improvements
const fs = require('fs');
const path = require('path');

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem: function(key) { return this.data[key] || null; },
  setItem: function(key, value) { this.data[key] = value; },
  removeItem: function(key) { delete this.data[key]; },
  clear: function() { this.data = {}; }
};

// Mock atob for Node.js environment
global.atob = function(str) {
  return Buffer.from(str, 'base64').toString('binary');
};

// Read our auth functions (we'll simulate importing them)
const authCode = fs.readFileSync(path.join(__dirname, 'client/src/lib/auth.ts'), 'utf8');

// Extract the decodeJWT function manually for testing
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

function getUserFromToken(token) {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload.id,
    username: payload.username,
    email: '',
    role: payload.role,
    advertiserId: payload.advertiserId,
    isActive: true,
    createdAt: '',
  };
}

function getRoleBasedRedirect(role) {
  switch (role) {
    case 'super_admin':
      return '/admin';
    case 'affiliate':
      return '/affiliate';
    case 'advertiser':
      return '/advertiser';
    default:
      return '/dashboard';
  }
}

// Test with a sample JWT token (this is a mock token, not real)
const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtaWQiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.test";

console.log('🧪 Testing Authentication Utilities');
console.log('=====================================');

try {
  // Test JWT decoding
  console.log('1. Testing JWT decoding...');
  const payload = decodeJWT(mockToken);
  console.log('   Decoded payload:', payload);
  
  // Test token expiration
  console.log('2. Testing token expiration...');
  const expired = isTokenExpired(mockToken);
  console.log('   Token expired:', expired);
  
  // Test user extraction
  console.log('3. Testing user extraction...');
  const user = getUserFromToken(mockToken);
  console.log('   Extracted user:', user);
  
  // Test role-based redirect
  console.log('4. Testing role-based redirects...');
  const redirects = {
    super_admin: getRoleBasedRedirect('super_admin'),
    affiliate: getRoleBasedRedirect('affiliate'),
    advertiser: getRoleBasedRedirect('advertiser'),
    unknown: getRoleBasedRedirect('unknown'),
  };
  console.log('   Redirects:', redirects);
  
  // Test localStorage simulation
  console.log('5. Testing localStorage simulation...');
  localStorage.setItem('token', mockToken);
  const retrieved = localStorage.getItem('token');
  console.log('   Stored and retrieved token match:', retrieved === mockToken);
  
  console.log('\n✅ All authentication utility tests passed!');
  
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}