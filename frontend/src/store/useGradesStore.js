import { create } from 'zustand';
import { gradesApi } from '../api/bilimclass/grades';

export const useGradesStore = create((set, get) => ({
  grades: [],
  quarterGrades: [],
  loading: false,
  error: null,

  // Загрузить все оценки студента
  fetchGrades: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await gradesApi.getGrades(studentId);
      set({ grades: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Загрузить четвертные оценки
  fetchQuarterGrades: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await gradesApi.getQuarterGrades(studentId);
      set({ quarterGrades: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Загрузить оценки по предмету
  fetchGradesBySubject: async (studentId, subject) => {
    set({ loading: true, error: null });
    try {
      const response = await gradesApi.getGradesBySubject(studentId, subject);
      set({ grades: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Получить средний балл по предмету
  getAverageBySubject: (subject) => {
    const { grades } = get();
    const subjectGrades = grades.filter(g => g.subject === subject);
    if (subjectGrades.length === 0) return 0;
    
    const weighted = subjectGrades.reduce((sum, g) => sum + g.grade * g.weight, 0);
    const totalWeight = subjectGrades.reduce((sum, g) => sum + g.weight, 0);
    return (weighted / totalWeight).toFixed(2);
  },

  // Получить список всех предметов
  getSubjects: () => {
    const { grades } = get();
    return [...new Set(grades.map(g => g.subject))];
  },

  // Сброс состояния
  reset: () => set({ grades: [], quarterGrades: [], loading: false, error: null }),
}));

export default useGradesStore;
