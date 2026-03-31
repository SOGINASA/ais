import { useAuthStore } from '../store/useAuthStore';

/**
 * Хук для чтения состояния авторизации.
 * restoreSession вызывается ОДИН РАЗ в App.js — не здесь.
 */
export const useAuth = () => {
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role            = useAuthStore((s) => s.role);
  const loading         = useAuthStore((s) => s.loading);

  return { user, isAuthenticated, role, loading };
};

export default useAuth;
