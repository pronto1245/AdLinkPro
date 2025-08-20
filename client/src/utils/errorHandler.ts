export function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (e: any) => {
    const st = e?.reason?.status ?? e?.detail?.status;
    if (st === 401 || st === 403) {
      try { localStorage.removeItem('token'); localStorage.removeItem('auth:token'); } catch {}
      if (location.pathname !== '/login') location.replace('/login');
      return;
    }
    console.warn('Unhandled rejection:', e?.reason ?? e);
  });
}
