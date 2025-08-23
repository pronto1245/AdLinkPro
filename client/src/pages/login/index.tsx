import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { login } from '@/services/auth';
import { HOME as HOME_BY_ROLE, User } from '@/lib/auth';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ⛔️ LoginGate встроенный: редирект если уже авторизован
  useEffect(() => {
    let user: User | null = null;
    try { user = JSON.parse(localStorage.getItem('auth:user') || 'null'); } catch {}
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (user?.role) {
      const home = HOME_BY_ROLE[user.role] || '/';
      setLocation(next || home);
    }
  }, []);

  async function onSubmit(e?: React.FormEvent) {
    if (e) {e.preventDefault();}
    setLoading(true);
    setError(null);
    try {
      const res = await login({ email, password });
      if (res?.token) {
        const user = res.user;
        localStorage.setItem('auth:token', res.token);
        localStorage.setItem('auth:user', JSON.stringify(user));
        const home = HOME_BY_ROLE[user.role] || '/';
        setLocation(home);
      } else {
        setError("Ошибка авторизации");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(email: string, password: string) {
    setEmail(email);
    setPassword(password);
    onSubmit();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold mb-6">Вход</h1>

      {/* Быстрый вход */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => quickLogin("owner@test.com", "Owner123!")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          👑 Владелец
        </button>
        <button
          onClick={() => quickLogin("advertiser@test.com", "AdvUser456$")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          📢 Рекламодатель
        </button>
        <button
          onClick={() => quickLogin("publisher@test.com", "PubUser789@")}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          🤝 Партнёр
        </button>
      </div>

      {/* Форма входа */}
      <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
