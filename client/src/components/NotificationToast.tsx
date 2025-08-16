import React, { createContext, useContext, ReactNode } from "react";
import { Toast } from "../../components/ui/toast";

interface NotificationToastProps {
  message: string;
  type: "success" | "error" | "info";
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type }) => {
  return (
    <div className="notification-toast">
      <Toast>
        <div className={`toast-content toast-${type}`}>
          {message}
        </div>
      </Toast>
    </div>
  );
};

// Context для notifications
const NotificationContext = createContext<any>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = {
    showNotification: () => {},
    hideNotification: () => {}
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return { showNotification: () => {}, hideNotification: () => {} };
  }
  return context;
};

export default NotificationToast;