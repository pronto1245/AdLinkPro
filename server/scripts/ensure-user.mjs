#!/usr/bin/env node

/**
 * Script to ensure the user 9791207@gmail.com exists in the database with proper bcrypt hashed password
 */

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { config } from '../config/environment.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || config.DATABASE_URL || 'postgres://a1@localhost:5432/adlinkpro_db',
});

async function ensureUser() {
  try {
    console.log('🔍 Checking if user 9791207@gmail.com exists...');
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email, username, role, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      ['9791207@gmail.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ User 9791207@gmail.com already exists:', {
        id: existingUser.rows[0].id,
        email: existingUser.rows[0].email,
        username: existingUser.rows[0].username,
        role: existingUser.rows[0].role,
        hasPasswordHash: !!existingUser.rows[0].password_hash
      });
      
      // Check if password hash looks like bcrypt
      const passwordHash = existingUser.rows[0].password_hash;
      if (passwordHash && passwordHash.startsWith('$2')) {
        console.log('✅ Password hash appears to be bcrypt format');
        
        // Test the password hash with known password
        const testPassword = process.env.OWNER_PASSWORD || 'owner123';
        const isValid = await bcrypt.compare(testPassword, passwordHash);
        
        if (isValid) {
          console.log('✅ Password verification successful with test password');
        } else {
          console.log('⚠️ Password verification failed with test password');
          console.log('💡 You may need to reset the password or verify the correct password');
        }
      } else {
        console.log('❌ Password hash does not appear to be bcrypt format');
        console.log('💡 Consider updating the password hash');
      }
      
      return;
    }
    
    console.log('📝 User does not exist, creating...');
    
    // Create user with hashed password
    const email = '9791207@gmail.com';
    const password = process.env.OWNER_PASSWORD || 'owner123';
    const username = 'owner';
    const role = 'OWNER';
    
    console.log('🔑 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('💾 Inserting user into database...');
    const result = await pool.query(
      `INSERT INTO users (email, username, role, password_hash, created_at, updated_at, two_factor_enabled)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), false)
       RETURNING id, email, username, role`,
      [email.toLowerCase(), username, role, hashedPassword]
    );
    
    console.log('✅ User created successfully:', result.rows[0]);
    
    // Verify the password works
    console.log('🧪 Testing password verification...');
    const isValid = await bcrypt.compare(password, hashedPassword);
    
    if (isValid) {
      console.log('✅ Password verification test passed');
    } else {
      console.log('❌ Password verification test failed');
    }
    
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    
    if (error.code === '42P01') {
      console.log('💡 The users table does not exist. Please run database migrations first.');
    } else if (error.code === '23505') {
      console.log('💡 User already exists (unique constraint violation)');
    } else {
      console.log('💡 This might be a database connection issue. Check your DATABASE_URL.');
    }
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureUser().catch(console.error);
}

export { ensureUser };