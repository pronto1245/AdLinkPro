import { useEffect, useRef } from 'react';

function resolveWsUrl(): string | null {
  // 1) Явная переменная окружения побеждает всегда
  const envUrl = (import.meta as any).env?.VITE_WS_URL?.trim?.();
  if (envUrl) return envUrl;

  // 2) DEV → localhost
  if (!(import.meta as any).env?.PROD) {
    return 'ws://localhost:5000/ws';
  }

  // 3) PROD → тот же хост, wss, путь /ws (Netlify redirect прокинет на Koyeb)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (typeof window !== 'undefined' && isHttps) {
    return `wss://${window.location.host}/ws`;
  }

  // если почему-то не https в проде — не подключаемся
  return null;
}

export function useWebSocket(token?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = resolveWsUrl();
    // Нет URL → выходим молча (напр., бэк без сокетов)
    if (!url || !token) return;

    try {
      const wsUrl = `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // console.log('[WS] open');
      };
      ws.onmessage = () => {
        // тихо
      };
      ws.onerror = () => {
        // тихо
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

export default useWebSocket;
