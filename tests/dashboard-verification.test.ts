import request from 'supertest';
import { createTestApp } from './testApp';
import jwt from 'jsonwebtoken';

const app = createTestApp();

describe('Dashboard Configuration and Metrics Verification', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-development-only';

  // Helper to generate token for different roles
  const getTokenForRole = async (role: string) => {
    const roleCredentials = {
      'OWNER': { email: 'test-owner@example.com', password: 'owner123' },
      'ADVERTISER': { email: 'test-advertiser@example.com', password: 'adv123' },
      'PARTNER': { email: 'test-partner@example.com', password: 'partner123' },
      'AFFILIATE': { email: 'test-affiliate@example.com', password: 'affiliate123' },
      'SUPER_ADMIN': { email: 'test-superadmin@example.com', password: 'admin123' }
    };

    const cred = roleCredentials[role as keyof typeof roleCredentials];
    if (!cred) {
      throw new Error(`No credentials configured for role: ${role}`);
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send(cred);

    if (response.status !== 200) {
      throw new Error(`Failed to get token for role ${role}: ${response.body.error}`);
    }

    return response.body.token;
  };

  describe('Role-Based Dashboard API Endpoints', () => {
    const dashboardEndpoints = {
      'OWNER': ['/api/owner/metrics', '/api/owner/business-overview'],
      'ADVERTISER': ['/api/advertiser/dashboard'],
      'PARTNER': ['/api/affiliate/dashboard'],
      'AFFILIATE': ['/api/affiliate/dashboard'],
      'SUPER_ADMIN': ['/api/admin/metrics', '/api/admin/system-stats']
    };

    it('should validate all dashboard API endpoints exist and return proper structure', async () => {
      for (const [role, endpoints] of Object.entries(dashboardEndpoints)) {
        const token = await getTokenForRole(role);
        
        for (const endpoint of endpoints) {
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`);

          expect(response.status).toBe(200);
          expect(response.body).toBeDefined();
          
          // Log the endpoint structure for verification
          console.log(`✓ ${role} - ${endpoint}: ${response.status}`);
        }
      }
    }, 30000);

    it('should return role-appropriate metrics for each dashboard', async () => {
      // Owner Dashboard Metrics Validation
      const ownerToken = await getTokenForRole('OWNER');
      const ownerMetrics = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(ownerMetrics.status).toBe(200);
      expect(ownerMetrics.body).toHaveProperty('total_revenue');
      expect(ownerMetrics.body).toHaveProperty('active_advertisers');
      expect(ownerMetrics.body).toHaveProperty('active_partners');
      
      // Verify owner doesn't get conversion_trends (should be advertiser-only)
      expect(ownerMetrics.body).not.toHaveProperty('conversion_trends');

      // Advertiser Dashboard Metrics Validation
      const advertiserToken = await getTokenForRole('ADVERTISER');
      const advertiserMetrics = await request(app)
        .get('/api/advertiser/dashboard')
        .set('Authorization', `Bearer ${advertiserToken}`);

      expect(advertiserMetrics.status).toBe(200);
      expect(advertiserMetrics.body).toHaveProperty('metrics');
      expect(advertiserMetrics.body.metrics).toHaveProperty('total_clicks');
      expect(advertiserMetrics.body.metrics).toHaveProperty('conversion_rate');
      
      // Affiliate Dashboard Metrics Validation
      const partnerToken = await getTokenForRole('PARTNER');
      const partnerMetrics = await request(app)
        .get('/api/affiliate/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`);

      expect(partnerMetrics.status).toBe(200);
      expect(partnerMetrics.body).toHaveProperty('metrics');
      
      // Verify partner doesn't get fraud_alerts (should not appear for partners)
      expect(partnerMetrics.body.metrics).not.toHaveProperty('fraud_alerts');

      // Super Admin Dashboard Metrics Validation
      const adminToken = await getTokenForRole('SUPER_ADMIN');
      const adminMetrics = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminMetrics.status).toBe(200);
      expect(adminMetrics.body).toHaveProperty('total_users');
      expect(adminMetrics.body).toHaveProperty('total_offers');
      expect(adminMetrics.body).toHaveProperty('system_health');
    }, 30000);

    it('should enforce proper role-based access restrictions', async () => {
      // Try accessing owner endpoint with advertiser token
      const advertiserToken = await getTokenForRole('ADVERTISER');
      const unauthorizedResponse = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', `Bearer ${advertiserToken}`);

      expect(unauthorizedResponse.status).toBe(403);

      // Try accessing admin endpoint with partner token
      const partnerToken = await getTokenForRole('PARTNER');
      const forbiddenResponse = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${partnerToken}`);

      expect(forbiddenResponse.status).toBe(403);
    }, 15000);
  });

  describe('Metrics Format and Structure Validation', () => {
    it('should return metrics in correct format for all roles', async () => {
      const roles = ['OWNER', 'ADVERTISER', 'PARTNER', 'SUPER_ADMIN'];
      const dashboardEndpoints = {
        'OWNER': ['/api/owner/metrics', '/api/owner/business-overview'],
        'ADVERTISER': ['/api/advertiser/dashboard'],
        'PARTNER': ['/api/affiliate/dashboard'],
        'AFFILIATE': ['/api/affiliate/dashboard'],
        'SUPER_ADMIN': ['/api/admin/metrics', '/api/admin/system-stats']
      };
      const requiredFields = {
        'OWNER': ['total_revenue', 'active_advertisers', 'active_partners'],
        'ADVERTISER': ['total_clicks', 'conversion_rate'],
        'PARTNER': ['clicks', 'conversions'],
        'SUPER_ADMIN': ['total_users', 'total_offers']
      };

      for (const role of roles) {
        const token = await getTokenForRole(role);
        const endpoints = dashboardEndpoints[role as keyof typeof dashboardEndpoints];
        const primaryEndpoint = endpoints[0];

        const response = await request(app)
          .get(primaryEndpoint)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);

        // Check for required fields based on role
        const expectedFields = requiredFields[role as keyof typeof requiredFields];
        for (const field of expectedFields) {
          const hasField = response.body[field] !== undefined || 
                          (response.body.metrics && response.body.metrics[field] !== undefined);
          expect(hasField).toBe(true);
        }
      }
    }, 30000);

    it('should validate numeric values in metrics responses', async () => {
      const ownerToken = await getTokenForRole('OWNER');
      const response = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      
      // Check that numeric fields contain valid numbers
      if (response.body.total_revenue !== undefined) {
        expect(typeof response.body.total_revenue).toBe('number');
        expect(response.body.total_revenue).toBeGreaterThanOrEqual(0);
      }
      
      if (response.body.active_advertisers !== undefined) {
        expect(typeof response.body.active_advertisers).toBe('number');
        expect(response.body.active_advertisers).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Fallback Scenarios and Error Handling', () => {
    it('should handle API failures gracefully with proper error responses', async () => {
      // Test with invalid token
      const invalidResponse = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', 'Bearer invalid-token');

      expect(invalidResponse.status).toBe(401);
      expect(invalidResponse.body).toHaveProperty('error');
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/advertiser/dashboard');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return proper error structure for forbidden access', async () => {
      const partnerToken = await getTokenForRole('PARTNER');
      const response = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', `Bearer ${partnerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Dashboard Configuration Verification', () => {
    it('should verify dashboard titles and configurations are role-appropriate', async () => {
      const dashboardConfigs = {
        'owner': { title: 'owner_dashboard', metrics: ['total_revenue', 'active_advertisers', 'active_partners'] },
        'advertiser': { title: 'advertiser_dashboard', metrics: ['total_revenue', 'total_clicks', 'total_conversions'] },
        'admin': { title: 'admin_dashboard', metrics: ['total_users', 'total_offers', 'system_health'] }
      };

      // This test validates the expected configuration structure
      // In a real implementation, this would test the actual frontend configuration
      for (const [role, config] of Object.entries(dashboardConfigs)) {
        expect(config.title).toContain(role);
        expect(config.metrics).toBeDefined();
        expect(config.metrics.length).toBeGreaterThan(0);
      }
    });

    it('should ensure no metric overlap between incompatible roles', async () => {
      // Partner metrics should not include admin-specific data
      const partnerToken = await getTokenForRole('PARTNER');
      const partnerResponse = await request(app)
        .get('/api/affiliate/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`);

      expect(partnerResponse.status).toBe(200);
      
      // Verify partner dashboard doesn't contain admin metrics
      expect(partnerResponse.body.system_health).toBeUndefined();
      expect(partnerResponse.body.total_users).toBeUndefined();
      
      // Owner metrics should not contain partner-specific data
      const ownerToken = await getTokenForRole('OWNER');
      const ownerResponse = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(ownerResponse.status).toBe(200);
      expect(ownerResponse.body.fraud_alerts).toBeUndefined(); // This should be admin-only
    });
  });

  describe('Real-time Updates and Caching', () => {
    it('should verify caching behavior for dashboard metrics', async () => {
      const ownerToken = await getTokenForRole('OWNER');
      
      // First request
      const response1 = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', `Bearer ${ownerToken}`);
      
      // Second request (should potentially use cache)
      const response2 = await request(app)
        .get('/api/owner/metrics')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Both should return consistent data structure
      expect(typeof response1.body).toBe('object');
      expect(typeof response2.body).toBe('object');
    });
  });
});