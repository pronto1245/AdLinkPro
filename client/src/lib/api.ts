const API = import.meta.env.VITE_API_BASE || '';

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) throw new Error(`http_${res.status}`);
  return res.json();
}

export type LoginResponse = {
  token: string;
  user: { 
    id: string;
    sub?: number; // Keep for backward compatibility
    email: string; 
    role: string; 
    username: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    language?: string;
    currency?: string;
    timezone?: string;
    phone?: string;
    telegram?: string;
    telegramChatId?: number;
    country?: string;
    advertiserId?: string;
    settings?: {
      brandName?: string;
      brandDescription?: string;
      brandLogo?: string;
      vertical?: string;
      partnerRules?: string;
      notifications?: {
        email: boolean;
        telegram: boolean;
        sms: boolean;
      };
    };
  };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('login_failed');
  return res.json();
}
