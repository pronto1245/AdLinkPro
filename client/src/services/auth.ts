import { secureAuth } from '@/lib/secure-auth';

export async function login({ email, password }: { email: string; password: string }) {
  return secureAuth.login({
    email: email.trim(),
    password: password.trim(),
  });
}
