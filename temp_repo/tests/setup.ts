// Test setup file
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.OWNER_EMAIL = 'test-owner@example.com';
process.env.OWNER_PASSWORD = 'owner123';
process.env.ADVERTISER_EMAIL = 'test-advertiser@example.com';  
process.env.ADVERTISER_PASSWORD = 'adv123';
process.env.PARTNER_EMAIL = 'test-partner@example.com';
process.env.PARTNER_PASSWORD = 'partner123';
process.env.SUPER_ADMIN_EMAIL = 'test-superadmin@example.com';
process.env.SUPER_ADMIN_PASSWORD = 'admin123';
process.env.AFFILIATE_EMAIL = 'test-affiliate@example.com';
process.env.AFFILIATE_PASSWORD = 'affiliate123';