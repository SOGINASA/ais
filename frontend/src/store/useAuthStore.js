import { create } from 'zustand';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: null, // 'student', 'teacher', 'parent', 'admin'
  accessToken: null,
  loading: false,
  error: null,

  // Real login
  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { user, access_token, refresh_token } = data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        role: user.role || user.user_type,
        accessToken: access_token,
        loading: false,
      });

      return user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Real register
  register: async (identifier, password, full_name) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, full_name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const { user, access_token, refresh_token } = data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        role: user.role || user.user_type,
        accessToken: access_token,
        loading: false,
      });

      return user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
          role: user.role || user.user_type,
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
}));

export default useAuthStore;
