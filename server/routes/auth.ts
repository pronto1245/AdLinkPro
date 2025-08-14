import express, { Router } from 'express';

const router = Router();
// свой JSON-парсер внутри роутера, чтобы не трогать index.ts
router.use(express.json());

// ВРЕМЕННО: жёстко зашитые пользователи для проверки фронта.
// Заменишь на БД/настоящую аутентификацию, как только всё поднимется.
const users = [
  { username: 'superadmin',      password: 'password123', role: 'superadmin' },
  { username: 'advertiser1',     password: 'password123', role: 'advertiser' },
  { username: 'test_affiliate',  password: 'password123', role: 'affiliate'  },
];

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const u = users.find(x => x.username === username && x.password === password);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });

  // Имитация ответа: фронту обычно нужен user + token
  return res.json({
    user: { username: u.username, role: u.role },
    token: 'dev-token', // заменишь на реальный JWT
  });
});

export default router;
