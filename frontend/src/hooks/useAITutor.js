import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import tutorApi from '../api/ai/tutor';
import analyticsApi from '../api/ai/analytics';

export function useAITutor() {
  const user = useAuthStore((s) => s.user);
  const [analytics, setAnalytics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentId = user?.id;

  const fetchAll = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, predictionsRes] = await Promise.all([
        tutorApi.getStudentAnalytics(),
        tutorApi.getPredictions(studentId),
      ]);
      setAnalytics(analyticsRes?.data || analyticsRes);
      setPredictions(predictionsRes?.data || predictionsRes);

      // Report is optional - don't fail if unavailable
      try {
        const reportRes = await analyticsApi.getStudentReport(studentId);
        setReport(reportRes?.ai_report || reportRes);
      } catch {
        setReport(null);
      }
    } catch (err) {
      setError(err?.message || 'Ошибка загрузки данных AI тьютора');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { analytics, predictions, report, loading, error, refetch: fetchAll };
}

export default useAITutor;