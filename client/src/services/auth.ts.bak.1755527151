import { login as loginLib, register as registerLib, logout as logoutLib, getCurrentUser, HOME as HOME_BY_ROLE, User } from '@/lib/auth';

export const login = loginLib;
export const register = registerLib;
export const signIn = loginLib;
export const signUp = registerLib;
export const logout = logoutLib;
export const currentUser = getCurrentUser;
export const HOME = HOME_BY_ROLE;

export function getRoleHome(role: User['role']): string {
  return HOME_BY_ROLE[role] || '/';
}

export function saveToken(token: string) {
  try { localStorage.setItem('auth:token', token); } catch {}
  return token;
}

export function getToken(): string | null {
  try { return localStorage.getItem('auth:token'); } catch { return null; }
}

// совместимость
export async function requestOtp(_args: { email: string }) { return { ok: true }; }
export async function verifyOtp(_args: { email: string; otp: string }) { return { ok: true }; }

export default {
  login,
  register,
  signIn,
  signUp,
  logout,
  currentUser,
  HOME: HOME_BY_ROLE,
  getRoleHome,
  saveToken,
  getToken,
  requestOtp,
  verifyOtp,
};
