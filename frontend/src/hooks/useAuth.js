import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Хук для проверки авторизации и восстановления сессии
 * @returns {Object} { user, isAuthenticated, role, loading, logout }
 */
export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  const role = user?.user_type || user?.role || null;

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return { user, isAuthenticated, role, loading, logout };
};

export default useAuth;
