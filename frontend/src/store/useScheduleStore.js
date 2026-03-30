import { create } from 'zustand';
import { scheduleApi } from '../api/bilimclass/schedule';

export const useScheduleStore = create((set, get) => ({
  schedule: [],
  loading: false,
  error: null,

  // Загрузить расписание текущего студента (JWT)
  fetchSchedule: async () => {
    set({ loading: true, error: null });
    try {
      const response = await scheduleApi.getStudentSchedule();
      const data = response.data ?? response.grouped ?? [];
      set({ schedule: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ schedule: [], error: error.message, loading: false });
    }
  },

  getScheduleByDay: (dayOfWeek) => {
    const { schedule } = get();
    return schedule.filter(s => s.day_of_week === dayOfWeek);
  },

  getWeekSchedule: () => {
    const { schedule } = get();
    const weekDays = [0, 1, 2, 3, 4];
    return weekDays.map(day => ({
      day: day + 1,
      lessons: (schedule || []).filter(s => s.day_of_week === day),
    }));
  },

  reset: () => set({ schedule: [], loading: false, error: null }),
}));

export default useScheduleStore;
