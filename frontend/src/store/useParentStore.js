import { create } from 'zustand';
import { parentApi } from '../api/bilimclass/parent';

export const useParentStore = create((set) => ({
  child: null,
  grades: [],
  quarterGrades: [],
  attendance: [],
  attendanceStats: null,
  schedule: [],
  analytics: null,
  loading: false,
  error: null,

  fetchChild: async () => {
    try {
      const response = await parentApi.getChild();
      set({ child: response.data ?? null });
    } catch (error) {
      set({ child: null });
    }
  },

  fetchGrades: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await parentApi.getGrades(params);
      const data = response.data ?? [];
      set({ grades: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ grades: [], error: error.message, loading: false });
    }
  },

  fetchAttendance: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await parentApi.getAttendance(params);
      const data = response.data ?? [];
      set({
        attendance: Array.isArray(data) ? data : [],
        attendanceStats: response.statistics ?? null,
        loading: false,
      });
    } catch (error) {
      set({ attendance: [], attendanceStats: null, error: error.message, loading: false });
    }
  },

  fetchSchedule: async () => {
    try {
      const response = await parentApi.getSchedule();
      const data = response.data ?? [];
      set({ schedule: Array.isArray(data) ? data : [] });
    } catch (error) {
      set({ schedule: [] });
    }
  },

  fetchAnalytics: async () => {
    try {
      const response = await parentApi.getAnalytics();
      set({ analytics: response.data ?? null });
    } catch (error) {
      set({ analytics: null });
    }
  },

  reset: () => set({
    child: null, grades: [], attendance: [], attendanceStats: null,
    schedule: [], analytics: null, loading: false, error: null,
  }),
}));

export default useParentStore;
