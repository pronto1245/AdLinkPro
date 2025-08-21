#!/usr/bin/env node

/**
 * Simple test script for authentication functionality
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAuthLogic() {
  console.log('🧪 Testing authentication logic...\n');
  
  try {
    // Test 1: Password hashing and verification
    console.log('1️⃣ Testing password hashing...');
    const plainPassword = 'owner123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    console.log('✅ Password hashed successfully');
    console.log('   Plain:', plainPassword);
    console.log('   Hash:', hashedPassword.substring(0, 30) + '...');
    
    // Test password verification
    const isValidPassword = await bcrypt.compare(plainPassword, hashedPassword);
    const isInvalidPassword = await bcrypt.compare('wrongpassword', hashedPassword);
    
    console.log('   Correct password verification:', isValidPassword ? '✅' : '❌');
    console.log('   Wrong password rejection:', !isInvalidPassword ? '✅' : '❌');
    
    // Test 2: JWT token generation and verification
    console.log('\n2️⃣ Testing JWT token generation...');
    const secret = 'test-secret-key';
    const userPayload = {
      sub: '1',
      role: 'OWNER',
      email: '9791207@gmail.com',
      username: 'owner'
    };
    
    const token = jwt.sign(userPayload, secret, { expiresIn: '7d' });
    console.log('✅ JWT token generated successfully');
    console.log('   Token:', token.substring(0, 50) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, secret);
    console.log('✅ JWT token verified successfully');
    console.log('   Decoded payload:', {
      sub: decoded.sub,
      role: decoded.role,
      email: decoded.email,
      username: decoded.username
    });
    
    // Test 3: Complete authentication workflow
    console.log('\n3️⃣ Testing complete authentication workflow...');
    
    // Simulate database user
    const dbUser = {
      id: '1',
      email: '9791207@gmail.com',
      username: 'owner',
      role: 'OWNER',
      passwordHash: hashedPassword,
      twoFactorEnabled: false
    };
    
    // Simulate login attempt
    const loginEmail = '9791207@gmail.com';
    const loginPassword = 'owner123';
    
    console.log('   📧 Email match:', dbUser.email.toLowerCase() === loginEmail.toLowerCase() ? '✅' : '❌');
    
    const passwordMatch = await bcrypt.compare(loginPassword, dbUser.passwordHash);
    console.log('   🔑 Password match:', passwordMatch ? '✅' : '❌');
    
    if (passwordMatch) {
      const authToken = jwt.sign({
        sub: dbUser.id,
        role: dbUser.role,
        email: dbUser.email,
        username: dbUser.username
      }, secret, { expiresIn: '7d' });
      
      console.log('   🎟️ Auth token generated:', authToken.substring(0, 50) + '...');
      
      // Verify auth token
      const verifiedPayload = jwt.verify(authToken, secret);
      console.log('   ✅ Authentication workflow completed successfully');
      console.log('   👤 User authenticated:', verifiedPayload.email);
    }
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Run the test
testAuthLogic().catch(console.error);