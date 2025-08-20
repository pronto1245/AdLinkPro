#!/usr/bin/env bash
set -euo pipefail

echo "→ Поиск файла с express()…"
APP_FILE="$(grep -Rli 'express(' . 2>/dev/null | head -n 1 || true)"
if [[ -z "${APP_FILE}" ]]; then
  echo "Не нашёл файл с express(. Покажи вывод: grep -Rli 'express(' ."
  exit 1
fi
echo "✓ Нашёл: ${APP_FILE}"

EXT="${APP_FILE##*.}"
if [[ "${APP_FILE}" == src/* ]]; then ROUTES_DIR="src/routes"; else ROUTES_DIR="routes"; fi
mkdir -p "${ROUTES_DIR}"

# Вытащим имя переменной приложения (app), если отличное — подставим.
APP_VAR="$(perl -ne 'if(m/\b(const|let|var)\s+([A-Za-z_\$][\w\$]*)\s*=\s*express\s*\(/){print $2; exit}' "${APP_FILE}" || true)"
[[ -z "${APP_VAR}" ]] && APP_VAR="app"
echo "✓ Имя переменной приложения: ${APP_VAR}"

echo "→ Установка jsonwebtoken…"
npm i jsonwebtoken >/dev/null
if [[ "${EXT}" == "ts" ]]; then npm i -D @types/jsonwebtoken >/dev/null || true; fi

# Создадим dev-token роут (на всякий случай и TS, и JS вариант)
cat > "${ROUTES_DIR}/dev-token.ts" <<'TS'
import * as jwt from 'jsonwebtoken';
import { Router } from 'express';

const r = Router();

/** POST /api/dev/dev-token — отдаёт временный JWT, активен только при ALLOW_SEED=1 */
r.post('/dev-token', (req, res) => {
  if (process.env.ALLOW_SEED !== '1') {
    return res.status(403).json({ error: 'disabled' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

  const token = (jwt as any).sign(
    {
      sub: 'dev-admin',
      role: 'ADMIN',
      email: process.env.SEED_EMAIL || 'admin@example.com',
      username: process.env.SEED_USERNAME || 'admin',
    },
    secret as any,
    { expiresIn: '7d' }
  );
  res.json({ token });
});

export default r;
TS

cat > "${ROUTES_DIR}/dev-token.js" <<'JS'
const { Router } = require('express');
const jwt = require('jsonwebtoken');

const r = Router();

/** POST /api/dev/dev-token — отдаёт временный JWT, активен только при ALLOW_SEED=1 */
r.post('/dev-token', (req, res) => {
  if (process.env.ALLOW_SEED !== '1') {
    return res.status(403).json({ error: 'disabled' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

  const token = jwt.sign(
    {
      sub: 'dev-admin',
      role: 'ADMIN',
      email: process.env.SEED_EMAIL || 'admin@example.com',
      username: process.env.SEED_USERNAME || 'admin',
    },
    secret,
    { expiresIn: '7d' }
  );
  res.json({ token });
});

module.exports = r;
JS

# Проверим, не добавляли ли раньше
if grep -q "/api/dev/dev-token" "${APP_FILE}"; then
  echo "⚠️ Похоже, dev-роут уже был подключен — пропускаю вставку."
else
  echo "→ Патчим ${APP_FILE} (добавляем dev-роут и /api/me)…"
  cat >> "${APP_FILE}" <<PATCH

/* === DEV AUTH HELPERS (auto-injected) === */
try {
  // @ts-ignore
  const exp = require('express');
  // @ts-ignore
  const jwt = require('jsonwebtoken');

  if (typeof ${APP_VAR}?.use === 'function') {
    // безопасно: если json parser уже есть — второй раз не навредит
    try { ${APP_VAR}.use(exp.json()); } catch (e) {}

    // одноразовый dev-токен — активен только при ALLOW_SEED=1
    if (process.env.ALLOW_SEED === '1') {
      const devRouter = exp.Router();
      devRouter.post('/dev-token', (req, res) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
        const token = jwt.sign(
          {
            sub: 'dev-admin',
            role: 'ADMIN',
            email: process.env.SEED_EMAIL || 'admin@example.com',
            username: process.env.SEED_USERNAME || 'admin',
          },
          secret,
          { expiresIn: '7d' }
        );
        res.json({ token });
      });
      ${APP_VAR}.use('/api/dev', devRouter);
    }

    // простой /api/me, чтобы фронт не ловил 404
    ${APP_VAR}.get('/api/me', (req, res) => {
      try {
        const h = req.headers.authorization || '';
        const token = h.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'no token' });
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
          id: payload.sub,
          role: payload.role,
          email: payload.email,
          username: payload.username,
        });
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
  echo "✓ Вставка завершена"
fi

echo "→ git commit & push…"
git add -A
git commit -m "feat(dev): add /api/dev/dev-token and /api/me (auto-injected)" || true
git push

echo "✓ Готово. Теперь в Koyeb установи окружение и сделай Redeploy:
  ALLOW_SEED=1
  JWT_SECRET=(openssl rand -hex 32)
  SEED_EMAIL=admin@example.com
  SEED_USERNAME=admin

После redeploy проверь:
  BASE=https://central-matelda-pronto12-95b8129d.koyeb.app
  curl -s -X POST \"\$BASE/api/dev/dev-token\"
Скопируй token из ответа и проверь:
  TOKEN=ВСТАВЬ_ТОКЕН
  curl -s \"\$BASE/api/me\" -H \"Authorization: Bearer \$TOKEN\"
"
