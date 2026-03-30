import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // UI состояние
  sidebarOpen: true,
  theme: localStorage.getItem('theme') || 'light',
  notifications: [],
  modal: null, // { type: 'confirm', title, message, onConfirm, onCancel }

  // Управление боковой панелью
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Управление темой
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    });
  },

  // Управление уведомлениями
  addNotification: (notification) => {
    const id = Date.now();
    const withId = { ...notification, id };
    set((state) => ({
      notifications: [...state.notifications, withId],
    }));

    // Автоудаление через 3 секунды
    if (notification.autoClose !== false) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      }, notification.duration || 3000);
    }

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  // Управление модальным окном
  setModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
}));

export default useUIStore;
