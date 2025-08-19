export function urlJoin(base: string, path: string) {
  const b = String(base || '').replace(/\/+$/, '');
  let p = String(path || '').replace(/^\/+/, '/');
  if (b.endsWith('/api') && p.startsWith('/api/')) p = p.replace(/^\/api/, '');
  return b + p;
}
