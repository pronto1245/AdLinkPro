if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.error('window.onerror:', (e as any).error || (e as any).message || e);
  });
  window.addEventListener('unhandledrejection', (e:any) => {
    console.error('unhandledrejection:', e.reason || e);
  });
}
