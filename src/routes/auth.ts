import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail, checkPassword } from '../services/users';

const router = Router();

router.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    console.log('LOGIN start', email);

    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = await findUserByEmail(email);
    console.log('LOGIN user?', !!user, user?.id, user?.twoFactorEnabled);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await checkPassword(user, password);
    console.log('LOGIN pw-ok?', ok);
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
      role = 'PARTNER',
      agreeTerms,
      agreePrivacy 
    } = req.body || {};

    console.log('REGISTER start', email, role);

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

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log('REGISTER user exists', email);
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    console.log('REGISTER new user', email, role);

    // In a real implementation, you would:
    // 1. Hash the password with bcrypt
    // 2. Save user to database
    // 3. Send verification email
    // 4. Return success without generating JWT (user needs to verify email first)

    // For now, simulate successful registration
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('REGISTER password hashed for', email);
    
    // Mock user creation (in real app, save to database)
    const newUser = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      username: email.split('@')[0],
      role: role.toUpperCase(),
      passwordHash: hashedPassword,
      phone,
      company,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      emailVerified: false // In real app, would be false initially
    };

    console.log('REGISTER user created (mock)', { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    });

    // Return success response
    return res.json({
      success: true,
      message: role === 'ADVERTISER' 
        ? 'Заявка рекламодателя отправлена на рассмотрение. Мы свяжемся с вами в ближайшее время.' 
        : 'Регистрация успешна! Проверьте email для подтверждения аккаунта.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        emailVerified: newUser.emailVerified
      }
    });

  } catch (e) {
    console.error('register error', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
