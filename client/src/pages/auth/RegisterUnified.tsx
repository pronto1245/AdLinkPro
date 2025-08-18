import React from 'react';
import { useLocation } from 'wouter';
import { register as apiRegister, login as apiLogin, HOME as HOME_BY_ROLE, User } from '@/lib/auth';

type Props = { role?: 'partner' | 'advertiser' };

export default function RegisterUnified({ role }: Props) {
  const [, setLocation] = useLocation();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRegister({ name, email, password, role });
      const { user } = await apiLogin({ email, password, role });
      const home = HOME_BY_ROLE[(role ?? user.role) as User['role']] ?? '/';
      setLocation(home);
    } catch (e: any) {
      setError(e?.message || 'Ошибка регистрации');
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h1>Регистрация {role === 'partner' ? 'партнёра' : role === 'advertiser' ? 'рекламодателя' : ''}</h1>
      <form onSubmit={onSubmit}>
        <div style={{ margin: '12px 0' }}>
          <label>Имя</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: '100%' }} />
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Пароль</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}
