import { useCallback } from 'react';
import { useUIStore } from '../store/useUIStore';

/**
 * Хук для управления уведомлениями
 * @returns {Object} { addNotification, removeNotification, notifications }
 */
export const useNotification = () => {
  const { notifications, addNotification, removeNotification } = useUIStore();

  const notify = useCallback(
    (message, type = 'info', duration = 3000) => {
      return addNotification({
        message,
        type, // 'success', 'error', 'warning', 'info'
        duration,
        autoClose: true,
      });
    },
    [addNotification]
  );

  const success = useCallback(
    (message, duration = 3000) => notify(message, 'success', duration),
    [notify]
  );

  const error = useCallback(
    (message, duration = 5000) => notify(message, 'error', duration),
    [notify]
  );

  const warning = useCallback(
    (message, duration = 4000) => notify(message, 'warning', duration),
    [notify]
  );

  const info = useCallback(
    (message, duration = 3000) => notify(message, 'info', duration),
    [notify]
  );

  return {
    notify,
    success,
    error,
    warning,
    info,
    remove: removeNotification,
    notifications,
  };
};

export default useNotification;
