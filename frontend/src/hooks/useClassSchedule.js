import { useEffect } from 'react';
import { useScheduleStore } from '../store/useScheduleStore';

/**
 * Хук для загрузки расписания класса
 * @param {string} className - например "10A"
 * @returns {Object} { schedule, weekSchedule, loading, error, refetch }
 */
export const useClassSchedule = (className) => {
  const { schedule, loading, error, fetchSchedule, getWeekSchedule } = useScheduleStore();

  useEffect(() => {
    if (className) {
      fetchSchedule(className);
    }
  }, [className, fetchSchedule]);

  const weekSchedule = getWeekSchedule();

  return {
    schedule,
    weekSchedule,
    loading,
    error,
    refetch: () => fetchSchedule(className),
  };
};

export default useClassSchedule;
