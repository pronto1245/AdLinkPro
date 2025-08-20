export function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (e: any) => {
    const st = e?.reason?.status ?? e?.detail?.status;
    if (st === 401 || st === 403) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth:token');
      } catch {}
      if (location.pathname !== '/login') location.replace('/login');
      return;
    }
    console.warn('Unhandled rejection:', e?.reason ?? e);
  });
}

export function getErrorMessage(err: any): string {
  if (!err) return 'Unexpected error';
  if (typeof err === 'string') return err;
  if (err?.message) return err.message;
  return String(err);
}

export async function safeJsonParse<T = any>(x: any): Promise<T | undefined> {
  try {
    if (typeof x === 'string') return JSON.parse(x) as T;
    if (x?.json) return (await x.json()) as T;
  } catch {}
  return undefined;
}

