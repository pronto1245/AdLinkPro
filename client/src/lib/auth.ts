export type User = { id?: string; email: string; role: 'partner'|'advertiser'|'owner'|'super_admin'; name?: string };
export type LoginArgs = { email: string; password: string; otp?: string; role?: User['role'] };
export type RegisterArgs = { email: string; password: string; name?: string; role?: User['role'] };

const HOME_BY_ROLE: Record<User['role'], string> = {
  partner: '/dash/partner',
  advertiser: '/dash/advertiser',
  owner: '/dash/owner',
  super_admin: '/dash/super-admin',
};

function persist(user: User, token?: string) {
  localStorage.setItem('auth:user', JSON.stringify(user));
  if (token) localStorage.setItem('auth:token', token);
  return { user, token, home: HOME_BY_ROLE[user.role] };
}

export async function login(args: LoginArgs): Promise<{user: User, token?: string}> {
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    if (!res.ok) throw new Error('login failed');
    const data = await res.json();
    const user: User = data.user ?? { email: args.email, role: (data.role ?? args.role ?? 'partner') };
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
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    if (!res.ok) throw new Error('register failed');
    const data = await res.json();
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
