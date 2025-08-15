import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function useWebSocket() {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // В проде не коннектимся, если нет явного VITE_WS_URL.
    if (import.meta.env.PROD && !import.meta.env.VITE_WS_URL) {
      return;
    }

    const base =
      import.meta.env.VITE_WS_URL ||
      (location.protocol === 'https:' ? `wss://${location.host}` : `ws://${location.host}`);

    const url = `${base}/ws${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // console.debug('WS connected');
      };
      ws.onmessage = () => {};
      ws.onerror = () => {
        // Тихо. Не спамим консоль.
      };
      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch {
      // игнор
    }

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [token]);
}
