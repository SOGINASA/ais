import { create } from 'zustand';
import { attendanceApi } from '../bilimclass/attendance';

export const useAttendanceStore = create((set) => ({
  attendance: [],
  loading: false,
  error: null,

  // Загрузить посещаемость студента
  fetchAttendance: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await attendanceApi.getAttendance(studentId);
      set({ attendance: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Получить статистику посещаемости
  getAttendanceStats: (attendance) => {
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
