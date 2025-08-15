import { Router } from 'express';

const router = Router();

function readBody(req: any) {
  let b = req.body ?? {};
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch { b = {}; }
  }
  return b || {};
}

router.options('/auth/login', (_req, res) => {
  res.sendStatus(204);
});

router.post('/auth/login', (req, res) => {
  const { username, password } = readBody(req);

  const user = { id: 1, username: username || 'superadmin', role: 'superadmin' };
  const token = 'dev-token';

  return res.json({
    user,
    token,
    success: true,
    message: 'ok',
    data: { user, token },
  });
});

export default router;
