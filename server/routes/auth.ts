import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const router = Router();

// Подключение к Postgres (NEON). В Koyeb уже должен быть настроен DATABASE_URL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Секрет для JWT (в Koyeb должен быть установлен JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    // Ищем пользователя
    const q = `
      SELECT id, username, password_hash, role
      FROM users
      WHERE username = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(q, [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Сверяем пароль
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Генерим JWT
    const token = jwt.sign(
      { sub: String(user.id), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    console.error('auth/login error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
