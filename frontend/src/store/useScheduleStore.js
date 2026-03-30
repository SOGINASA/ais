import { create } from 'zustand';
import { scheduleApi } from '../bilimclass/schedule';

export const useScheduleStore = create((set) => ({
  schedule: [],
  loading: false,
  error: null,

  // Загрузить расписание для класса
  fetchSchedule: async (className) => {
    set({ loading: true, error: null });
    try {
      const response = await scheduleApi.getSchedule(className);
      set({ schedule: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Получить уроки на определённый день
  getScheduleByDay: (dayOfWeek, schedule) => {
    return schedule.filter(s => s.day_of_week === dayOfWeek);
  },

  // Получить расписание на неделю
  getWeekSchedule: (schedule) => {
    const weekDays = [1, 2, 3, 4, 5]; // Mon-Fri
    return weekDays.map(day => ({
      day,
      lessons: schedule.filter(s => s.day_of_week === day),
    }));
  },

  // Сброс состояния
  reset: () => set({ schedule: [], loading: false, error: null }),
}));

export default useScheduleStore;
