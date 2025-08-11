import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/components/NotificationToast';

export interface WebSocketMessage {
  type: 'notification' | 'offer_access_request' | 'offer_access_response' | 'system' | 'auth_success' | 'ping' | 'pong';
  data: any;
  timestamp: string;
}

export function useWebSocket() {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const ws = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!user || ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState('connected');
        reconnectAttempts.current = 0;
        
        // Безопасная отправка аутентификации с проверкой состояния
        const token = localStorage.getItem('auth_token');
        if (token && ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'auth',
            token
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          // Тихо обрабатываем ошибки парсинга сообщений
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionState('disconnected');
        
        // Попытка переподключения
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        // Тихо обрабатываем WebSocket ошибки без вывода в консоль
        // console.error('WebSocket error:', error);
      };

    } catch (error) {
      // Тихо обрабатываем ошибки подключения WebSocket
      setConnectionState('disconnected');
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'offer_access_request':
        // Уведомление для рекламодателя о новом запросе
        if (user?.role === 'advertiser') {
          showNotification({
            type: 'info',
            title: 'Новый запрос доступа',
            message: `Партнёр ${message.data.partnerUsername} запросил доступ к офферу "${message.data.offerName}"`,
            duration: 8000,
            action: {
              label: 'Перейти к запросам',
              onClick: () => {
                window.location.href = '/advertiser/access-requests';
              }
            }
          });
        }
        break;
        
      case 'offer_access_response':
        // Уведомление для партнера об ответе на запрос
        if (user?.role === 'affiliate') {
          const isApproved = message.data.status === 'approved';
          showNotification({
            type: isApproved ? 'success' : 'error',
            title: isApproved ? 'Запрос одобрен' : 'Запрос отклонён',
            message: `Ваш запрос доступа к офферу "${message.data.offerName}" ${isApproved ? 'одобрен' : 'отклонён'}${message.data.responseMessage ? `: ${message.data.responseMessage}` : ''}`,
            duration: 10000,
            action: {
              label: 'Перейти к офферам',
              onClick: () => {
                window.location.href = '/affiliate/offers';
              }
            }
          });
        }
        break;
        
      case 'notification':
        // Общие системные уведомления
        showNotification({
          type: message.data.type || 'info',
          title: message.data.title,
          message: message.data.message,
          duration: message.data.duration || 5000
        });
        break;
        
      case 'auth_success':
        // Успешная аутентификация через WebSocket
        console.log('WebSocket authenticated successfully');
        break;
        
      default:
        // Только предупреждение для действительно неизвестных типов
        // Тихо игнорируем неизвестные типы сообщений
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setConnectionState('disconnected');
  };

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  return {
    connectionState,
    sendMessage,
    connect,
    disconnect
  };
}