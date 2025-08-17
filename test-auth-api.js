#!/usr/bin/env node

// Test script to validate authentication flow without needing browser
const https = require('https');
const http = require('http');

console.log('🧪 Testing AdLinkPro Authentication Flow');
console.log('==========================================');

// Test 1: JWT Utility Functions
console.log('\n1. Testing JWT Utilities...');

// Mock atob for Node.js
global.atob = function(str) {
  return Buffer.from(str, 'base64').toString('binary');
};

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

// Test JWT with mock token
const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtaWQiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.test";
const payload = decodeJWT(mockToken);
console.log('✅ JWT Decoded:', JSON.stringify(payload, null, 2));

// Test redirects
const roles = ['super_admin', 'affiliate', 'advertiser', 'unknown'];
console.log('✅ Role-based redirects:');
roles.forEach(role => {
  console.log(`   ${role}: ${getRoleBasedRedirect(role)}`);
});

// Test 2: Login API Test
console.log('\n2. Testing Login API...');

function testLoginAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'superadmin',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Login API Success:');
            console.log('   Status:', res.statusCode);
            console.log('   Token received:', !!response.token);
            console.log('   User data:', JSON.stringify(response.user, null, 2));
            
            if (response.token) {
              const tokenPayload = decodeJWT(response.token);
              if (tokenPayload) {
                const redirectPath = getRoleBasedRedirect(tokenPayload.role);
                console.log('   Role-based redirect:', redirectPath);
              }
            }
          } else {
            console.log('❌ Login API Failed:');
            console.log('   Status:', res.statusCode);
            console.log('   Response:', data);
          }
          resolve(response);
        } catch (error) {
          console.log('❌ Login API Error parsing response:', error.message);
          console.log('   Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Login API Request Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Check Server Status
console.log('\n3. Checking server status...');

function checkServerStatus() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'GET'
    }, (res) => {
      console.log('✅ Server responding on port 5000');
      console.log('   Status for GET /api/auth/login:', res.statusCode);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log('❌ Server not responding:', error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Server response timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  const serverOnline = await checkServerStatus();
  
  if (serverOnline) {
    try {
      await testLoginAPI();
    } catch (error) {
      console.log('Test completed with errors');
    }
  }
  
  console.log('\n🏁 Authentication tests completed!');
}

runTests();