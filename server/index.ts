import path from 'node:path';
import express from "express";
const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

// health-check для Koyeb
app.get('/health', (_req, res) => res.json({ ok: true }));

// Раздача фронта из dist/public
app.use(express.static(path.join(process.cwd(), 'dist', 'public')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'public', 'index.html'));
});
/* --- health & static --- */
app.get('/health', (_req, res) => res.status(200).send('OK'));

import path from 'path';
import fs from 'fs';

const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}
/* --- end --- */

import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

// --- TEMP auth stub for Netlify demo ---
app.options('/api/*', (_req, res) => res.sendStatus(204)); // preflight для CORS

app.post('/api/auth/login', express.json(), (req, res) => {
  const { username, password } = req.body || {};

  const users = [
    { username: 'superadmin',     password: 'password123', role: 'superadmin' },
    { username: 'advertiser1',    password: 'password123', role: 'advertiser' },
    { username: 'test_affiliate', password: 'password123', role: 'affiliate'  },
  ];

  const u = users.find(x => x.username === username && x.password === password);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });

  return res.json({
    user: { username: u.username, role: u.role },
    token: 'dev-token' // потом заменим на реальный JWT
  });
});
