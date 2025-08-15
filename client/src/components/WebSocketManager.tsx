import React, { useEffect } from "react";
import { useAuth } from "../contexts/auth-context";

export const WebSocketManager: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // WebSocket logic будет добавлена позже - временно отключена
    console.log("WebSocket Manager initialized for user:", user.username);
    
    // Симулируем подключение без реальных WebSocket операций
    const cleanup = () => {
      console.log("WebSocket Manager cleanup");
    };

    return cleanup;
  }, [user]);

  return null;
};