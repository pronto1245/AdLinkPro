import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { saveToken, getToken } from "@/services/auth";

const API_BASE = import.meta.env.VITE_API_URL;
const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/api/auth/login";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (getToken()) setLocation("/");
  }, [setLocation]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${LOGIN_PATH}`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok || !data?.token) throw new Error(data?.error || "Login failed");

      saveToken(data.token);

      const meRes = await fetch(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (!meRes.ok) throw new Error("Profile error");
      const me = await meRes.json();

      const role = String(me.role||"").toUpperCase();
      if (role==="OWNER") setLocation("/owner");
      else if (role==="ADVERTISER") setLocation("/advertiser");
      else if (role==="PARTNER") setLocation("/partner");
      else setLocation("/");
    } catch (e:any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 16 }}>Sign in</h1>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
               placeholder="you@example.com"
               style={{ display:"block", width:"100%", marginBottom:12, padding:8 }} required/>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
               placeholder="••••••••"
               style={{ display:"block", width:"100%", marginBottom:16, padding:8 }} required/>
        <button type="submit" disabled={loading} style={{ padding:"10px 14px" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {err && <div style={{ color:"crimson", marginTop:12 }}>{err}</div>}
      </form>
    </div>
  );
}
