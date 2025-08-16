import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Bell, Check, X, Clock, AlertCircle, CheckCircle2, XCircle, Trash2, CheckCheck } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/auth-context";
import { apiRequest } from "../../lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Notification {
  id: string;
  type: 'offer_request_approved' | 'offer_request_rejected' | 'offer_request_created' | 'general' | 'payment' | 'partner_joined' | 'offer_paused' | 'antifraud_alert';
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
    partnerId?: string;
    partnerName?: string;
    alertType?: string;
  };
}

export default function AdvertiserNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // Получение уведомлений
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user?.id,
  });

  // Функция для получения токена
  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    return token && token !== 'null' && token !== 'undefined' && token.trim() !== '' ? token : null;
  };

  // Мутация для отметки как прочитанное
  const markAsReadMutation = useMutation({
    mutationKey: ['markAsRead'],
    mutationFn: async (notificationId: string) => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Authentication required - please re-login');
      }

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "✅ Успешно",
        description: "Уведомление отмечено как прочитанное",
        variant: "default"
      });
    },
    onError: (error: any) => {
      // Тихо обрабатываем ошибки отметки как прочитанное
      toast({
        title: "❌ Ошибка",
        description: error.message || "Не удалось отметить уведомление",
        variant: "destructive"
      });
    }
  });

  // Мутация для удаления уведомления
  const deleteMutation = useMutation({
    mutationKey: ['deleteNotification'],
    mutationFn: async (notificationId: string) => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Authentication required - please re-login');
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "✅ Удалено",
        description: "Уведомление успешно удалено",
        variant: "default"
      });
    },
    onError: (error: any) => {
      // Тихо обрабатываем ошибки удаления
      toast({
        title: "❌ Ошибка",
        description: error.message || "Не удалось удалить уведомление",
        variant: "destructive"
      });
    }
  });

  // Мутация для отметки всех как прочитанных
  const markAllAsReadMutation = useMutation({
    mutationKey: ['markAllAsRead'],
    mutationFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Authentication required - please re-login');
      }

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "✅ Выполнено",
        description: "Все уведомления отмечены как прочитанные",
        variant: "default"
      });
    }
  });

  // Получение иконки по типу уведомления
  const getNotificationIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'offer_request_approved':
        return <CheckCircle2 className={`${iconClass} text-green-500`} />;
      case 'offer_request_rejected':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'offer_request_created':
        return <Clock className={`${iconClass} text-blue-500`} />;
      case 'payment':
        return <CheckCircle2 className={`${iconClass} text-green-500`} />;
      case 'partner_joined':
        return <CheckCircle2 className={`${iconClass} text-blue-500`} />;
      case 'offer_paused':
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      case 'antifraud_alert':
        return <XCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  // Получение цвета бейджа по типу
  const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'offer_request_approved':
      case 'payment':
      case 'partner_joined':
        return 'default';
      case 'offer_request_rejected':
      case 'antifraud_alert':
        return 'destructive';
      case 'offer_request_created':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Получение текста типа на русском
  const getTypeText = (type: string) => {
    switch (type) {
      case 'offer_request_approved':
        return 'Заявка одобрена';
      case 'offer_request_rejected':
        return 'Заявка отклонена';
      case 'offer_request_created':
        return 'Новая заявка';
      case 'payment':
        return 'Платеж';
      case 'partner_joined':
        return 'Новый партнер';
      case 'offer_paused':
        return 'Оффер приостановлен';
      case 'antifraud_alert':
        return 'Антифрод';
      case 'general':
        return 'Общее';
      default:
        return 'Уведомление';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Загрузка уведомлений...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Уведомления</h1>
            <p className="text-muted-foreground">
              Системные уведомления и оповещения
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {unreadCount} непрочитанных
            </Badge>
          )}
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
            variant="outline"
            size="sm"
            title="Отметить все как прочитанные"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Отметить все
          </Button>
        </div>
      </div>

      {/* Уведомления */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Все уведомления ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Уведомлений пока нет</p>
              <p className="text-sm text-muted-foreground">
                Здесь будут отображаться системные оповещения
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Статус</TableHead>
                  <TableHead className="w-[120px]">Тип</TableHead>
                  <TableHead>Сообщение</TableHead>
                  <TableHead className="w-[150px]">Дата</TableHead>
                  <TableHead className="w-[120px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow 
                    key={notification.id}
                    className={`transition-colors ${
                      !notification.is_read 
                        ? 'bg-blue-50/80 dark:bg-blue-950/30 border-l-4 border-l-blue-500' 
                        : 'bg-gray-50/30 dark:bg-gray-800/20 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        )}
                        {getNotificationIcon(notification.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getBadgeVariant(notification.type)} 
                        className={`text-xs ${!notification.is_read ? 'ring-2 ring-blue-200' : ''}`}
                      >
                        {getTypeText(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`${!notification.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        <div className={`${!notification.is_read ? 'font-bold' : 'font-medium'}`}>
                          {notification.title}
                        </div>
                        <div className={`text-sm mt-1 ${!notification.is_read ? 'text-gray-700 dark:text-gray-200' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </div>
                        {notification.metadata && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.metadata.offerName && (
                              <span>Оффер: {notification.metadata.offerName}</span>
                            )}
                            {notification.metadata.partnerName && (
                              <span>Партнер: {notification.metadata.partnerName}</span>
                            )}
                            {notification.metadata.amount && (
                              <span>Сумма: {notification.metadata.amount} {notification.metadata.currency}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${!notification.is_read ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-muted-foreground'}`}>
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ru
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!notification.is_read ? (
                          <Button
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
                            title="Отметить как прочитанное"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Прочитано
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Прочитано
                          </Badge>
                        )}
                        <Button
                          onClick={() => deleteMutation.mutate(notification.id)}
                          disabled={deleteMutation.isPending}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Удалить уведомление"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}