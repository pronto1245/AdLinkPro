export async function fetchJSON<T>(url: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET');
  if (typeof method !== 'string') {throw new Error('Invalid method type');}
  
  const res = await fetch(url, { ...init, method });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${errorText}`);
  }
  
  return res.json().catch(() => ({})) as Promise<T>;
}