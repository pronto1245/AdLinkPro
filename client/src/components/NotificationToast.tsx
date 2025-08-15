import React from "react";
import { Toast } from "@/components/ui/toast";

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

export default NotificationToast;