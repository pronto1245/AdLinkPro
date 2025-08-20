import { useState } from "react";
import { useLocation } from "wouter";
import { login, me } from "@/lib/api";

function roleToPath(role?: string) {
  const r = (role || "").toLowerCase();
  if (r === "advertiser") return "/dashboard/advertiser";
  if (r === "affiliate" || r === "partner") return "/dashboard/affiliate";
  if (r === "owner") return "/dashboard/owner";
  if (r === "staff") return "/dashboard/staff";
  if (r === "super_admin") return "/dashboard/super-admin";
  return "/dashboard/partner";
}

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password) as any;
      if (!data?.token) throw new Error("NO_TOKEN");
      localStorage.setItem("token", data.token);
      localStorage.setItem("auth:token", data.token);
      const u = await me() as any;
      navigate(roleToPath(u?.role));
    } catch (err: any) {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Вход</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded p-2" type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full rounded bg-black text-white p-2 disabled:opacity-50" disabled={loading}>{loading ? "Входим..." : "Войти"}</button>
      </form>
    </div>
  );
}
