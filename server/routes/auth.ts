import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, checkPassword } from '../services/users';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await checkPassword(user, password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
});

router.post('/register', async (req, res) => {
  const { email, password, username, role = 'partner' } = req.body || {};
  
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }

  try {
    // Mock user creation - replace with actual database logic
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      username,
      role,
    };

    const token = jwt.sign(
      { sub: newUser.id, email: newUser.email, role: newUser.role, username: newUser.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
