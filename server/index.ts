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
