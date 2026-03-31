import { useAuthStore } from '../store/useAuthStore';

/**
 * Хук для чтения состояния авторизации.
 * restoreSession вызывается ОДИН РАЗ в App.js — не здесь.
 */
export const useAuth = () => {
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading         = useAuthStore((s) => s.loading);
  const logout           = useAuthStore((s) => s.logout);

  const role = user?.user_type || user?.role || null;

  return { user, isAuthenticated, role, loading, logout };
};

export default useAuth;
