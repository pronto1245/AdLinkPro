/**
 * Shared navigation utilities to avoid code duplication across components
 */

export interface User {
  role?: string;
  email?: string;
  name?: string;
  username?: string;
}

/**
 * Determine the correct dashboard href based on user role
 */
export function getDashboardHref(user?: User | null): string {
  if (!user?.role) {return '/dashboard';}

  const roleMap: Record<string, string> = {
    'partner': '/dashboard/partner',
    'affiliate': '/dashboard/affiliate',
    'advertiser': '/dashboard/advertiser',
    'owner': '/dashboard/owner',
    'super_admin': '/dashboard/super-admin',
    'staff': '/dashboard/staff',
  };

  return roleMap[user.role] || '/dashboard';
}

/**
 * Handle logout with optional cleanup callback
 */
export function createLogoutHandler(logout: () => void, onComplete?: () => void) {
  return () => {
    logout();
    if (onComplete) {onComplete();}
  };
}

/**
 * Get user display name with fallback
 */
export function getUserDisplayName(user?: User | null): string {
  if (!user) {return 'Пользователь';}

  if (user.name) {return user.name;}
  if (user.username) {return user.username;}
  if (user.email) {return user.email.split('@')[0];}

  return 'Пользователь';
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(user?: User | null): string {
  if (!user) {return 'U';}

  if (user.name) {
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return 'U';
}

/**
 * Get role display name in Russian
 */
export function getRoleDisplayName(role?: string): string {
  if (!role) {return 'Пользователь';}

  const roleMap: Record<string, string> = {
    'super_admin': 'Супер админ',
    'owner': 'Владелец',
    'advertiser': 'Рекламодатель',
    'affiliate': 'Партнёр',
    'partner': 'Партнёр',
    'staff': 'Персонал',
  };

  return roleMap[role] || role;
}
