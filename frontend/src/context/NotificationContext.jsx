/**
 * Notification Context Provider.
 * Provides a global toast/snackbar notification system.
 */

import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let notificationId = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++notificationId;
    const notification = { id, message, type, duration };

    setNotifications((prev) => [...prev, notification]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((message) => addNotification(message, 'success'), [addNotification]);
  const error = useCallback((message) => addNotification(message, 'error', 6000), [addNotification]);
  const warning = useCallback((message) => addNotification(message, 'warning'), [addNotification]);
  const info = useCallback((message) => addNotification(message, 'info'), [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      success,
      error,
      warning,
      info,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
