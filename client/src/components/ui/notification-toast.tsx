import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './button';

export interface NotificationToastProps {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
};

export function NotificationToast({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}: NotificationToastProps) {
  const Icon = iconMap[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md p-4 border rounded-lg shadow-lg 
        ${colorMap[type]} 
        animate-in slide-in-from-right-full fade-in
        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[type]}`} />

        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold">
            {title}
          </h4>
          <p className="text-sm opacity-90">
            {message}
          </p>

          {action && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className="text-xs"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex-shrink-0 p-1 h-auto opacity-50 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
