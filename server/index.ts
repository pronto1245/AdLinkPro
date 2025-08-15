import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

const corsMw = cors({
  origin: ['https://adlinkpro.netlify.app', 'http://localhost:5173'],
  credentials: true,
});
app.use(corsMw);
app.use(express.json({ type: '*/*' }));
app.options('*', corsMw);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', authRouter);

function requireAuth(req: any, res: any, next: any) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Invalid token' });
  next();
}

app.get('/api/analytics/summary', requireAuth, (_req, res) => {
  res.json({ clicks: 0, conversions: 0, revenue: 0, ctr: 0, cr: 0, epc: 0 });
});

app.get('/api/partner/offers', requireAuth, (_req, res) => {
  res.json({ offers: [
    { id: 101, name: 'Test Offer A', payout: 10, status: 'active' },
    { id: 102, name: 'Test Offer B', payout: 15, status: 'paused' },
  ]});
});

app.get('/api/partner/dashboard', requireAuth, (_req, res) => {
  res.json({ clicks: 0, conversions: 0, revenue: 0, ctr: 0 });
});

app.get('/api/partner/finance/summary', requireAuth, (_req, res) => {
  res.json({ balance: 0, pending: 0, paid: 0, currency: 'USD' });
});

app.get('/api/notifications', requireAuth, (_req, res) => {
  res.json({ items: [] });
});

const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
