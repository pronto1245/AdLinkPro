import { sql } from "drizzle-orm";
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, checkPassword } from '../services/users';
import { db } from '../db';

const router = Router();

// Test user credentials fallback (for development/testing)
const TEST_USERS = {
  'owner': { email: '9791207@gmail.com', password: 'Affilix123!', role: 'OWNER' },
  'advertiser': { email: 'advertiser@example.com', password: 'adv123', role: 'ADVERTISER' },
  'partner': { email: 'partner@example.com', password: 'partner123', role: 'PARTNER' }
};

router.post('/auth/login', async (req, res) => {
  const { email, password, username } = req.body || {};
  
  console.log('🔐 [AUTH] Login attempt received:', {
    email: email || 'not provided',
    username: username || 'not provided',
    hasPassword: !!password,
    timestamp: new Date().toISOString()
  });
  
  if ((!email && !username) || !password) {
    console.log('❌ [AUTH] Missing credentials');
    return res.status(400).json({ error: 'Email/username and password are required' });
  }

  try {
    // Try database authentication first
    let user = null;
    let loginIdentifier = email || username;
    
    console.log('🔍 [AUTH] Checking database for user:', loginIdentifier);
    
    if (email) {
      user = await findUserByEmail(email.toLowerCase().trim());
    } else if (username) {
      // Check if username is actually an email
      if (username.includes('@')) {
        user = await findUserByEmail(username.toLowerCase().trim());
      } else {
        // Look up user by username in test credentials
        if (TEST_USERS[username.toLowerCase()]) {
          const testUser = TEST_USERS[username.toLowerCase()];
          console.log('🎯 [AUTH] Using test user credentials for:', username);
          loginIdentifier = testUser.email;
          user = await findUserByEmail(testUser.email);
          
          // If not in database, use fallback
          if (!user && testUser.password === password) {
            console.log('✅ [AUTH] Test user fallback authentication successful:', username);
            const token = jwt.sign(
              { sub: username, email: testUser.email, role: testUser.role, username },
              process.env.JWT_SECRET!,
              { expiresIn: '7d' }
            );
            
            return res.json({
              success: true,
              token,
              user: {
                id: username,
                email: testUser.email,
                username: username,
                role: testUser.role,
                twoFactorEnabled: false
              }
            });
          }
        }
      }
    }
    
    if (user && user.password_hash) {
      console.log('✅ [AUTH] User found in database:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPasswordHash: !!user.password_hash
      });
      
      // Verify password with bcrypt
      console.log('🔑 [AUTH] Verifying password with bcrypt...');
      try {
        const [{ match }] = await db.execute(
          sql`SELECT crypt(${password}, ${user.password_hash}) = ${user.password_hash} as match`
        );
        
        if (match) {
          console.log('✅ [AUTH] Password verification successful for:', user.email);
          
          const token = jwt.sign(
            { sub: user.id, email: user.email, role: user.role, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
          );
          
          console.log('🔐 [AUTH] JWT token generated successfully');
          
          return res.json({
            success: true,
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              twoFactorEnabled: user.twoFactorEnabled || false
            }
          });
        } else {
          console.log('❌ [AUTH] Password verification failed for:', user.email);
        }
      } catch (bcryptError) {
        console.error('❌ [AUTH] Bcrypt verification error:', bcryptError);
      }
    } else {
      console.log('ℹ️ [AUTH] User not found in database or no password hash');
    }
    
    // Fallback to test user credentials for development
    console.log('🔄 [AUTH] Attempting fallback authentication...');
    
    // Check if login is for specific test user email/password combo
    const ownerFallback = (loginIdentifier === '9791207@gmail.com' || username === 'owner') && password === 'Affilix123!';
    const advertiserFallback = (loginIdentifier?.includes('advertiser') || username === 'advertiser') && password === 'adv123';
    const partnerFallback = (loginIdentifier?.includes('partner') || username === 'partner') && password === 'partner123';
    
    if (ownerFallback || advertiserFallback || partnerFallback) {
      let fallbackUser;
      if (ownerFallback) {
        fallbackUser = { id: 'owner', email: '9791207@gmail.com', username: 'owner', role: 'OWNER' };
      } else if (advertiserFallback) {
        fallbackUser = { id: 'advertiser', email: 'advertiser@example.com', username: 'advertiser', role: 'ADVERTISER' };
      } else {
        fallbackUser = { id: 'partner', email: 'partner@example.com', username: 'partner', role: 'PARTNER' };
      }
      
      console.log('✅ [AUTH] Fallback authentication successful for:', fallbackUser.username);
      
      const token = jwt.sign(
        { sub: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role, username: fallbackUser.username },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          username: fallbackUser.username,
          role: fallbackUser.role,
          twoFactorEnabled: false
        }
      });
    }
    
    console.log('❌ [AUTH] Authentication failed for:', loginIdentifier);
    return res.status(401).json({ error: 'Invalid credentials' });
    
  } catch (error) {
    console.error('💥 [AUTH] Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
