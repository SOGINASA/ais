import { useEffect } from 'react';
import { useGradesStore } from '../store/useGradesStore';

/**
 * Хук для загрузки оценок студента с автоматическим эффектом
 * @param {number} studentId
 * @returns {Object} { grades, quarterGrades, loading, error, refetch }
 */
export const useStudentGrades = (studentId) => {
  const { grades, quarterGrades, loading, error, fetchGrades, fetchQuarterGrades } = useGradesStore();

  useEffect(() => {
    if (studentId) {
      fetchGrades(studentId);
      fetchQuarterGrades(studentId);
    }
  }, [studentId, fetchGrades, fetchQuarterGrades]);

  return {
    grades,
    quarterGrades,
    loading,
    error,
    refetch: () => {
      fetchGrades(studentId);
      fetchQuarterGrades(studentId);
    },
  };
};

export default useStudentGrades;
