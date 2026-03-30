import { create } from 'zustand';
import { gradesApi } from '../api/bilimclass/grades';

export const useGradesStore = create((set, get) => ({
  grades: [],
  quarterGrades: [],
  loading: false,
  error: null,

  fetchGrades: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await gradesApi.getGrades(params);
      const data = response.data ?? [];
      set({ grades: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ grades: [], error: error.message, loading: false });
    }
  },

  fetchQuarterGrades: async () => {
    set({ loading: true, error: null });
    try {
      const response = await gradesApi.getQuarterGrades();
      const data = response.data ?? [];
      set({ quarterGrades: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ quarterGrades: [], error: error.message, loading: false });
    }
  },

  fetchGradesBySubject: async (subjectId) => {
    set({ loading: true, error: null });
    try {
      const response = await gradesApi.getGradesBySubject(subjectId);
      const data = response.data ?? [];
      set({ grades: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ grades: [], error: error.message, loading: false });
    }
  },

  getAverageBySubject: (subject) => {
    const { grades } = get();
    const subjectGrades = grades.filter(g => g.subject === subject);
    if (subjectGrades.length === 0) return 0;
    const weighted = subjectGrades.reduce((sum, g) => sum + g.score * (g.weight || 1), 0);
    const totalWeight = subjectGrades.reduce((sum, g) => sum + (g.weight || 1), 0);
    return (weighted / totalWeight).toFixed(2);
  },

  getSubjects: () => {
    const { grades } = get();
    return [...new Set(grades.map(g => g.subject?.name || g.subject).filter(Boolean))];
  },

  reset: () => set({ grades: [], quarterGrades: [], loading: false, error: null }),
}));

export default useGradesStore;
