/**
 * Frontend routing and role normalization tests
 */

import { routeByRole } from '../client/src/utils/routeByRole';

describe('Frontend Routing Tests', () => {
  it('should route PARTNER role correctly', () => {
    expect(routeByRole('PARTNER')).toBe('/dashboard/partner');
    expect(routeByRole('partner')).toBe('/dashboard/partner');
    expect(routeByRole('Partner')).toBe('/dashboard/partner');
  });

  it('should route ADVERTISER role correctly', () => {
    expect(routeByRole('ADVERTISER')).toBe('/dashboard/advertiser');
    expect(routeByRole('advertiser')).toBe('/dashboard/advertiser');
    expect(routeByRole('Advertiser')).toBe('/dashboard/advertiser');
  });

  it('should route OWNER role correctly', () => {
    expect(routeByRole('OWNER')).toBe('/dashboard/owner');
    expect(routeByRole('owner')).toBe('/dashboard/owner');
    expect(routeByRole('Owner')).toBe('/dashboard/owner');
  });

  it('should route SUPER_ADMIN role correctly', () => {
    expect(routeByRole('SUPER_ADMIN')).toBe('/dashboard/super-admin');
    expect(routeByRole('super_admin')).toBe('/dashboard/super-admin');
    expect(routeByRole('super admin')).toBe('/dashboard/super-admin');
    expect(routeByRole('superadmin')).toBe('/dashboard/super-admin');
  });

  it('should route AFFILIATE role correctly', () => {
    expect(routeByRole('AFFILIATE')).toBe('/dashboard/affiliate');
    expect(routeByRole('affiliate')).toBe('/dashboard/affiliate');
    expect(routeByRole('Affiliate')).toBe('/dashboard/affiliate');
  });

  it('should route STAFF role correctly', () => {
    expect(routeByRole('STAFF')).toBe('/dashboard/staff');
    expect(routeByRole('staff')).toBe('/dashboard/staff');
    expect(routeByRole('Staff')).toBe('/dashboard/staff');
  });

  it('should handle unknown roles with default fallback', () => {
    expect(routeByRole('unknown')).toBe('/dashboard/partner');
    expect(routeByRole(null)).toBe('/dashboard/partner');
    expect(routeByRole('')).toBe('/dashboard/partner');
    expect(routeByRole(undefined)).toBe('/dashboard/partner');
  });

  it('should handle whitespace correctly', () => {
    expect(routeByRole(' partner ')).toBe('/dashboard/partner');
    expect(routeByRole(' SUPER_ADMIN ')).toBe('/dashboard/super-admin');
    expect(routeByRole('\tstaff\n')).toBe('/dashboard/staff');
  });
});