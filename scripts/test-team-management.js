#!/usr/bin/env node

/**
 * Team Management API Testing Script
 * Validates all team management endpoints and functionality
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const TEAM_ENDPOINTS = [
  {
    name: 'Affiliate Team List',
    method: 'GET',
    url: '/api/affiliate/team',
    description: 'Get list of affiliate team members'
  },
  {
    name: 'Advertiser Team List',
    method: 'GET',
    url: '/api/advertiser/team/members',
    description: 'Get list of advertiser team members'
  },
  {
    name: 'Team Activity Logs',
    method: 'GET',
    url: '/api/advertiser/team/activity-logs',
    description: 'Get team activity logs for advertiser'
  },
  {
    name: 'Create Affiliate Team Member',
    method: 'POST',
    url: '/api/affiliate/team',
    description: 'Create new affiliate team member',
    body: {
      email: 'test@example.com',
      username: 'test_user',
      password: 'password123',
      role: 'buyer',
      permissions: ['view_offers', 'generate_links'],
      subIdPrefix: 'test1'
    }
  },
  {
    name: 'Create Advertiser Team Member',
    method: 'POST',
    url: '/api/advertiser/team/members',
    description: 'Create new advertiser team member',
    body: {
      username: 'test_manager',
      email: 'manager@example.com',
      firstName: 'Test',
      lastName: 'Manager',
      role: 'manager',
      permissions: {
        manageOffers: true,
        viewStatistics: true,
        managePartners: false,
        financialOperations: false,
        postbacksApi: false
      },
      restrictions: {
        ipWhitelist: [],
        geoRestrictions: [],
        timeRestrictions: {
          enabled: false,
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'UTC',
          workingDays: [1, 2, 3, 4, 5]
        }
      },
      telegramNotifications: false
    }
  }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\\n🧪 Testing: ${endpoint.name}`);
    console.log(`   ${endpoint.method} ${endpoint.url}`);
    console.log(`   Description: ${endpoint.description}`);

    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (endpoint.body && (endpoint.method === 'POST' || endpoint.method === 'PATCH')) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint.url}`, options);
    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`   Status: ${status} ${statusText}`);
    
    if (status >= 200 && status < 300) {
      console.log('   ✅ SUCCESS');
      try {
        const data = await response.json();
        
        // Validate response structure based on endpoint type
        if (endpoint.url.includes('team') && Array.isArray(data)) {
          console.log(`   📊 Returned ${data.length} team members`);
          if (data.length > 0) {
            const member = data[0];
            console.log(`   👤 Sample member: ${member.username} (${member.role})`);
          }
        } else if (endpoint.url.includes('activity-logs')) {
          console.log(`   📋 Returned ${data.length} activity logs`);
          if (data.length > 0) {
            const log = data[0];
            console.log(`   📝 Sample log: ${log.action} by ${log.username}`);
          }
        } else if (endpoint.method === 'POST') {
          console.log(`   🆕 Created: ${data.username} (${data.role})`);
          if (data.id) {
            console.log(`   🆔 ID: ${data.id}`);
          }
        }
      } catch (e) {
        console.log('   Response: Non-JSON or parsing error');
      }
    } else {
      console.log('   ❌ FAILED');
      try {
        const errorData = await response.text();
        console.log('   Error:', errorData.substring(0, 100) + '...');
      } catch (e) {
        console.log('   Error: Unable to read response');
      }
    }

    return status >= 200 && status < 300;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testTeamManagementIntegration() {
  console.log('🚀 Starting Team Management Integration Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  let passedTests = 0;
  let totalTests = TEAM_ENDPOINTS.length;

  for (const endpoint of TEAM_ENDPOINTS) {
    const success = await testEndpoint(endpoint);
    if (success) passedTests++;
  }

  console.log('\\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);
  console.log(`✅ Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\\n🎉 All team management tests passed!');
    console.log('✨ Backend integration is working correctly');
    process.exit(0);
  } else {
    console.log('\\n⚠️ Some tests failed. Check the logs above for details.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testTeamManagementIntegration().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { testTeamManagementIntegration, testEndpoint };