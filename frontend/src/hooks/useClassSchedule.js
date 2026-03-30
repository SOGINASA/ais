import { useEffect, useMemo } from 'react';
import { useScheduleStore } from '../store/useScheduleStore';

/**
 * Хук для загрузки расписания текущего студента (JWT-based)
 * @returns {Object} { schedule, weekSchedule, loading, error, refetch }
 */
export const useClassSchedule = () => {
  const schedule = useScheduleStore((state) => state.schedule);
  const loading = useScheduleStore((state) => state.loading);
  const error = useScheduleStore((state) => state.error);
  const fetchSchedule = useScheduleStore((state) => state.fetchSchedule);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const weekSchedule = useMemo(() => {
    const safeSchedule = Array.isArray(schedule) ? schedule : [];
    return [1, 2, 3, 4, 5].map((day) => ({
      day,
      lessons: safeSchedule.filter((s) => s.day_of_week === day - 1 || s.day_of_week === day),
    }));
  }, [schedule]);

  return {
    schedule,
    weekSchedule,
    loading,
    error,
    refetch: fetchSchedule,
  };
};

export default useClassSchedule;
