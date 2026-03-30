import { create } from 'zustand';
import { achievementsApi } from '../bilimclass/achievements';

export const useAchievementsStore = create((set) => ({
  achievements: [],
  loading: false,
  error: null,

  // Загрузить достижения студента
  fetchAchievements: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await achievementsApi.getAchievements(studentId);
      set({ achievements: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Получить достижения по типу
  getAchievementsByType: (type, achievements) => {
    return achievements.filter(a => a.type === type);
  },

  // Сброс состояния
  reset: () => set({ achievements: [], loading: false, error: null }),
}));

export default useAchievementsStore;
