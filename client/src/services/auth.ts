const HOME_BY_ROLE: Record<string, string> = {
  admin: '/dashboard/admin',
  user: '/dashboard/user',
  partner: '/dash',
  owner: '/dashboard/owner',
  advertiser: '/dashboard/advertiser',
  super_admin: '/dashboard/super-admin',
};

export function getRoleHome(role: any) {
  const key = String(role || '').toLowerCase();
  return HOME_BY_ROLE[key] || '/dash';
}

// Token management functions
export function saveToken(token: string): void {
  try {
    localStorage.setItem('auth:token', token);
  } catch (error) {
    console.warn('Failed to save token to localStorage:', error);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem('auth:token');
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
    return null;
  }
}

export function removeToken(): void {
  try {
    localStorage.removeItem('auth:token');
  } catch (error) {
    console.warn('Failed to remove token from localStorage:', error);
  }
}

// User management functions
export function saveUser(user: any): void {
  try {
    localStorage.setItem('auth:user', JSON.stringify(user));
  } catch (error) {
    console.warn('Failed to save user to localStorage:', error);
  }
}

export function getUser(): any | null {
  try {
    const user = localStorage.getItem('auth:user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.warn('Failed to get user from localStorage:', error);
    return null;
  }
}

export function removeUser(): void {
  try {
    localStorage.removeItem('auth:user');
  } catch (error) {
    console.warn('Failed to remove user from localStorage:', error);
  }
}

export function logout(): void {
  removeToken();
  removeUser();
}

async function json(url: string, body: any) {
  // Ваш код для функции json
}