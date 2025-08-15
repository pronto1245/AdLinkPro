#!/usr/bin/env bash
set -euo pipefail

echo "→ Ищу файл, где вызывается express( )…"
CANDS="$(noglob grep -Rni --include='*.js' --include='*.ts' -E '\bexpress\s*\(' . 2>/dev/null \
  | grep -v -E '\.local/|node_modules/|dist/|build/|coverage/|\.next/|out/|storybook-static/' \
  | cut -d: -f1 | uniq)"

if [[ -z "${CANDS}" ]]; then
  echo "Не нашёл файлы с express(. Покажи мне структуру проекта."
  exit 1
fi

APP_FILE="$(echo "${CANDS}" | head -n 1)"
echo "✓ Нашёл файл приложения: ${APP_FILE}"

EXT="${APP_FILE##*.}"
if [[ "${APP_FILE}" == src/* ]]; then ROUTES_DIR="src/routes"; else ROUTES_DIR="routes"; fi
mkdir -p "${ROUTES_DIR}"

APP_VAR="$(perl -ne 'if(m/\b(const|let|var)\s+([A-Za-z_\$][\w\$]*)\s*=\s*express\s*\(/){print $2; exit}' "${APP_FILE}" || true)"
[[ -z "${APP_VAR}" ]] && APP_VAR="app"
echo "✓ Имя переменной приложения: ${APP_VAR}"

echo "→ Ставлю jsonwebtoken…"
npm i jsonwebtoken >/dev/null
if [[ "${EXT}" == "ts" ]]; then npm i -D @types/jsonwebtoken >/dev/null || true; fi

echo "→ Создаю роут dev-token…"
cat > "${ROUTES_DIR}/dev-token.ts" <<'TS'
import * as jwt from 'jsonwebtoken';
import { Router } from 'express';
const r = Router();
/** POST /api/dev/dev-token — временный JWT, активен только при ALLOW_SEED=1 */
r.post('/dev-token', (req, res) => {
  if (process.env.ALLOW_SEED !== '1') return res.status(403).json({ error: 'disabled' });
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
  const token = (jwt as any).sign(
    { sub: 'dev-admin', role: 'ADMIN', email: process.env.SEED_EMAIL || 'admin@example.com', username: process.env.SEED_USERNAME || 'admin' },
    secret as any, { expiresIn: '7d' }
  );
  res.json({ token });
});
export default r;
TS

cat > "${ROUTES_DIR}/dev-token.js" <<'JS'
const { Router } = require('express');
const jwt = require('jsonwebtoken');
const r = Router();
/** POST /api/dev/dev-token — временный JWT, активен только при ALLOW_SEED=1 */
r.post('/dev-token', (req, res) => {
  if (process.env.ALLOW_SEED !== '1') return res.status(403).json({ error: 'disabled' });
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
  const token = jwt.sign(
    { sub: 'dev-admin', role: 'ADMIN', email: process.env.SEED_EMAIL || 'admin@example.com', username: process.env.SEED_USERNAME || 'admin' },
    secret, { expiresIn: '7d' }
  );
  res.json({ token });
});
module.exports = r;
JS

echo "→ Подключаю dev-роут и /api/me в ${APP_FILE}…"
if grep -q "/api/dev" "${APP_FILE}"; then
  echo "⚠️ Похоже, /api/dev уже подключён — пропускаю вставку."
else
  cp "${APP_FILE}" "${APP_FILE}.bak.$(date +%s)" || true
  cat >> "${APP_FILE}" <<PATCH

/* === DEV AUTH HELPERS (auto-injected v2) === */
try {
  const exp = require('express');
  const jwt = require('jsonwebtoken');
  if (typeof ${APP_VAR}?.use === 'function') {
    try { ${APP_VAR}.use(exp.json()); } catch (e) {}
    if (process.env.ALLOW_SEED === '1') {
      let devRouter;
      try {
        devRouter = require('./routes/dev-token');
        devRouter = devRouter.default || devRouter;
      } catch {
        devRouter = exp.Router();
        devRouter.post('/dev-token', (req, res) => {
          const secret = process.env.JWT_SECRET;
          if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
          const token = jwt.sign(
            { sub: 'dev-admin', role: 'ADMIN', email: process.env.SEED_EMAIL || 'admin@example.com', username: process.env.SEED_USERNAME || 'admin' },
            secret, { expiresIn: '7d' }
          );
          res.json({ token });
        });
      }
      ${APP_VAR}.use('/api/dev', devRouter);
    }
    ${APP_VAR}.get('/api/me', (req, res) => {
      try {
        const h = req.headers.authorization || '';
        const token = h.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'no token' });
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ id: payload.sub, role: payload.role, email: payload.email, username: payload.username });
      } catch {
        res.status(401).json({ error: 'invalid token' });
      }
    });
  }
} catch (e) {
  try { console.error('dev-auth init error:', e && e.message ? e.message : e); } catch (_) {}
}
/* === /DEV AUTH HELPERS === */
PATCH
  echo "✓ Вставка завершена."
fi

echo "→ Коммичу и пушу…"
git add -A
git commit -m "feat(dev): add /api/dev/dev-token and /api/me (v2, correct app file)" || true
git push
echo "✓ Готово. Дальше: в Koyeb выставь окружение и сделай Redeploy:
  ALLOW_SEED=1
  JWT_SECRET=(openssl rand -hex 32)
  SEED_EMAIL=admin@example.com
  SEED_USERNAME=admin

После redeploy проверь:
  BASE=https://central-matelda-pronto12-95b8129d.koyeb.app
  curl -s -X POST \"$BASE/api/dev/dev-token\"
Скопируй token из ответа и проверь:
  TOKEN=ВСТАВЬ_ТОКЕН
  curl -s \"$BASE/api/me\" -H \"Authorization: Bearer $TOKEN\"
"
