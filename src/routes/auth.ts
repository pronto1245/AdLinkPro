import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, checkPassword } from '../services/users';

const router = Router();

router.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    console.log('🔐 [AUTH] Login attempt for:', email);

    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    let user = null;
    try {
      user = await findUserByEmail(email);
      console.log('✅ [AUTH] Database user lookup result:', !!user, user?.id);
    } catch (dbError) {
      console.log('⚠️ [AUTH] Database connection failed:', dbError.message);
      console.log('🔄 [AUTH] Falling back to hardcoded users...');
    }

    if (!user) {
      // FALLBACK: Try hardcoded users when database is unavailable
      console.log('🔍 [AUTH] Checking hardcoded users for:', email);
      const hardcodedUsers = [
        {
          id: 'owner-1',
          email: process.env.OWNER_EMAIL || "9791207@gmail.com",
          password: process.env.OWNER_PASSWORD || "owner123",
          role: "OWNER",
          username: "owner",
        },
        {
          id: 'adv-1',
          email: process.env.ADVERTISER_EMAIL || "12345@gmail.com", 
          password: process.env.ADVERTISER_PASSWORD || "adv123",
          role: "ADVERTISER",
          username: "advertiser",
        },
        {
          id: 'partner-1',
          email: process.env.PARTNER_EMAIL || "4321@gmail.com",
          password: process.env.PARTNER_PASSWORD || "partner123",
          role: "PARTNER",
          username: "partner",
        },
      ];
      
      const hardcodedUser = hardcodedUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (hardcodedUser && hardcodedUser.password === password) {
        console.log('✅ [AUTH] Hardcoded user authentication successful:', hardcodedUser.email);
        
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
        
        const token = jwt.sign(
          { sub: hardcodedUser.id, role: hardcodedUser.role, email: hardcodedUser.email, username: hardcodedUser.username },
          secret,
          { expiresIn: '7d' }
        );
        
        return res.json({ 
          token,
          user: {
            id: hardcodedUser.id,
            email: hardcodedUser.email,
            role: hardcodedUser.role,
            username: hardcodedUser.username
          }
        });
      }
      
      console.log('❌ [AUTH] User not found in database or hardcoded users');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await checkPassword(user, password);
    console.log('🔑 [AUTH] Password check result:', ok);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { sub: user.id, email: user.email, role: user.role, username: user.username } });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ error: 'internal error' });
  }
});

export default router;
