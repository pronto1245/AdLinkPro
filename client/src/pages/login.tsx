import React, { useState } from 'react';
import { useLocation } from 'wouter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || '/api/auth/login';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const body = { email, password };

      console.log("➡️ Отправка запроса на:", `${API_BASE}${LOGIN_PATH}`);
      console.log("🧾 Тело запроса:", body);

      const res = await fetch(`${API_BASE}${LOGIN_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log("↩️ Ответ от сервера:", res);

      const data = await res.json();

      console.log("📦 JSON ответ:", data);

      if (!res.ok) throw new Error(data?.error || 'Ошибка входа');
      if (!data.token) throw new Error('Токен не получен');

      localStorage.setItem('token', data.token);
      setLocation('/');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Вход</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full p-2 border"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2" disabled={loading}>
          {loading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
