import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PushNotificationProps {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  createdAt: string;
  onClose: () => void;
  onMarkAsRead?: () => void;
}

export function PushNotification({
  id: _id,
  type,
  title,
  message,
  metadata,
  createdAt,
  onClose,
  onMarkAsRead
}: PushNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Автоматическое скрытие через 7 секунд
    const hideTimer = setTimeout(() => {
      handleClose();
    }, 7000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Ждём завершения анимации
  };

  const getIcon = () => {
    switch (type) {
      case 'offer_request_approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'offer_request_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'general':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'offer_request_approved':
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'offer_request_rejected':
        return 'bg-red-100 text-red-800';
      case 'general':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeText = () => {
    switch (type) {
      case 'offer_request_approved':
        return 'Одобрено';
      case 'offer_request_rejected':
        return 'Отклонено';
      case 'payment':
        return 'Выплата';
      case 'general':
        return 'Системное';
      default:
        return 'Уведомление';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Card className="w-80 shadow-lg border-l-4 border-l-blue-500 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {title}
                </h4>
                <Badge className={`text-xs ${getBadgeColor()}`}>
                  {getBadgeText()}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                {message}
              </p>

              {metadata?.amount && (
                <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
                  <strong>Сумма:</strong> {metadata.amount} {metadata.currency || 'USD'}
                </div>
              )}

              {metadata?.rejectReason && (
                <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                  <strong>Причина:</strong> {metadata.rejectReason}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                    locale: ru
                  })}
                </span>

                <div className="flex gap-1">
                  {onMarkAsRead && (
                    <Button
                      onClick={onMarkAsRead}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      Прочитано
                    </Button>
                  )}
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Контейнер для множественных уведомлений
interface PushNotificationContainerProps {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
    created_at: string;
    is_read: boolean;
  }>;
  onMarkAsRead?: (id: string) => void;
  onRemove: (id: string) => void;
}

export function PushNotificationContainer({
  notifications,
  onMarkAsRead,
  onRemove
}: PushNotificationContainerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Показываем только непрочитанные уведомления
    const unreadNotifications = notifications
      .filter(n => !n.is_read)
      .slice(0, 3) // Максимум 3 уведомления одновременно
      .map(n => n.id);

    setVisibleNotifications(unreadNotifications);
  }, [notifications]);

  const handleClose = (id: string) => {
    setVisibleNotifications(prev => prev.filter(nId => nId !== id));
    setTimeout(() => onRemove(id), 300);
  };

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
      handleClose(id);
    }
  };

  return (
    <>
      {visibleNotifications.map((notificationId, index) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) {return null;}

        return (
          <div
            key={notification.id}
            style={{
              bottom: `${4 + index * 90}px`, // Располагаем уведомления друг над другом
            }}
            className="fixed right-4 z-50"
          >
            <PushNotification
              id={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              metadata={notification.metadata}
              createdAt={notification.created_at}
              onClose={() => handleClose(notification.id)}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
            />
          </div>
        );
      })}
    </>
  );
}
