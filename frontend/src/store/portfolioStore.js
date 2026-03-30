import { create } from 'zustand';
import { portfolioApi } from '../api/portfolio';

export const usePortfolioStore = create((set, get) => ({
  portfolio: null,
  achievements: [],
  leaderboard: [],
  statistics: null,
  userRank: null,
  loading: false,
  error: null,

  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const response = await portfolioApi.getPortfolio();
      const achievements = response.data ?? [];
      const statistics = response.statistics ?? null;
      set({
        achievements: Array.isArray(achievements) ? achievements : [],
        statistics,
        loading: false,
      });
    } catch (error) {
      set({ achievements: [], error: error.message, loading: false });
    }
  },

  fetchLeaderboard: async () => {
    set({ loading: true, error: null });
    try {
      const response = await portfolioApi.getLeaderboard();
      const data = response.data ?? [];
      set({
        leaderboard: Array.isArray(data) ? data : [],
        userRank: response.user_rank ?? null,
        loading: false,
      });
    } catch (error) {
      set({ leaderboard: [], error: error.message, loading: false });
    }
  },

  reset: () => set({ portfolio: null, achievements: [], leaderboard: [], statistics: null, userRank: null, loading: false, error: null }),
}));

export default usePortfolioStore;
