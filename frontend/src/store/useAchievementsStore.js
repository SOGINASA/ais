import { create } from 'zustand';
import { achievementsApi } from '../api/bilimclass/achievements';

export const useAchievementsStore = create((set) => ({
  achievements: [],
  loading: false,
  error: null,

  // Загрузить достижения студента
  fetchAchievements: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await achievementsApi.getAchievements(studentId);
      const data = response.data?.data ?? response.data ?? [];
      set({ achievements: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ achievements: [], error: error.message, loading: false });
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
