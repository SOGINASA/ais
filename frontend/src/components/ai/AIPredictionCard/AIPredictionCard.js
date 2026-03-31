import React from 'react';

const trendLabels = {
  improving: { text: 'Улучшение', color: 'text-emerald-600', icon: '📈' },
  stable: { text: 'Стабильно', color: 'text-blue-600', icon: '➡️' },
  slight_decline: { text: 'Небольшое снижение', color: 'text-amber-600', icon: '📉' },
  declining: { text: 'Снижение', color: 'text-red-600', icon: '⚠️' },
  insufficient_data: { text: 'Мало данных', color: 'text-gray-500', icon: '❓' },
};

export default function AIPredictionCard({ predictions }) {
  if (!predictions) return null;

  const trend = trendLabels[predictions.future_trend] || trendLabels.insufficient_data;
  const score = predictions.predicted_next_score;
  const confidence = Math.round((predictions.confidence || 0) * 100);
  const actions = predictions.recommended_actions || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🔮 Прогноз успеваемости
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Trend */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <span className="text-2xl">{trend.icon}</span>
          <p className={`text-sm font-semibold mt-1 ${trend.color}`}>{trend.text}</p>
          <p className="text-xs text-gray-500 mt-0.5">Тренд</p>
        </div>

        {/* Predicted score */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-violet-600">
            {score != null ? score.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Прогноз оценки</p>
        </div>
      </div>

      {/* Confidence */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Уверенность модели</span>
          <span>{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-violet-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(confidence, 100)}%` }}
          />
        </div>
      </div>

      {/* Prediction text */}
      {predictions.prediction && (
        <p className="text-sm text-gray-600 mb-4 italic">"{predictions.prediction}"</p>
      )}

      {/* Recommended actions */}
      {actions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Рекомендации:</p>
          <ul className="space-y-1">
            {actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-violet-400 mt-0.5">•</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}