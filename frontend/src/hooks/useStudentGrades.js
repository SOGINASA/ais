import { useEffect } from 'react';
import { useGradesStore } from '../store/useGradesStore';

/**
 * Хук для загрузки оценок текущего студента (JWT-based, studentId не нужен)
 * @returns {Object} { grades, quarterGrades, loading, error, refetch }
 */
export const useStudentGrades = () => {
  const { grades, quarterGrades, loading, error, fetchGrades, fetchQuarterGrades } = useGradesStore();

  useEffect(() => {
    fetchGrades();
    fetchQuarterGrades();
  }, [fetchGrades, fetchQuarterGrades]);

  return {
    grades,
    quarterGrades,
    loading,
    error,
    refetch: () => {
      fetchGrades();
      fetchQuarterGrades();
    },
  };
};

export default useStudentGrades;
