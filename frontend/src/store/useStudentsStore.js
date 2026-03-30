import { create } from 'zustand';
import { studentsApi } from '../bilimclass/students';

export const useStudentsStore = create((set, get) => ({
  students: [],
  currentStudent: null,
  loading: false,
  error: null,

  // Загрузить всех студентов
  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await studentsApi.getStudents();
      set({ students: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Загрузить конкретного студента
  fetchStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await studentsApi.getStudent(id);
      set({ currentStudent: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Установить текущего студента
  setCurrentStudent: (student) => {
    set({ currentStudent: student });
  },

  // Получить студента по ID
  getStudentById: (id) => {
    const { students } = get();
    return students.find(s => s.id === id);
  },

  // Получить студентов по классу
  getStudentsByClass: (className) => {
    const { students } = get();
    return students.filter(s => s.class === className);
  },

  // Сброс состояния
  reset: () => set({ students: [], currentStudent: null, loading: false, error: null }),
}));

export default useStudentsStore;
