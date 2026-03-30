import { create } from 'zustand';
import { attendanceApi } from '../api/bilimclass/attendance';

export const useAttendanceStore = create((set, get) => ({
  attendance: [],
  statistics: null,
  loading: false,
  error: null,

  // Загрузить посещаемость текущего студента (JWT)
  fetchAttendance: async (days = 30) => {
    set({ loading: true, error: null });
    try {
      const response = await attendanceApi.getAttendance(days);
      const data = response.data ?? [];
      const statistics = response.statistics ?? null;
      set({ attendance: Array.isArray(data) ? data : [], statistics, loading: false });
    } catch (error) {
      set({ attendance: [], error: error.message, loading: false });
    }
  },

  getAttendanceStats: () => {
    const { attendance, statistics } = get();
    if (statistics) return statistics;
    const safe = Array.isArray(attendance) ? attendance : [];
    const present = safe.filter(a => a.status === 'present').length;
    const absent = safe.filter(a => a.status === 'absent').length;
    const total = safe.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    return { present, absent, total, percentage };
  },

  reset: () => set({ attendance: [], statistics: null, loading: false, error: null }),
}));

export default useAttendanceStore;
