import { json } from './http';

export function normalizeRole(role?: string) {
  const r = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');
  if (r === 'SUPERADMIN') return 'SUPER_ADMIN';
  if (r === 'PUBLISHER') return 'PARTNER';
  return r;
}

const HOME_BY_ROLE: Record<string, string> = {
  OWNER: '/dashboard/owner',
  ADVERTISER: '/dashboard/advertiser',
  AFFILIATE: '/dashboard/affiliate',
  PARTNER: '/dashboard/partner',
  SUPER_ADMIN: '/dashboard/super-admin',
  STAFF: '/dashboard/staff',
};

export function homeByRole(role?: string) {
  const R = normalizeRole(role);
  return (R && HOME_BY_ROLE[R]) || '/dashboard';
}

export function saveToken(token?: string, role?: string) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('token', token);
  if (role)  localStorage.setItem('role', normalizeRole(role));
}

export function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || '/auth/login';

export async function login(email: string, password: string) {
  const data = await json<any>(LOGIN_PATH, { email, password });
  const role = normalizeRole(data.user?.role || data.role);
  saveToken(data.token, role);
  return { ...data, role, home: homeByRole(role) };
}
