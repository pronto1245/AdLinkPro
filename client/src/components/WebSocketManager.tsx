import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

// Компонент для инициализации WebSocket соединения
export function WebSocketManager() {
  useWebSocket(); // Просто инициализируем WebSocket
  
  return null; // Этот компонент ничего не рендерит
}