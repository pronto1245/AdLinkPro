import { api } from './api';

export type User = { id?: string; email: string; role: 'partner'|'advertiser'|'owner'|'super_admin'|'affiliate'; name?: string };
export type LoginArgs = { email: string; password: string; otp?: string; role?: User['role'] };
export type RegisterArgs = { email: string; password: string; name?: string; role?: User['role'] };

const HOME_BY_ROLE: Record<User['role'], string> = {
  partner: '/dash',
  advertiser: '/dashboard/advertiser',
  owner: '/dashboard/owner',
  super_admin: '/dashboard/super-admin',
  affiliate: '/dashboard/affiliate',
};

function persist(user: User, token?: string) {
  localStorage.setItem('auth:user', JSON.stringify(user));
  if (token) localStorage.setItem('auth:token', token);
  return { user, token, home: HOME_BY_ROLE[user.role] };
}

export async function login(args: LoginArgs): Promise<{user: User, token?: string}> {
  try {
    // Use centralized API function instead of direct fetch
    const data = await api('/api/auth/login', { 
      method: 'POST', 
      skipAuth: true,
      body: JSON.stringify(args) 
    });
    
    // Handle role mapping from server format to client format
    let clientRole: User['role'] = 'partner'; // default
    
    if (data.user && data.user.role) {
      const roleMap: Record<string, User['role']> = {
        'OWNER': 'owner',
        'ADVERTISER': 'advertiser',
        'PARTNER': 'partner',
        'SUPER_ADMIN': 'super_admin',
        'AFFILIATE': 'affiliate',
      };
      clientRole = roleMap[data.user.role] || 'partner';
    }
    
    const user: User = { 
      email: data.user?.email || args.email, 
      role: clientRole,
      name: data.user?.username
    };
    const token: string | undefined = data.token;
    persist(user, token);
    return { user, token };
  } catch {
    // fallback mock
    const user: User = { email: args.email, role: (args.role ?? 'partner') };
    persist(user, 'dev-token');
    return { user, token: 'dev-token' };
  }
}

export async function register(args: RegisterArgs): Promise<{user: User}> {
  try {
    // Use centralized API function instead of direct fetch
    const data = await api('/api/register', { 
      method: 'POST', 
      skipAuth: true,
      body: JSON.stringify(args) 
    });
    const user: User = data.user ?? { email: args.email, role: (data.role ?? args.role ?? 'partner'), name: args.name };
    return { user };
  } catch {
    // fallback mock
    const user: User = { email: args.email, role: (args.role ?? 'partner'), name: args.name };
    return { user };
  }
}

export function logout() {
  localStorage.removeItem('auth:user');
  localStorage.removeItem('auth:token');
}

export function getCurrentUser(): User | null {
  try { return JSON.parse(localStorage.getItem('auth:user') || 'null'); } catch { return null; }
}

export const HOME = HOME_BY_ROLE;
