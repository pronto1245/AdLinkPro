import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Check, X, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'offer_request_approved' | 'offer_request_rejected' | 'offer_request_created' | 'general' | 'payment';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    offerId?: string;
    offerName?: string;
    requestId?: string;
    rejectReason?: string;
    amount?: number;
    currency?: string;
    method?: string;
  };
}

export default function PartnerNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // CRITICAL DEBUG: Проверяем токен в компоненте
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('🔍 PartnerNotifications component - token check:', {
      token: token ? token.substring(0, 20) + '...' : 'NO_TOKEN',
      user: user?.username
    });
  }, [user]);

  // Получение уведомлений
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user?.id,
  });

  // Функция для получения токена
  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    console.log('🔍 Getting auth token:', {
      hasToken: !!token,
      isNull: token === 'null',
      isEmpty: token === '',
      tokenStart: token ? token.substring(0, 20) : 'NO_TOKEN'
    });
    return token && token !== 'null' && token !== 'undefined' && token.trim() !== '' ? token : null;
  };

  // Мутация для отметки как прочитанное - ПОЛНОСТЬЮ ПЕРЕПИСАНА
  const markAsReadMutation = useMutation({
    mutationKey: ['markAsRead'],
    mutationFn: async (notificationId: string) => {
      console.log('🚀 Starting markAsRead mutation for:', notificationId);

      const authToken = getAuthToken();
      if (!authToken) {
        console.error('❌ No valid auth token found');
        throw new Error('Authentication required - please re-login');
      }

      console.log('✅ Valid token found, making request...');

      try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        console.log('📡 Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Request failed:', { status: response.status, error: errorText });
          throw new Error(`Failed to mark as read: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Mark as read successful:', result);
        return result;
      } catch (error) {
        console.error('❌ Network error in markAsRead:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      // Также обновляем дашборд для синхронизации
      queryClient.invalidateQueries({ queryKey: ['/api/partner/dashboard'] });
    },
    onError: (_error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отметить уведомление как прочитанное',
        variant: 'destructive',
      });
    },
  });

  // Мутация для удаления уведомления
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // CRITICAL FIX: Получаем свежий токен прямо в мутации
      const token = localStorage.getItem('auth_token');
      if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No valid token found');
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      // Также обновляем дашборд для синхронизации
      queryClient.invalidateQueries({ queryKey: ['/api/partner/dashboard'] });
      toast({
        title: 'Успех',
        description: 'Уведомление удалено',
      });
    },
    onError: (_error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить уведомление',
        variant: 'destructive',
      });
    },
  });

  // Мутация для отметки всех как прочитанные
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/notifications/mark-all-read', 'PUT');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'Успех',
        description: 'Все уведомления отмечены как прочитанные',
      });
    },
    onError: (_error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отметить уведомления как прочитанные',
        variant: 'destructive',
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer_request_approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'offer_request_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'offer_request_created':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'offer_request_approved':
        return <Badge className="bg-green-100 text-green-800">Одобрено</Badge>;
      case 'offer_request_rejected':
        return <Badge className="bg-red-100 text-red-800">Отклонено</Badge>;
      case 'offer_request_created':
        return <Badge className="bg-blue-100 text-blue-800">Новый запрос</Badge>;
      case 'payment':
        return <Badge className="bg-green-100 text-green-800">Выплата</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Общее</Badge>;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {unreadCount} непрочитанных
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            variant="outline"
            size="sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Отметить все как прочитанные
          </Button>
        )}
      </div>

      {/* Список уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle>Все уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Уведомлений нет</h3>
              <p className="text-gray-600">Здесь будут отображаться уведомления о статусе ваших запросов на офферы</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.is_read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${notification.is_read ? 'text-gray-900' : 'text-blue-900'}`}>
                            {notification.title}
                          </h4>
                          {getNotificationBadge(notification.type)}
                        </div>
                        <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-blue-700'}`}>
                          {notification.message}
                        </p>
                        {notification.metadata?.rejectReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                            <strong>Причина отклонения:</strong> {notification.metadata.rejectReason}
                          </div>
                        )}
                        {notification.metadata?.amount && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                            <strong>Сумма:</strong> {notification.metadata.amount} {notification.metadata.currency || 'USD'}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ru
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {!notification.is_read && (
                        <Button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteNotification(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
