import React from 'react';

export default function WeeklySummaryCard({ analytics }) {
  if (!analytics) return null;

  const avg = analytics.average_score || 0;
  const trend = analytics.trend || 0;
  const attendance = analytics.attendance || {};
  const achievements = analytics.achievements || 0;

  const avgBg = avg >= 4.5 ? 'from-emerald-500 to-emerald-600'
    : avg >= 3.5 ? 'from-blue-500 to-blue-600'
    : avg >= 2.5 ? 'from-amber-500 to-amber-600'
    : 'from-red-500 to-red-600';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📋 Сводка
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Average */}
        <div className={`bg-gradient-to-br ${avgBg} rounded-xl p-4 text-white text-center`}>
          <p className="text-2xl font-bold">{avg.toFixed(2)}</p>
          <p className="text-xs opacity-80 mt-0.5">Средний балл</p>
        </div>

        {/* Trend */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Тренд</p>
        </div>

        {/* Attendance */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {attendance.total ? Math.round(((attendance.present || 0) / attendance.total) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Посещаемость</p>
        </div>

        {/* Achievements */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{achievements}</p>
          <p className="text-xs text-gray-500 mt-0.5">Достижения</p>
        </div>
      </div>
    </div>
  );
}