import React from 'react';
import { Link } from 'wouter';
import logo from '/logo.png';
import { login, saveToken, getRoleHome } from '@/services/auth';

type Props = { role?: 'partner' | 'advertiser' };

export default function Login({ role }: Props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showReset, setShowReset] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetMsg, setResetMsg] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res && res.token) {
        saveToken(res.token);
        const next = new URLSearchParams(window.location.search).get('next');
        const home = getRoleHome(res.user?.role || (role || 'partner'));
        window.location.href = next || home || '/';
      } else {
        setError('Не удалось войти: сервер не вернул токен');
        console.log('login response', res);
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка входа');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetMsg('');
    try {
      const url = `${import.meta.env.VITE_API_URL || ''}/api/auth/v2/reset-password`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      if (r.ok) {
        setResetMsg('Письмо с инструкциями отправлено. Проверьте почту.');
      } else {
        const t = await r.text();
        setResetMsg(t || 'Не удалось отправить письмо');
      }
    } catch (e) {
      setResetMsg('Ошибка сети');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0f1a' }}>
      <div style={{ width: 380, background: '#111827', color: '#e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <img src={logo} alt="Affilix.Click" width={36} height={36} style={{ borderRadius: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>Affilix.Click</div>
        </div>

        <h1 style={{ fontSize: 20, margin: '0 0 12px' }}>Вход</h1>
        <p style={{ margin: '0 0 16px', color: '#9ca3af' }}>Введите e-mail и пароль для входа</p>

        {error && <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@email.com"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: '#0f172a', color: '#e5e7eb' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Пароль</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: '#0f172a', color: '#e5e7eb' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #3b82f6',
              background: loading ? '#1f2937' : '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer'
            }}
          >
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <button onClick={() => setShowReset(true)} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer' }}>
            Забыли пароль?
          </button>
          <div style={{ color: '#9ca3af' }}>
            Нет аккаунта?
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          <Link href="/register/partner">
            <a style={{ display: 'block', textAlign: 'center', padding: '10px 12px', borderRadius: 10, border: '1px solid #10b981', color: '#d1fae5', background: 'transparent' }}>
              Стать партнёром
            </a>
          </Link>
          <Link href="/register/advertiser">
            <a style={{ display: 'block', textAlign: 'center', padding: '10px 12px', borderRadius: 10, border: '1px solid #f59e0b', color: '#ffedd5', background: 'transparent' }}>
              Стать рекламодателем
            </a>
          </Link>
        </div>
      </div>

      {showReset && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
          display: 'grid', placeItems: 'center', padding: 16
        }}>
          <div style={{ width: 360, background: '#111827', color: '#e5e7eb', padding: 20, borderRadius: 14 }}>
            <h3 style={{ marginTop: 0 }}>Восстановление пароля</h3>
            <form onSubmit={handleReset} style={{ display: 'grid', gap: 10 }}>
              <input
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                type="email"
                required
                placeholder="Ваш email"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: '#0f172a', color: '#e5e7eb' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #3b82f6', background: '#2563eb', color: '#fff' }}>
                  Отправить
                </button>
                <button type="button" onClick={() => setShowReset(false)} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: 'transparent', color: '#e5e7eb' }}>
                  Отмена
                </button>
              </div>
            </form>
            {resetMsg && <div style={{ marginTop: 10, color: '#93c5fd' }}>{resetMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
