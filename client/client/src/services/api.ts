export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Ошибка входа");
  }
  return res.json();
}

export async function fetchMe() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ошибка авторизации");
  return res.json();
}
