import { create } from 'zustand';
import { attendanceApi } from '../api/bilimclass/attendance';

export const useAttendanceStore = create((set, get) => ({
  attendance: [],
  loading: false,
  error: null,

  // Загрузить посещаемость студента
  fetchAttendance: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await attendanceApi.getAttendance(studentId);
      const data = response.data?.data ?? response.data ?? [];
      set({ attendance: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ attendance: [], error: error.message, loading: false });
    }
  },

  // Получить статистику посещаемости
  getAttendanceStats: () => {
    const { attendance } = get();
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const total = attendance.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    return { present, absent, total, percentage };
  },

  // Сброс состояния
  reset: () => set({ attendance: [], loading: false, error: null }),
}));

export default useAttendanceStore;
