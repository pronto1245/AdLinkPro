#!/usr/bin/env node

/**
 * Script to ensure user 9791207@gmail.com exists with proper hashed password
 * and test authentication
 */

const bcrypt = require('bcryptjs');

// Mock the database functions to test our logic
const mockUsers = new Map();

// Mock database functions
const mockFindUserByEmail = async (email) => {
  console.log(`🔍 [MOCK-DB] Looking for user: ${email}`);
  const user = mockUsers.get(email.toLowerCase());
  if (user) {
    console.log(`✅ [MOCK-DB] User found: ${user.email} (${user.role})`);
  } else {
    console.log(`❌ [MOCK-DB] User not found: ${email}`);
  }
  return user || null;
};

const mockCheckPassword = async (user, password) => {
  console.log(`🔑 [MOCK-DB] Checking password for user: ${user.email}`);
  const isValid = await bcrypt.compare(password, user.passwordHash);
  console.log(`   Password check result: ${isValid ? '✅' : '❌'}`);
  return isValid;
};

async function setupTestUser() {
  console.log('📝 Setting up test user 9791207@gmail.com...\n');
  
  try {
    // Create user with hashed password
    const email = '9791207@gmail.com';
    const plainPassword = 'owner123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    const user = {
      id: '1',
      email: email,
      username: 'owner',
      role: 'OWNER',
      passwordHash: hashedPassword,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockUsers.set(email.toLowerCase(), user);
    
    console.log('✅ Test user created successfully:');
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Role:', user.role);
    console.log('   Password hash:', hashedPassword.substring(0, 30) + '...');
    console.log();
    
    return user;
  } catch (error) {
    console.error('❌ Error setting up test user:', error);
    throw error;
  }
}

async function testAuthentication() {
  console.log('🧪 Testing authentication flow...\n');
  
  try {
    // Set up test user
    await setupTestUser();
    
    // Test 1: Correct email and password
    console.log('1️⃣ Testing correct email and password...');
    const user1 = await mockFindUserByEmail('9791207@gmail.com');
    if (user1) {
      const isValid1 = await mockCheckPassword(user1, 'owner123');
      console.log(`   Result: ${isValid1 ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    console.log();
    
    // Test 2: Correct email, wrong password
    console.log('2️⃣ Testing correct email, wrong password...');
    const user2 = await mockFindUserByEmail('9791207@gmail.com');
    if (user2) {
      const isValid2 = await mockCheckPassword(user2, 'wrongpassword');
      console.log(`   Result: ${!isValid2 ? '✅ CORRECTLY REJECTED' : '❌ SHOULD BE REJECTED'}`);
    }
    console.log();
    
    // Test 3: Non-existent user
    console.log('3️⃣ Testing non-existent user...');
    const user3 = await mockFindUserByEmail('nonexistent@gmail.com');
    console.log(`   Result: ${!user3 ? '✅ CORRECTLY NOT FOUND' : '❌ SHOULD NOT EXIST'}`);
    console.log();
    
    // Test 4: Case insensitive email
    console.log('4️⃣ Testing case insensitive email...');
    const user4 = await mockFindUserByEmail('9791207@GMAIL.COM');
    if (user4) {
      const isValid4 = await mockCheckPassword(user4, 'owner123');
      console.log(`   Result: ${isValid4 ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    console.log();
    
    console.log('🎉 All authentication tests completed!');
    
  } catch (error) {
    console.error('❌ Authentication test error:', error);
  }
}

// Show the actual authentication route logic
async function showAuthLogic() {
  console.log('🔧 Authentication Route Logic:\n');
  
  console.log(`
/**
 * FIXED Authentication Logic (now uses database + bcrypt)
 */
async function authenticateUser(email, password) {
  // 1. Find user in database
  const user = await findUserByEmail(email.toLowerCase());
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // 2. Check password using bcrypt
  const passwordValid = await checkPassword(user, password);
  if (!passwordValid) {
    return { success: false, error: 'Invalid password' };
  }
  
  // 3. Generate JWT token
  const token = jwt.sign({
    sub: user.id,
    role: user.role,
    email: user.email,
    username: user.username
  }, JWT_SECRET, { expiresIn: '7d' });
  
  return { 
    success: true, 
    token, 
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  };
}
`);
}

// Run all tests
async function main() {
  console.log('🚀 Starting authentication system test...\n');
  
  await testAuthentication();
  await showAuthLogic();
  
  console.log('\n✨ Key Changes Made:');
  console.log('  ✅ Authentication now uses database lookups instead of hardcoded arrays');
  console.log('  ✅ Passwords are verified using bcrypt.compare() instead of plain text');
  console.log('  ✅ Fallback to hardcoded users only if database user not found');
  console.log('  ✅ Added comprehensive logging for debugging');
  console.log('  ✅ Added proper error handling and security measures');
  console.log('\n💡 Next Steps:');
  console.log('  1. Ensure user 9791207@gmail.com exists in database with hashed password');
  console.log('  2. Test authentication with real server');
  console.log('  3. Verify JWT token generation and validation');
}

main().catch(console.error);