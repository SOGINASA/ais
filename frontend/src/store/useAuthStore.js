import { create } from 'zustand';
import bilimClassClient from '../api/bilimclass/client';

// Restore initial state from localStorage
let storedUser = null;
const storedToken = localStorage.getItem('access_token');
try {
  const raw = localStorage.getItem('user');
  if (raw) {
    storedUser = JSON.parse(raw);
    // Validate user has a roleф
    const role = storedUser?.user_type || storedUser?.role;
    if (!role || !['admin', 'teacher', 'student', 'parent'].includes(role)) {
      storedUser = null;
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }
} catch {
  storedUser = null;
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
}

export const useAuthStore = create((set, get) => ({
  user: storedUser || null,
  isAuthenticated: !!(storedToken && storedUser),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await bilimClassClient.post('/auth/login', { identifier: email, password });
      console.log('Login response:', res);
      const token = res.access_token || res.token;
      const user = res.user;
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, loading: false, error: null });
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      set({ error: msg, loading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await bilimClassClient.post('/auth/register', data);
      const { access_token, user } = res;
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, loading: false });
      } else {
        set({ loading: false });
      }
      return res;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      set({ error: msg, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, error: null });
  },

  restoreSession: () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        const role = user?.user_type || user?.role;
        if (role && ['admin', 'teacher', 'student', 'parent'].includes(role)) {
          set({ user, isAuthenticated: true });
          return;
        }
      } catch {
        // fall through
      }
    }
    // Invalid or missing — clear
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
