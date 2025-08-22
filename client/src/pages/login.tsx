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
    
    console.log("🔐 [SIMPLE_LOGIN] Starting login process...", {
      email,
      hasPassword: !!password,
      apiBase: API_BASE,
      loginPath: LOGIN_PATH
    });
    
    setErr('');
    setLoading(true);

    // Add timeout safety mechanism
    const timeoutId = setTimeout(() => {
      console.warn("🔐 [SIMPLE_LOGIN] Login timeout - resetting loading state");
      setLoading(false);
      setErr('Время ожидания истекло. Попробуйте еще раз.');
    }, 30000); // 30 second timeout

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

      if (!res.ok) {
        const errorMsg = data?.error || 'Ошибка входа';
        console.error("🔐 [SIMPLE_LOGIN] Login failed:", errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!data.token) {
        console.error("🔐 [SIMPLE_LOGIN] No token received:", data);
        throw new Error('Токен не получен');
      }

      console.log("🔐 [SIMPLE_LOGIN] Login successful, storing token and redirecting...");
      localStorage.setItem('token', data.token);
      setLocation('/');
    } catch (e: any) {
      console.error("🔐 [SIMPLE_LOGIN] Login error:", e);
      setErr(e.message);
    } finally {
      console.log("🔐 [SIMPLE_LOGIN] Clearing timeout and setting loading to false...");
      clearTimeout(timeoutId);
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
