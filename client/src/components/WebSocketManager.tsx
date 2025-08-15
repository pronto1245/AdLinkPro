import React, { useEffect } from "react";
import { useAuth } from "../contexts/auth-context";

export const WebSocketManager: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // WebSocket logic будет добавлена позже
    console.log("WebSocket Manager initialized for user:", user.username);

    return () => {
      console.log("WebSocket Manager cleanup");
    };
  }, [user]);

  return null;
};