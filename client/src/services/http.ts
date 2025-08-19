import { urlJoin } from './urlJoin';

const BASE = import.meta.env.VITE_API_URL || '';

export function joinUrl(p: string) {
  return /^https?:\/\//i.test(p) ? p : urlJoin(BASE, p);
}

export async function json<T = unknown>(urlOrPath: string, body?: any, init?: RequestInit): Promise<T> {
  const url = joinUrl(urlOrPath);
  const res = await fetch(url, {
    method: body ? 'POST' : (init?.method ?? 'GET'),
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}
