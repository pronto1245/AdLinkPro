import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail, checkPassword, createUser } from '../services/users';

const router = Router();

// In-memory store for registered users when database is unavailable
const inMemoryUsers = new Map<string, any>();

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
      // Check in-memory registered users first
      console.log('🔍 [AUTH] Checking in-memory registered users for:', email);
      const inMemoryUser = inMemoryUsers.get(email.toLowerCase());
      
      if (inMemoryUser) {
        console.log('✅ [AUTH] Found user in memory, checking password');
        const passwordValid = await bcrypt.compare(password, inMemoryUser.passwordHash);
        
        if (passwordValid) {
          console.log('✅ [AUTH] In-memory user authentication successful:', inMemoryUser.email);
          
          const secret = process.env.JWT_SECRET;
          if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
          
          const token = jwt.sign(
            { sub: inMemoryUser.id, role: inMemoryUser.role, email: inMemoryUser.email, username: inMemoryUser.username },
            secret,
            { expiresIn: '7d' }
          );
          
          return res.json({ 
            token,
            user: {
              id: inMemoryUser.id,
              email: inMemoryUser.email,
              role: inMemoryUser.role,
              username: inMemoryUser.username
            }
          });
        }
      }
      
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
      
      console.log('❌ [AUTH] User not found in database, memory, or hardcoded users');
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

// Registration endpoint
router.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      company, 
      role = 'affiliate', // Use lowercase to match schema default
      agreeTerms,
      agreePrivacy 
    } = req.body || {};

    console.log('🔐 [REGISTER] Registration attempt for:', email, 'role:', role);

    // Validate required fields
    if (!name || !email || !password || !agreeTerms || !agreePrivacy) {
      return res.status(400).json({ 
        error: 'Обязательные поля: имя, email, пароль, согласие на условия и обработку данных' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Неверный формат email' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
    }

    // Check if user already exists in database
    console.log('🔍 [REGISTER] Checking for existing user:', email);
    const existingUser = await findUserByEmail(email);
    const inMemoryUser = inMemoryUsers.get(email.toLowerCase());
    
    if (existingUser || inMemoryUser) {
      console.log('❌ [REGISTER] User already exists:', email);
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    console.log('✅ [REGISTER] Creating new user:', email, 'with role:', role);

    try {
      // Try to create user in database
      const newUser = await createUser({
        name,
        email,
        password,
        phone,
        company,
        role: role.toLowerCase() // Ensure lowercase role for database
      });

      console.log('✅ [REGISTER] User created successfully in database:', { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      });

      // Return success response
      return res.json({
        success: true,
        message: role.toLowerCase() === 'advertiser' 
          ? 'Заявка рекламодателя отправлена на рассмотрение. Мы свяжемся с вами в ближайшее время.' 
          : 'Регистрация успешна! Проверьте email для подтверждения аккаунта.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.firstName || name,
          username: newUser.username,
          role: newUser.role,
          emailVerified: false // Will be handled by email verification system
        }
      });

    } catch (dbError) {
      console.error('❌ [REGISTER] Database error:', dbError.message);
      
      // Handle specific database errors
      if (dbError.message === 'EMAIL_EXISTS') {
        return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
      }
      if (dbError.message === 'USERNAME_EXISTS') {
        return res.status(409).json({ error: 'Пользователь с таким именем уже существует' });
      }
      if (dbError.message === 'USER_EXISTS') {
        return res.status(409).json({ error: 'Пользователь уже существует' });
      }

      // Fallback to in-memory storage for development when database is unavailable
      console.log('⚠️ [REGISTER] Database unavailable, falling back to in-memory storage');
      
      const hashedPassword = await bcrypt.hash(password, 12);
      const fallbackUser = {
        id: Date.now(),
        name,
        email: email.toLowerCase(),
        username: email.split('@')[0],
        role: role.toUpperCase(), // Legacy format for in-memory users
        passwordHash: hashedPassword,
        phone,
        company,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
        emailVerified: false
      };

      // Store in memory for duplicate checking
      inMemoryUsers.set(email.toLowerCase(), fallbackUser);
      console.log('🔄 [REGISTER] User stored in memory as fallback');

      return res.json({
        success: true,
        message: role.toLowerCase() === 'advertiser' 
          ? 'Заявка рекламодателя отправлена на рассмотрение. Мы свяжемся с вами в ближайшее время.' 
          : 'Регистрация успешна! Проверьте email для подтверждения аккаунта.',
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
          role: fallbackUser.role,
          emailVerified: fallbackUser.emailVerified
        }
      });
    }

  } catch (e) {
    console.error('❌ [REGISTER] Unexpected error:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
