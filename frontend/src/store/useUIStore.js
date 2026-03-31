import { create } from 'zustand';

let notifId = 0;

export const useUIStore = create((set, get) => ({
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
    const id = ++notifId;
    const entry = { id, ...notification };
    set((state) => ({
      notifications: [...state.notifications, entry],
    }));
    // Автоудаление через 4 секунды
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  // Управление модальным окном
  setModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
}));

export default useUIStore;
