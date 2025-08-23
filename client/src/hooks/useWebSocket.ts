import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketHookOptions {
  token?: string;
  userId?: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface WebSocketHookReturn {
  isConnected: boolean;
  connectionState: number;
  sendMessage: (message: any) => boolean;
  connect: () => void;
  disconnect: () => void;
  lastMessage: any;
}

export function useWebSocket(
  url?: string | null,
  options: WebSocketHookOptions = {}
): WebSocketHookReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<number>(WebSocket.CLOSED);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const {
    token,
    userId,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 3000
  } = options;

  const sendMessage = useCallback((message: any): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      setLastMessage(data);
      onMessage?.(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      setLastMessage(event.data);
      onMessage?.(event.data);
    }
  }, [onMessage]);

  const handleError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
    onError?.(error);
  }, [onError]);

  const handleOpen = useCallback(() => {
    console.debug('WebSocket connection opened');
    setIsConnected(true);
    setConnectionState(WebSocket.OPEN);
    reconnectAttemptsRef.current = 0;
    onOpen?.();
  }, [onOpen]);

  const handleClose = useCallback((event: CloseEvent) => {
    console.debug('WebSocket connection closed:', event.code, event.reason);
    setIsConnected(false);
    setConnectionState(WebSocket.CLOSED);
    wsRef.current = null;
    onClose?.(event);

    // Attempt to reconnect if enabled and not intentionally closed
    if (reconnect && event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;
      console.debug(`Attempting WebSocket reconnection... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, reconnectDelay * reconnectAttemptsRef.current);
    }
  }, [onClose, reconnect, maxReconnectAttempts, reconnectDelay]);

  const connect = useCallback(() => {
    // Use provided URL or fall back to environment variable
    const WS_URL = url || import.meta?.env?.VITE_WS_URL as string | undefined;
    if (!WS_URL) {
      console.debug('WebSocket disabled: No URL provided and VITE_WS_URL not configured');
      return;
    }

    if (!token || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsUrl = new URL(WS_URL);
      if (token) {wsUrl.searchParams.set('token', token);}
      if (userId) {wsUrl.searchParams.set('userId', userId);}
      
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;
      
      setConnectionState(WebSocket.CONNECTING);

      ws.onopen = handleOpen;
      ws.onmessage = handleMessage;
      ws.onerror = handleError;
      ws.onclose = handleClose;

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState(WebSocket.CLOSED);
    }
  }, [url, token, userId, handleOpen, handleMessage, handleError, handleClose]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
    setIsConnected(false);
    setConnectionState(WebSocket.CLOSED);
  }, []);

  useEffect(() => {
    if (url && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, token, connect, disconnect]);

  // Update connection state when WebSocket state changes
  useEffect(() => {
    const updateConnectionState = () => {
      if (wsRef.current) {
        setConnectionState(wsRef.current.readyState);
        setIsConnected(wsRef.current.readyState === WebSocket.OPEN);
      }
    };

    const interval = setInterval(updateConnectionState, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    connectionState,
    sendMessage,
    connect,
    disconnect,
    lastMessage
  };
}

// На всякий случай — дефолтный экспорт тоже
export default useWebSocket;
