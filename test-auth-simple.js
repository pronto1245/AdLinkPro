const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    console.log('🔐 [AUTH] Simple test login attempt for:', email);
    
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    
    // Test with hardcoded users from documentation
    const users = [
      { email: '9791207@gmail.com', password: 'Affilix123!', role: 'owner', id: '1' },
      { email: 'owner', password: 'owner123', role: 'owner', id: '1' },
      { email: '12345@gmail.com', password: 'adv123', role: 'advertiser', id: '2' },
      { email: 'advertiser', password: 'adv123', role: 'advertiser', id: '2' },
      { email: '4321@gmail.com', password: 'partner123', role: 'partner', id: '3' },
      { email: 'partner', password: 'partner123', role: 'partner', id: '3' },
    ];
    
    const user = users.find(u => u.email === email || u.email === email.toLowerCase());
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Simple password check (in real implementation we'd use bcrypt)
    if (user.password !== password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, secret, { expiresIn: '7d' });
    
    console.log('✅ Login successful for:', user.email, 'Role:', user.role);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ error: 'internal error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/me', (req, res) => {
  try {
    const h = String(req.headers['authorization'] || '');
    const raw = h.startsWith('Bearer ') ? h.slice(7) : h;
    if (!raw) return res.status(401).json({ error: 'no token' });
    const p = jwt.verify(raw, process.env.JWT_SECRET || 'dev_secret');
    const role = String(p.role || '').toLowerCase();
    res.json({ id: p.sub || null, username: p.username || null, email: p.email || null, role });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('✅ Simple test server started at http://localhost:' + PORT);
  setTimeout(() => {
    console.log('🛑 Test server shutting down...');
    process.exit(0);
  }, 15000); // Auto-exit after 15 seconds
});