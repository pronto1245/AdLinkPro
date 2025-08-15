import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import useWebSocket from '@/hooks/useWebSocket';

export function WebSocketManager() {
  const { token } = useAuth();
  useWebSocket(token || undefined);
  return null;
}
export default WebSocketManager;
