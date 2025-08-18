export type User = { id?: string; role?: 'partner'|'advertiser'|'owner'|'super_admin' };
const API = (import.meta as any).env?.VITE_API_URL || '';

export function saveToken(t: string){ try{ localStorage.setItem('token', t) }catch{} }
export function getToken(){ try{ return localStorage.getItem('token') }catch{ return null } }
export function logout(){ try{ localStorage.removeItem('token') }catch{} }

export const HOME_BY_ROLE: Record<string, string> = {
  partner: '/dashboard/partner',
  advertiser: '/dashboard/advertiser',
  owner: '/dashboard/owner',
  super_admin: '/dashboard/super-admin',
};
async function json(url: string, body: any){
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  let data: any = null; try{ data = await r.json() }catch{}
  return { ok: r.ok, status: r.status, data };
}

export async function login(args: { email?: string; username?: string; password: string }){
  const res = await json(`${API}/api/auth/login`, args);
  const token = res?.data?.token || res?.data?.jwt || res?.data?.accessToken;
  const user  = res?.data?.user || null;
  return { token: token || null, user, ok: res.ok, status: res.status };
}

export async function register(args: any){
  const res = await json(`${API}/api/auth/register`, args);
  return res?.data || { ok: res.ok, status: res.status };
}

export async function currentUser(){
  const t = getToken(); if (!t) return null;
  const r = await fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${t}` } });
  try{ return await r.json() }catch{ return null }
}

export async function requestOtp(_a:{email:string}){ return { ok:true } }
export async function verifyOtp(_a:{email:string; otp:string}){ return { ok:true } }

export default { login, register, logout, currentUser, saveToken, getToken, HOME: HOME_BY_ROLE, getRoleHome, requestOtp, verifyOtp };
