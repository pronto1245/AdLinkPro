export function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (e: Event & { reason?: unknown; detail?: unknown }) => {
    const st = (e as { reason?: { status?: number }; detail?: { status?: number } })?.reason?.status ??
               (e as { reason?: { status?: number }; detail?: { status?: number } })?.detail?.status;
    if (st === 401 || st === 403) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth:token');
      } catch {
        // Ignore localStorage errors
      }
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      return;
    }
    console.warn('Unhandled rejection:', (e as { reason?: unknown }).reason ?? e);
  });
}

export function getErrorMessage(err: unknown): string {
  if (!err) {
    return 'Unexpected error';
  }
  if (typeof err === 'string') {
    return err;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return String(err);
}

export async function safeJsonParse<T = unknown>(x: unknown): Promise<T | undefined> {
  try {
    if (typeof x === 'string') {
      return JSON.parse(x) as T;
    }
    if (x && typeof x === 'object' && 'json' in x && typeof (x as { json: () => Promise<T> }).json === 'function') {
      return await (x as { json: () => Promise<T> }).json();
    }
  } catch {
    // Ignore JSON parsing errors
  }
  return undefined;
}

