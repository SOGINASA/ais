import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: null, // 'student', 'teacher', 'parent', 'admin', 'kiosk'
  accessToken: null,
  loading: false,
  error: null,

  // Mock login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // Здесь будет реальная авторизация с backend
      // Для теста используем mock данные
      const mockUser = {
        id: 1,
        email,
        full_name: 'Айман Смагулов',
        role: 'student',
        class: '10A',
      };

      localStorage.setItem('access_token', 'mock_token_12345');
      localStorage.setItem('user', JSON.stringify(mockUser));

      set({
        user: mockUser,
        isAuthenticated: true,
        role: mockUser.role,
        accessToken: 'mock_token_12345',
        loading: false,
      });

      return mockUser;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      accessToken: null,
      error: null,
    });
  },

  // Восстановить сессию из localStorage
  restoreSession: () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          isAuthenticated: true,
          role: user.role,
          accessToken: token,
        });
        return true;
      } catch (error) {
        console.error('Failed to restore session:', error);
        return false;
      }
    }
    return false;
  },

  // Установить роль
  setRole: (role) => set({ role }),

  // Получить роль
  getRole: () => {
    // использовать из state
    return null;
  },
}));

export default useAuthStore;
