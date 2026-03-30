import { create } from 'zustand';
import { studentsApi } from '../api/bilimclass/students';

// Стор для данных учителя: классы и студенты
export const useStudentsStore = create((set, get) => ({
  classes: [],
  students: [],
  riskStudents: [],
  selectedClassId: null,
  loading: false,
  error: null,

  // Загрузить классы учителя
  fetchTeacherClasses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await studentsApi.getTeacherClasses();
      const data = response.data ?? [];
      set({ classes: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ classes: [], error: error.message, loading: false });
    }
  },

  // Загрузить студентов класса с аналитикой
  fetchClassStudents: async (classId) => {
    set({ loading: true, error: null, selectedClassId: classId });
    try {
      const response = await studentsApi.getClassStudents(classId);
      const data = response.data ?? [];
      set({ students: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ students: [], error: error.message, loading: false });
    }
  },

  // Загрузить студентов в зоне риска
  fetchRiskStudents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await studentsApi.getRiskStudents();
      const data = response.data ?? [];
      set({ riskStudents: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ riskStudents: [], error: error.message, loading: false });
    }
  },

  getStudentById: (id) => {
    const { students } = get();
    return students.find(s => s.user?.id === id || s.id === id);
  },

  reset: () => set({ classes: [], students: [], riskStudents: [], selectedClassId: null, loading: false, error: null }),
}));

export default useStudentsStore;
