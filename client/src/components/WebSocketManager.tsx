import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    url: string;
  };
}

interface SystemUpdateData {
  entity: string;
  action: string;
  entityId?: string;
  data?: any;
}

export function WebSocketManager() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const handleNotification = useCallback((data: NotificationData) => {
    // Show toast notification
    toast({
      title: data.title,
      description: data.message,
      variant: data.type === 'error' ? 'destructive' : 'default',
      action: data.action ? {
        altText: data.action.label,
        onClick: () => window.location.href = data.action!.url
      } : undefined
    });

    // Store notification in localStorage for persistence
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({
      ...data,
      timestamp: new Date().toISOString(),
      read: false
    });
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Trigger custom event for notification listeners
    window.dispatchEvent(new CustomEvent('newNotification', { detail: data }));
  }, [toast]);

  const handleSystemUpdate = useCallback((data: SystemUpdateData) => {
    // Handle real-time data updates
    switch (data.entity) {
      case 'offer':
        // Invalidate offer-related queries
        window.dispatchEvent(new CustomEvent('invalidateQuery', { 
          detail: { queryKey: ['offers'] } 
        }));
        break;
      case 'statistics':
        // Update dashboard data
        window.dispatchEvent(new CustomEvent('invalidateQuery', { 
          detail: { queryKey: ['dashboard-stats'] } 
        }));
        break;
      case 'payout':
        // Update financial data
        window.dispatchEvent(new CustomEvent('invalidateQuery', { 
          detail: { queryKey: ['finances'] } 
        }));
        break;
      case 'postback':
        // Update postback delivery status
        window.dispatchEvent(new CustomEvent('invalidateQuery', { 
          detail: { queryKey: ['postback-logs'] } 
        }));
        break;
    }

    // Show system update notification if significant
    if (['offer', 'payout'].includes(data.entity)) {
      const messages = {
        offer: {
          created: t('notifications.offerCreated', 'New offer available'),
          updated: t('notifications.offerUpdated', 'Offer updated'),
          approved: t('notifications.offerApproved', 'Offer access approved'),
          rejected: t('notifications.offerRejected', 'Offer access rejected')
        },
        payout: {
          processed: t('notifications.payoutProcessed', 'Payout processed'),
          approved: t('notifications.payoutApproved', 'Payout approved'),
          rejected: t('notifications.payoutRejected', 'Payout rejected')
        }
      };

      const message = messages[data.entity as keyof typeof messages]?.[data.action as string];
      if (message) {
        toast({
          title: t('notifications.systemUpdate', 'System Update'),
          description: message,
          variant: 'default'
        });
      }
    }
  }, [t, toast]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      console.debug('WebSocket message received:', message);

      switch (message.type) {
        case 'notification':
          handleNotification(message.data);
          break;
        case 'system_update':
          handleSystemUpdate(message.data);
          break;
        case 'ping':
          // Respond to ping with pong
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'pong' }));
          }
          break;
        case 'auth_required':
          // Handle authentication requirement
          console.warn('WebSocket authentication required');
          break;
        default:
          console.debug('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [handleNotification, handleSystemUpdate]);

  const connect = useCallback(() => {
    // In production, WebSocket should be disabled unless VITE_WS_URL is set
    const WS_URL = import.meta.env?.VITE_WS_URL as string | undefined;
    if (!WS_URL) {
      console.debug('WebSocket disabled: VITE_WS_URL not configured');
      return;
    }

    if (!token || wsRef.current) return;

    try {
      const url = new URL(WS_URL);
      if (token) url.searchParams.set('token', token);
      if (user?.id) url.searchParams.set('userId', user.id);
      
      const ws = new WebSocket(url.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.debug('WebSocket connected');
        reconnectAttemptsRef.current = 0;
        
        // Send initial authentication
        ws.send(JSON.stringify({
          type: 'auth',
          data: {
            token,
            userId: user?.id,
            role: user?.role,
            timestamp: new Date().toISOString()
          }
        }));

        // Send periodic heartbeat
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          } else {
            clearInterval(heartbeat);
          }
        }, 30000);
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.debug('WebSocket disconnected:', event.code, event.reason);
        wsRef.current = null;

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.debug(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Max WebSocket reconnection attempts reached');
          toast({
            title: t('errors.connectionLost', 'Connection Lost'),
            description: t('errors.connectionLostDesc', 'Real-time updates disabled. Please refresh the page.'),
            variant: 'destructive'
          });
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [token, user, handleMessage, toast, t]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    reconnectAttemptsRef.current = 0;
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Expose WebSocket status to global scope for debugging
  useEffect(() => {
    (window as any).__wsStatus = () => ({
      connected: wsRef.current?.readyState === WebSocket.OPEN,
      readyState: wsRef.current?.readyState,
      url: wsRef.current?.url,
      reconnectAttempts: reconnectAttemptsRef.current
    });
  }, []);

  return null;
}

export default WebSocketManager;
