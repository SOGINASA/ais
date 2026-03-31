import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, Cell,
} from 'recharts';
import { useStudentGrades } from '../../hooks/useStudentGrades';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const val = (g) => g.score ?? g.grade ?? 0;

const calcAvg = (list) => {
  if (!list.length) return 0;
  const total = list.reduce((s, g) => s + val(g) * (g.weight || 1), 0);
  const w = list.reduce((s, g) => s + (g.weight || 1), 0);
  return w ? total / w : 0;
};

const gradeBg = (avg) => {
  if (avg >= 4.5) return 'from-emerald-500 to-emerald-600';
  if (avg >= 3.5) return 'from-blue-500 to-blue-600';
  if (avg >= 2.5) return 'from-amber-500 to-amber-600';
  return 'from-red-500 to-red-600';
};

export default function StudentAnalyticsPage() {
  const { grades, quarterGrades, loading } = useStudentGrades();

  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeQG = Array.isArray(quarterGrades) ? quarterGrades : [];

  const overallAvg = calcAvg(safeGrades);

  // Subject breakdown
  const subjectStats = useMemo(() => {
    const map = {};
    safeGrades.forEach((g) => {
      const subj = g.subject || 'Неизвестно';
      if (!map[subj]) map[subj] = [];
      map[subj].push(g);
    });
    return Object.entries(map).map(([subject, list], i) => ({
      subject,
      avg: +calcAvg(list).toFixed(2),
      count: list.length,
      color: COLORS[i % COLORS.length],
    }));
  }, [safeGrades]);

  // Grade trend over time (last 20 grades)
  const trendData = useMemo(() => {
    const sorted = [...safeGrades]
      .filter((g) => g.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-20);
    return sorted.map((g, i) => ({
      i: i + 1,
      score: val(g),
      subject: g.subject,
      date: new Date(g.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    }));
  }, [safeGrades]);

  // Grade distribution
  const distribution = useMemo(() => [
    { label: '5', count: safeGrades.filter((g) => val(g) === 5).length, fill: '#10b981' },
    { label: '4', count: safeGrades.filter((g) => val(g) === 4).length, fill: '#3b82f6' },
    { label: '3', count: safeGrades.filter((g) => val(g) === 3).length, fill: '#f59e0b' },
    { label: '2', count: safeGrades.filter((g) => val(g) <= 2).length, fill: '#ef4444' },
  ], [safeGrades]);

  // Quarter comparison
  const quarterData = useMemo(() => {
    const map = {};
    safeGrades.forEach((g) => {
      if (!g.quarter) return;
      if (!map[g.quarter]) map[g.quarter] = [];
      map[g.quarter].push(g);
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([q, list]) => ({ quarter: `${q} четв.`, avg: +calcAvg(list).toFixed(2) }));
  }, [safeGrades]);

  // Radar data by subject
  const radarData = subjectStats.map((s) => ({ subject: s.subject.slice(0, 8), avg: s.avg }));

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">Загрузка аналитики...</div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Моя аналитика</h1>
        <p className="text-sm text-gray-500 mt-0.5">Детальный анализ успеваемости</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Средний балл', value: overallAvg.toFixed(2), grad: gradeBg(overallAvg) },
          { label: 'Всего оценок', value: safeGrades.length, grad: 'from-violet-500 to-violet-600' },
          { label: 'Предметов', value: subjectStats.length, grad: 'from-blue-500 to-blue-600' },
          { label: 'Итоговых', value: safeQG.length, grad: 'from-amber-500 to-amber-600' },
        ].map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.grad} rounded-2xl p-5 text-white`}>
            <p className="text-xs opacity-70 uppercase tracking-wider font-medium">{c.label}</p>
            <p className="text-4xl font-extrabold mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Trend + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Динамика оценок</h2>
          {trendData.length < 2 ? (
            <p className="text-gray-400 text-sm text-center py-10">Недостаточно данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v, _, props) => [v, props.payload.subject]}
                  labelFormatter={(l) => l}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Оценка"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение оценок</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distribution} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} оценок`]} />
              <Bar dataKey="count" name="Кол-во" radius={[5, 5, 0, 0]}>
                {distribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Quarter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {radarData.length > 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Профиль успеваемости</h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar dataKey="avg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Tooltip formatter={(v) => [v.toFixed(2), 'Средний балл']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {quarterData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Средний балл по четвертям</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={quarterData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Ср. балл']} />
                <Bar dataKey="avg" name="Ср. балл" radius={[5, 5, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Subject table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Успеваемость по предметам</h2>
        {subjectStats.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Нет данных</p>
        ) : (
          <div className="space-y-3">
            {subjectStats
              .sort((a, b) => b.avg - a.avg)
              .map((s) => (
                <div key={s.subject} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700 truncate flex-shrink-0">{s.subject}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(s.avg / 5) * 100}%`, background: s.color }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-bold text-gray-800">{s.avg}</div>
                  <div className="w-16 text-right text-xs text-gray-400">{s.count} оц.</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
