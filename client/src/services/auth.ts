import { login } from '@/lib/secureAuth'
import { HOME_BY_ROLE, saveUserToStorage } from '@/lib/auth'

export async function doLogin({ email, password }: { email: string, password: string }) {
  const res = await login({ email, password })
  if (res.token && res.user) {
    saveUserToStorage(res.user, res.token)
    return HOME_BY_ROLE[res.user.role] || '/dashboard'
  } else {
    throw new Error('Login failed: Invalid response')
  }
}
