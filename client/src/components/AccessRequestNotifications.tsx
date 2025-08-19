import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AccessRequestNotificationProps {
  userId: string;
  userRole: 'affiliate' | 'advertiser' | 'super_admin';
}

export function AccessRequestNotifications({ userId, userRole }: AccessRequestNotificationProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Setup WebSocket connection for real-time notifications
    const ws = new WebSocket(
      process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:3000/ws' 
        : `wss://${window.location.host}/ws`
    );

    ws.onopen = () => {
      console.log('Access requests notifications connected');
      // Subscribe to access request events
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'access_requests',
        userId,
        userRole
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'access_request_notification') {
          handleAccessRequestNotification(data.payload);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Access requests notifications disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [userId, userRole]);

  const handleAccessRequestNotification = (payload: any) => {
    const { action, requestId, offerName, partnerName, advertiserName } = payload;

    switch (action) {
      case 'request_created':
        if (userRole === 'advertiser') {
          toast({
            title: 'Новый запрос доступа',
            description: `Партнер ${partnerName} запрашивает доступ к офферу "${offerName}"`,
            action: {
              altText: 'Посмотреть',
              onClick: () => {
                window.location.href = `/advertiser/access-requests?filter=${requestId}`;
              }
            }
          });
        }
        break;

      case 'request_approved':
        if (userRole === 'affiliate') {
          toast({
            title: 'Запрос одобрен! 🎉',
            description: `Ваш запрос на доступ к офферу "${offerName}" был одобрен`,
            action: {
              altText: 'Забрать ссылку',
              onClick: () => {
                window.location.href = `/affiliate/offers?search=${offerName}`;
              }
            }
          });
        }
        break;

      case 'request_rejected':
        if (userRole === 'affiliate') {
          toast({
            title: 'Запрос отклонен',
            description: `Ваш запрос на доступ к офферу "${offerName}" был отклонен`,
            variant: 'destructive',
            action: {
              altText: 'Подробнее',
              onClick: () => {
                window.location.href = `/affiliate/access-requests?filter=${requestId}`;
              }
            }
          });
        }
        break;

      case 'access_revoked':
        if (userRole === 'affiliate') {
          toast({
            title: 'Доступ отозван',
            description: `Доступ к офферу "${offerName}" был отозван рекламодателем`,
            variant: 'destructive'
          });
        }
        break;

      default:
        console.log('Unknown access request notification:', action);
    }
  };

  return null; // This is a notification handler component, no UI
}

export default AccessRequestNotifications;