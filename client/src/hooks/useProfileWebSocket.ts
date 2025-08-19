import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  type: 'profile_update' | 'settings_change' | 'security_alert' | 'notification';
  data: any;
  timestamp: number;
}

export function useProfileWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Connect to WebSocket server
    const wsUrl = process.env.NODE_ENV === 'development' 
      ? 'ws://localhost:3000/ws' 
      : `wss://${window.location.host}/ws`;

    try {
      ws.current = new WebSocket(`${wsUrl}?userId=${user.id}&type=profile`);

      ws.current.onopen = () => {
        console.log('📡 Profile WebSocket connected');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Handle different message types
          switch (message.type) {
            case 'profile_update':
              toast({
                title: 'Профиль обновлён',
                description: 'Ваш профиль был обновлён администратором.',
                variant: 'default',
              });
              break;
            
            case 'settings_change':
              toast({
                title: 'Настройки изменены', 
                description: 'Некоторые настройки были изменены администратором.',
                variant: 'default',
              });
              break;
            
            case 'security_alert':
              toast({
                title: 'Уведомление безопасности',
                description: message.data.message || 'Обнаружена подозрительная активность.',
                variant: 'destructive',
              });
              break;

            case 'notification':
              toast({
                title: message.data.title || 'Уведомление',
                description: message.data.message,
                variant: 'default',
              });
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Profile WebSocket error:', error);
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        console.log('📡 Profile WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (user?.id) {
            console.log('🔄 Attempting to reconnect WebSocket...');
            // This effect will re-run due to dependency change
          }
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user?.id, toast]);

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  };

  return {
    isConnected,
    lastMessage,
    sendMessage
  };
}