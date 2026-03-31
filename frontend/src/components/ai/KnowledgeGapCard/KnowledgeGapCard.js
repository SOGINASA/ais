import React from 'react';

const barColor = (avg) => {
  if (avg >= 4.5) return 'bg-emerald-500';
  if (avg >= 3.5) return 'bg-blue-500';
  if (avg >= 2.5) return 'bg-amber-500';
  return 'bg-red-500';
};

const trendArrow = (trend) => {
  if (trend > 5) return <span className="text-emerald-500 text-xs ml-1">↑{trend.toFixed(0)}%</span>;
  if (trend < -5) return <span className="text-red-500 text-xs ml-1">↓{Math.abs(trend).toFixed(0)}%</span>;
  return <span className="text-gray-400 text-xs ml-1">→</span>;
};

export default function KnowledgeGapCard({ subjects }) {
  if (!subjects || subjects.length === 0) return null;

  // Sort by average ascending to show weakest first
  const sorted = [...subjects].sort((a, b) => a.average - b.average);
  const weakSubjects = sorted.filter((s) => s.average < 4.0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📚 Предметы для внимания
      </h3>

      {weakSubjects.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl">🎉</span>
          <p className="text-sm text-gray-500 mt-2">Все предметы в хорошем состоянии!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {weakSubjects.map((subj) => (
            <div key={subj.subject} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {subj.subject}
                  </span>
                  <span className="text-sm text-gray-600 flex items-center">
                    {subj.average.toFixed(1)}
                    {trendArrow(subj.trend)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${barColor(subj.average)}`}
                    style={{ width: `${(subj.average / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All subjects summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Все предметы ({sorted.length}):</p>
        <div className="flex flex-wrap gap-1.5">
          {sorted.map((s) => (
            <span
              key={s.subject}
              className={`text-xs px-2 py-0.5 rounded-full ${
                s.average >= 4.0
                  ? 'bg-emerald-50 text-emerald-700'
                  : s.average >= 3.0
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {s.subject} {s.average.toFixed(1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}