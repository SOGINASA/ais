import { create } from 'zustand';
import { notificationsApi } from '../api/notifications';

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationsApi.getNotifications(page);
      const data = response.data ?? response.notifications ?? [];
      set({ notifications: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ notifications: [], error: error.message, loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      set({ unreadCount: response.count ?? 0 });
    } catch {
      // silent fail
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  reset: () => set({ notifications: [], unreadCount: 0, loading: false, error: null }),
}));

export default useNotificationsStore;
