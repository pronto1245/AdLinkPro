const RAW_BASE = (import.meta?.env?.VITE_API_BASE || "").replace(/\/+$/,"");
export const API_BASE = RAW_BASE || "";

function norm(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/api/")) return path;
  if (path.startsWith("/")) return "/api" + path;
  return "/api/" + path;
}

async function api(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("auth:token") || "";
  const headers: Record<string,string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string,string> | undefined),
  };
  const res = await fetch(norm(path), { ...init, headers, credentials: "include" });
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = await res.text(); } catch{}
    throw new Error(msg || `${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function json(path: string, body?: unknown, init: RequestInit = {}) {
  const headers = { "Content-Type": "application/json", ...(init.headers as Record<string,string> | undefined) };
  return api(path, { ...init, method: init.method || "POST", headers, body: body !== undefined ? JSON.stringify(body) : init.body });
}

export async function get(path: string, init: RequestInit = {}) {
  return api(path, { ...init, method: "GET" });
}

export async function login(email: string, password: string) {
  return json("/api/auth/login", { email, password });
}

export async function me() {
  return get("/api/me");
}

export default api;

export { api };
