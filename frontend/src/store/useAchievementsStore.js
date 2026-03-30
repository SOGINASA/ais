import { create } from 'zustand';
import { achievementsApi } from '../api/bilimclass/achievements';

export const useAchievementsStore = create((set, get) => ({
  achievements: [],
  leaderboard: [],
  statistics: null,
  loading: false,
  error: null,

  // Загрузить портфолио текущего студента (JWT)
  fetchAchievements: async () => {
    set({ loading: true, error: null });
    try {
      const response = await achievementsApi.getPortfolio();
      const data = response.data ?? [];
      const statistics = response.statistics ?? null;
      set({ achievements: Array.isArray(data) ? data : [], statistics, loading: false });
    } catch (error) {
      set({ achievements: [], error: error.message, loading: false });
    }
  },

  fetchLeaderboard: async () => {
    set({ loading: true, error: null });
    try {
      const response = await achievementsApi.getLeaderboard();
      const data = response.data ?? [];
      set({ leaderboard: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ leaderboard: [], error: error.message, loading: false });
    }
  },

  getAchievementsByType: (type) => {
    const { achievements } = get();
    return achievements.filter(a => a.type === type);
  },

  reset: () => set({ achievements: [], leaderboard: [], statistics: null, loading: false, error: null }),
}));

export default useAchievementsStore;
