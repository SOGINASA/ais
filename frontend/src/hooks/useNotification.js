import { useCallback } from 'react';
import { useUIStore } from '../store/useUIStore';

/**
 * Хук для управления уведомлениями
 * @returns {Object} { addNotification, removeNotification, notifications }
 */
export const useNotification = () => {
  const addNotification = useUIStore((s) => s.addNotification);

  const success = useCallback(
    (message) => {
      addNotification({ type: 'success', message });
    },
    [addNotification]
  );

  const error = useCallback(
    (message) => {
      addNotification({ type: 'error', message });
    },
    [addNotification]
  );

  const warning = useCallback(
    (message) => {
      addNotification({ type: 'warning', message });
    },
    [addNotification]
  );

  const info = useCallback(
    (message) => {
      addNotification({ type: 'info', message });
    },
    [addNotification]
  );

  return { success, error, warning, info };
};

export default useNotification;
