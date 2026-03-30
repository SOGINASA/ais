import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Хук для проверки авторизации и восстановления сессии
 * @returns {Object} { user, isAuthenticated, role, loading }
 */
export const useAuth = () => {
  const { user, isAuthenticated, role, loading, restoreSession } = useAuthStore();

  useEffect(() => {
    // Восстановить сессию при загрузке приложения
    restoreSession();
  }, [restoreSession]);

  return { user, isAuthenticated, role, loading };
};

export default useAuth;
