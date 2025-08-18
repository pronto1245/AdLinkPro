const HOME_BY_ROLE: Record<string, string> = {
  admin: '/dashboard/admin',
  user: '/dashboard/user',
  partner: '/dash',
};

export function getRoleHome(role: any) {
  const key = String(role || '').toLowerCase();
  return HOME_BY_ROLE[key] || '/dash';
}

async function json(url: string, body: any) {
  // Ваш код для функции json
}