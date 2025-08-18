import React from 'react';
import { useLocation } from 'wouter';
import { login as apiLogin, HOME as HOME_BY_ROLE, User } from '@/lib/auth';

type Props = { role?: 'partner' | 'advertiser' };

export default function Login({ role }: Props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [, setLocation] = useLocation();

  const search = typeof window !== 'undefined' ? window.location.search : '';
  const params = new URLSearchParams(search);
  const next = params.get('next');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { user } = await apiLogin({ email, password, otp: otp || undefined, role });
      const home = HOME_BY_ROLE[(role ?? user.role) as User['role']] ?? '/';
      setLocation(next || home);
    } catch (e: any) {
      setError(e?.message || 'Ошибка входа');
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h1>{role === 'partner' ? 'Вход для партнёров' : role === 'advertiser' ? 'Вход для рекламодателей' : 'Вход'}</h1>
      <form onSubmit={onSubmit}>
        <div style={{ margin: '12px 0' }}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: '100%' }} />
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Пароль</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={{ width: '100%' }} />
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Код 2FA (если требуется)</label>
          <input value={otp} onChange={e => setOtp(e.target.value)} type="text" inputMode="numeric" style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
