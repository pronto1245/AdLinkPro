const HOME_BY_ROLE: Record<string, string> = {
  admin: '/dashboard/admin',
  user: '/dashboard/user',
  partner: '/dashboard/partner',
  owner: '/dashboard/owner',
  advertiser: '/dashboard/advertiser',
  super_admin: '/dashboard/super-admin',
  affiliate: '/dashboard/affiliate',
  staff: '/dashboard/staff',
};

export function getRoleHome(role: any) {
  const key = String(role || '').toLowerCase();
  return HOME_BY_ROLE[key] || '/dashboard/partner';
}

// Token management functions
export function saveToken(token: string): void {
  try {
    // Use consistent token key
    localStorage.setItem('token', token);
  } catch (error) {
    console.warn('Failed to save token to localStorage:', error);
  }
}

export function getToken(): string | null {
  try {
    // Check both keys for backward compatibility
    return localStorage.getItem('token') || localStorage.getItem('auth:token');
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
    return null;
  }
}

export function removeToken(): void {
  try {
    // Remove from both keys for backward compatibility
    localStorage.removeItem('token');
    localStorage.removeItem('auth:token');
  } catch (error) {
    console.warn('Failed to remove token from localStorage:', error);
  }
}

// User management functions
export function saveUser(user: any): void {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.warn('Failed to save user to localStorage:', error);
  }
}

export function getUser(): any | null {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.warn('Failed to get user from localStorage:', error);
    return null;
  }
}

export function removeUser(): void {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('auth:user');
  } catch (error) {
    console.warn('Failed to remove user from localStorage:', error);
  }
}

export function logout(): void {
  removeToken();
  removeUser();
  localStorage.removeItem('role');
}

async function json(url: string, body: any) {
  // Ваш код для функции json
}