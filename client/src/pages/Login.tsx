import React, { useState } from 'react';
import { login } from '../lib/api';

export default function LoginPage() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { user } = await login(username, password);
      alert(`Успех: ${user.username} (${user.role})`);
      // здесь можно сделать navigate('/dashboard') при наличии роутера
    } catch (e: any) {
      setErr(e.message || 'Login error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display:'grid', gap:8, maxWidth:320 }}>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setU(e.target.value)}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setP(e.target.value)}
      />
      <button disabled={loading} type="submit">Log in</button>
      {err && <div style={{ color: 'red' }}>{err}</div>}
    </form>
  );
}
