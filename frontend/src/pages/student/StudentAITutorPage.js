import React from 'react';
import { Link } from 'react-router-dom';
import useAITutor from '../../hooks/useAITutor';
import { AIPredictionCard, AIPredictionRisk } from '../../components/ai/AIPredictionCard';
import { KnowledgeGapCard } from '../../components/ai/KnowledgeGapCard';
import { WeeklySummaryCard } from '../../components/ai/WeeklySummaryCard';
import { AIReportGenerator } from '../../components/ai/AIReportGenerator';

export default function StudentAITutorPage() {
  const { analytics, predictions, report, loading, error, refetch } = useAITutor();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Загрузка AI тьютора...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl">⚠️</span>
          <p className="text-sm text-red-600 mt-2">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/student" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← Назад
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            🤖 AI Тьютор
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Персональная аналитика и прогнозы на основе ML-моделей
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
        >
          🔄 Обновить
        </button>
      </div>

      {/* Top row: Summary + Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeeklySummaryCard analytics={analytics} />
        <AIPredictionRisk risk={analytics?.risk} />
      </div>

      {/* Middle row: Predictions + Knowledge gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIPredictionCard predictions={predictions} />
        <KnowledgeGapCard subjects={analytics?.by_subject} />
      </div>

      {/* AI Report */}
      <AIReportGenerator report={report} />
    </div>
  );
}