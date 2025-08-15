import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/lib/api';

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setU] = useState('');
  const [password, setP] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) nav('/', { replace: true });
  }, [nav]);

  const m = useMutation({
    mutationFn: () => login(username, password),
    retry: false,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await m.mutateAsync();
    nav('/', { replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-3">
      <input className="w-full border p-2 rounded" placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
      <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
      <button className="w-full border p-2 rounded bg-black text-white" disabled={m.isPending}>
        {m.isPending ? 'Logging in…' : 'Login'}
      </button>
      {m.isError && <div className="text-red-600 text-sm">Login failed</div>}
    </form>
  );
}
