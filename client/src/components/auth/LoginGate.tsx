import React from 'react';
import { useLocation } from 'wouter';
import { HOME as HOME_BY_ROLE, User } from '@/lib/auth';

export default function LoginGate() {
  const [, setLocation] = useLocation();
  React.useEffect(() => {
    let user: User | null = null;
    try { user = JSON.parse(localStorage.getItem('auth:user') || 'null'); } catch {}
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const next = params.get('next');
    if (user && user.role) {
      const home = HOME_BY_ROLE[user.role] || '/';
      setLocation(next || home);
    }
  }, [setLocation]);
  return null;
}

{/* Быстрый вход по ролям */}
<div className="flex gap-2 mb-4">
  <button
    onClick={() => quickLogin("owner@test.com", "Owner123!")}
    className="px-4 py-2 bg-blue-600 text-white rounded"
  >
    👑 Войти как Владелец
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

async function quickLogin(email: string, password: string) {
  setEmail(email);
  setPassword(password);
  await onSubmit(); // или login(email, password)
}

if (user.role === "owner") {
  setLocation("/owner/dashboard");
} else if (user.role === "advertiser") {
  setLocation("/advertiser/dashboard");
} else if (user.role === "publisher") {
  setLocation("/publisher/dashboard");
} else {
  setLocation("/");
}
