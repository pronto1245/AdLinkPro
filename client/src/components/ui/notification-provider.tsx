import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PushNotificationContainer } from './push-notification';
import { useAuth } from '@/contexts/auth-context';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  showPushNotifications: boolean;
  togglePushNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPushNotifications, setShowPushNotifications] = useState(true);
  const [displayedNotifications, setDisplayedNotifications] = useState<string[]>([]);

  // Fetch notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      // CRITICAL FIX: Используем правильный ключ токена
      const token = localStorage.getItem('auth_token');
      console.log('🔍 NotificationProvider markAsRead - token check:', { 
        token: token ? token.substring(0, 20) + '...' : 'NO_TOKEN' 
      });
      
      if (!token || token === 'null' || token === 'undefined') {
        // Тихо обрабатываем отсутствие токена
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 NotificationProvider response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        // Тихо обрабатываем ошибки API
        throw new Error('Failed to mark notification as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Remove notification from display
  const removeNotification = (id: string) => {
    setDisplayedNotifications(prev => prev.filter(nId => nId !== id));
  };

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const togglePushNotifications = () => {
    setShowPushNotifications(prev => !prev);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Отслеживаем новые уведомления для показа push-уведомлений
  useEffect(() => {
    const newNotifications = notifications
      .filter(n => !n.is_read && !displayedNotifications.includes(n.id))
      .slice(0, 3); // Максимум 3 новых уведомления

    if (newNotifications.length > 0 && showPushNotifications) {
      const newIds = newNotifications.map(n => n.id);
      setDisplayedNotifications(prev => [...prev, ...newIds]);
    }
  }, [notifications, displayedNotifications, showPushNotifications]);

  // WebSocket для real-time уведомлений
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`${import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws') || (import.meta.env.DEV ? 'ws://localhost:5000' : `ws://${window.location.host}`)}/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Безопасная аутентификация с проверкой состояния
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: localStorage.getItem('auth_token')
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'notification') {
          // Новое уведомление пришло через WebSocket
          console.log('New notification received:', message.data);
          
          // Обновляем кеш уведомлений
          queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        } else if (message.type === 'auth_success') {
          console.log('WebSocket authenticated successfully');
        }
      } catch (error) {
        // Тихо обрабатываем ошибки парсинга WebSocket сообщений
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      // Тихо обрабатываем ошибки WebSocket подключения
    };

    return () => {
      ws.close();
    };
  }, [user, queryClient]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    removeNotification,
    showPushNotifications,
    togglePushNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Push Notifications Container */}
      {showPushNotifications && (
        <PushNotificationContainer
          notifications={notifications.filter(n => 
            !n.is_read && displayedNotifications.includes(n.id)
          )}
          onMarkAsRead={markAsRead}
          onRemove={removeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}