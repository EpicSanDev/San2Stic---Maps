import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      timestamp: Date.now(),
      duration: 5000, // Default 5 seconds
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 0, // Don't auto-dismiss errors
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const { type, message, title, action } = notification;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'error':
        return {
          icon: <XCircleIcon className="w-5 h-5" />,
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-800 dark:text-red-200'
        };
      case 'warning':
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'info':
      default:
        return {
          icon: <InformationCircleIcon className="w-5 h-5" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor, textColor } = getTypeConfig();

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'transform transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-right-full',
        bgColor,
        borderColor
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn('flex-shrink-0', iconColor)}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('text-sm font-medium mb-1', textColor)}>
              {title}
            </h4>
          )}
          <p className={cn('text-sm', textColor)}>
            {message}
          </p>
          
          {action && (
            <div className="mt-2">
              <button
                onClick={action.onClick}
                className={cn(
                  'text-sm font-medium underline hover:no-underline',
                  iconColor
                )}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className={cn(
            'flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors duration-200',
            iconColor
          )}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};