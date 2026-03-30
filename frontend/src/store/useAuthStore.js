import { create } from 'zustand';

// Mock users database
const MOCK_USERS = {
  'ayman@school.kz':     { id: 1,   full_name: 'Айман Смагулов',       role: 'student', class: '10A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayman' },
  'ainur@school.kz':     { id: 2,   full_name: 'Айнур Жанова',         role: 'student', class: '10A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ainur' },
  'berik@school.kz':     { id: 3,   full_name: 'Берик Оспанов',        role: 'student', class: '10A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=berik' },
  'gulnur@school.kz':    { id: 4,   full_name: 'Гульнур Нурова',       role: 'student', class: '10B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gulnur' },
  'daria@school.kz':     { id: 101, full_name: 'Дарья Иванова',        role: 'teacher', specialization: 'Математика', subjects: ['Алгебра', 'Геометрия'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daria' },
  'sergey@school.kz':    { id: 102, full_name: 'Сергей Петров',        role: 'teacher', specialization: 'Физика', subjects: ['Физика'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sergey' },
  'aqerke@school.kz':    { id: 103, full_name: 'Ақерке Мусабаева',     role: 'teacher', specialization: 'Казахский язык', subjects: ['Казахский язык', 'Литература'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aqerke' },
  'irina@school.kz':     { id: 104, full_name: 'Ирина Сидорова',       role: 'teacher', specialization: 'Английский язык', subjects: ['Английский язык'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irina' },
  'igor@school.kz':      { id: 105, full_name: 'Игорь Козлов',         role: 'teacher', specialization: 'История', subjects: ['История', 'Обществознание'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=igor' },
  'zhanna.smagulova@example.kz': { id: 201, full_name: 'Жанна Смагулова', role: 'parent', children: [1], relationship: 'Мать', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhanna' },
  'saule.zhanova@example.kz':    { id: 202, full_name: 'Сауле Жанова',    role: 'parent', children: [2], relationship: 'Мать', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saule' },
  'admin@school.kz':     { id: 301, full_name: 'Администратор',        role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: null, // 'student', 'teacher', 'parent', 'admin'
  accessToken: null,
  loading: false,
  error: null,

  // Mock login — any password works, lookup by email
  login: async (email, _password) => {
    set({ loading: true, error: null });
    try {
      const found = MOCK_USERS[email.toLowerCase().trim()];
      if (!found) {
        throw new Error('Пользователь не найден');
      }

      const mockUser = { ...found, email: email.toLowerCase().trim() };

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
}));

export default useAuthStore;
