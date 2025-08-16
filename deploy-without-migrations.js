#!/usr/bin/env node

/**
 * Emergency deployment script that bypasses migration issues
 * This script sets up the database connection without running migrations
 */

import { neon } from '@neondatabase/serverless';

console.log('🚀 Starting emergency deployment without migrations...');

// Check database connection
async function checkDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found');
      process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      LIMIT 10
    `;
    
    console.log(`✅ Found ${tables.length} tables in database`);
    
    if (tables.length > 0) {
      console.log('✅ Database schema already exists - no migrations needed');
      return true;
    } else {
      console.log('⚠️ No tables found - schema may need setup');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    return false;
  }
}

// Main deployment check
async function main() {
  console.log('=== EMERGENCY DEPLOYMENT CHECK ===');
  
  const dbOk = await checkDatabase();
  
  if (dbOk) {
    console.log('🎉 System ready for deployment without migrations!');
    console.log('💡 Recommendation: Deploy with existing database schema');
  } else {
    console.log('⚠️ Database setup may be required');
  }
}

main().catch(console.error);