import { useEffect, useMemo } from 'react';
import { useScheduleStore } from '../store/useScheduleStore';

/**
 * Хук для загрузки расписания класса
 * @param {string} className - например "10A"
 * @returns {Object} { schedule, weekSchedule, loading, error, refetch }
 */
export const useClassSchedule = (className) => {
  const schedule = useScheduleStore((state) => state.schedule);
  const loading = useScheduleStore((state) => state.loading);
  const error = useScheduleStore((state) => state.error);
  const fetchSchedule = useScheduleStore((state) => state.fetchSchedule);

  useEffect(() => {
    if (className) {
      fetchSchedule(className);
    }
  }, [className, fetchSchedule]);

  const weekSchedule = useMemo(() => {
    const safeSchedule = Array.isArray(schedule) ? schedule : [];
    return [1, 2, 3, 4, 5].map((day) => ({
      day,
      lessons: safeSchedule.filter((s) => s.day_of_week === day),
    }));
  }, [schedule]);

  return {
    schedule,
    weekSchedule,
    loading,
    error,
    refetch: () => fetchSchedule(className),
  };
};

export default useClassSchedule;
