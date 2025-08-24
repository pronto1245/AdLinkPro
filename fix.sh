cd ~/AdLinkPro

cp server/index.ts server/index.ts.bak

sed -i '' '/import authRouter from '\''\.\/routes\/auth'\'';/d' server/index.ts
sed -i '' '/app\.use('\''\/api\/auth'\'', authRouter);/d' server/index.ts

grep -q "^import authRouter from './routes/auth';" server/index.ts || \
  sed -i '' "1i\\
import authRouter from './routes/auth';
" server/index.ts

grep -q "app.use('/api/auth', authRouter);" server/index.ts || \
  awk '
  BEGIN{done=0}
  {print}
  /^[[:space:]]*const[[:space:]]+app[[:space:]]*=[[:space:]]*express\(\);/ && !done {
    print "app.use('\''/api/auth'\'', authRouter);"
    done=1
  }
  ' server/index.ts > server/index.ts.tmp && mv server/index.ts.tmp server/index.ts

cat > server/routes/auth.ts <<'EOT'
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, checkPassword } from '../services/users';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body ?? {};
    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const login = String(email ?? username).toLowerCase().trim();
    const user = await findUserByEmail(login);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await checkPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        twoFactorEnabled: false
      }
    });
  } catch (err) {
    console.error('AUTH Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
EOT

cat > server/services/users.ts <<'EOT'
import { db } from '../db';
import bcrypt from 'bcrypt';

export async function findUserByEmail(email: string) {
  const [user] = await db.execute(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`, [email]
  );
  return user;
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
EOT

lsof -tiTCP:5050 | xargs -r kill -9
npm run dev
