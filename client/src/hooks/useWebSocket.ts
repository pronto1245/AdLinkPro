import { useEffect, useRef } from 'react';

export function useWebSocket(token?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // В проде отключено, пока не зададим VITE_WS_URL
    const WS_URL = import.meta?.env?.VITE_WS_URL as string | undefined;
    if (!WS_URL) return;

    if (!token || wsRef.current) return;
    try {
      const url = new URL(WS_URL);
      if (token) url.searchParams.set('token', token);
      const ws = new WebSocket(url.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        // console.debug('WS open');
      };
      ws.onmessage = () => {
        // console.debug('WS message', ev.data);
      };
      ws.onerror = () => {
        // console.debug('WS error', err);
      };
      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch {
      // ignore
    }

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [token]);
}

// На всякий случай — дефолтный экспорт тоже
export default useWebSocket;
