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
        console.error('❌ No valid token in NotificationProvider');
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
        console.error('❌ NotificationProvider request failed:', response.status, errorText);
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
    if (!user) {return;}

    // Use environment variable or fallback to localhost in development
    const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'ws://localhost:5000/ws' : null);

    if (!WS_URL) {
      console.log('WebSocket disabled: VITE_WS_URL not configured for production');
      return;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Аутентификация
      ws.send(JSON.stringify({
        type: 'auth',
        token: localStorage.getItem('auth_token')
      }));
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
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
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
