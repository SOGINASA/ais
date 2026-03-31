import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useStudentGrades } from '../../hooks/useStudentGrades';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const SUBJECTS = ['Алгебра', 'Геометрия', 'Физика', 'Казахский язык'];
const TYPES = ['lesson', 'quiz', 'lab'];
const TYPE_LABELS = { lesson: 'Урок', quiz: 'Контрольная', lab: 'Лаб. работа' };
const QUARTERS = ['1', '2', '3', '4'];

const gradeBg = (g) => {
  if (g >= 5) return 'bg-emerald-100 text-emerald-700';
  if (g >= 4) return 'bg-blue-100 text-blue-700';
  if (g >= 3) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const avgColor = (avg) => {
  if (avg >= 4.5) return 'bg-emerald-500 text-white';
  if (avg >= 3.5) return 'bg-blue-500 text-white';
  if (avg >= 2.5) return 'bg-amber-500 text-white';
  return 'bg-red-500 text-white';
};

const val = (g) => g.score ?? g.grade ?? 0;

const calcAvg = (list) => {
  if (!list.length) return 0;
  const total = list.reduce((s, g) => s + val(g) * (g.weight || 1), 0);
  const w = list.reduce((s, g) => s + (g.weight || 1), 0);
  return w ? total / w : 0;
};

export default function GradesPage() {
  const { grades, quarterGrades, loading } = useStudentGrades();

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [quarterFilter, setQuarterFilter] = useState('all');

  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeQG = Array.isArray(quarterGrades) ? quarterGrades : [];

  const filtered = useMemo(() => safeGrades.filter(g => {
    if (subjectFilter !== 'all' && g.subject !== subjectFilter) return false;
    if (typeFilter !== 'all' && g.type !== typeFilter) return false;
    if (quarterFilter !== 'all' && String(g.quarter) !== quarterFilter) return false;
    return true;
  }), [safeGrades, subjectFilter, typeFilter, quarterFilter]);

  const overallAvg = calcAvg(safeGrades);

  const subjectStats = useMemo(() => {
    const map = {};
    safeGrades.forEach(g => {
      if (!map[g.subject]) map[g.subject] = [];
      map[g.subject].push(g);
    });
    return Object.entries(map).map(([subject, list], i) => {
      const avg = calcAvg(list);
      const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
      const trend = list.length >= 2
        ? (calcAvg(list.slice(-3)) > calcAvg(list.slice(0, 3)) ? 'up' : 'down')
        : 'flat';
      return { subject, avg: +avg.toFixed(2), count: list.length, trend, color: COLORS[i % COLORS.length] };
    });
  }, [safeGrades]);

  const barData = subjectStats.map(s => ({ subject: s.subject.slice(0, 6), avg: s.avg }));

  const sortedFiltered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const trendIcon = (t) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
  const trendColor = (t) => t === 'up' ? 'text-emerald-600' : t === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои оценки</h1>
            <p className="text-gray-500 text-sm mt-1">
              Общий средний балл: <span className="font-semibold text-gray-800">{overallAvg.toFixed(2)}</span>
              {' · '}{safeGrades.length} оценок
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-500 self-center mr-1">Предмет:</span>
            {['all', ...SUBJECTS].map(s => (
              <button key={s} onClick={() => setSubjectFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${subjectFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s === 'all' ? 'Все' : s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-500 self-center mr-1">Тип:</span>
            {['all', ...TYPES].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${typeFilter === t ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t === 'all' ? 'Все' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-500 self-center mr-1">Четверть:</span>
            {['all', ...QUARTERS].map(q => (
              <button key={q} onClick={() => setQuarterFilter(q)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${quarterFilter === q ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {q === 'all' ? 'Все' : `${q} четв.`}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectStats.map(s => (
            <div key={s.subject} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-500 truncate">{s.subject}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-lg font-bold px-2 py-0.5 rounded-lg ${avgColor(s.avg)}`}>{s.avg}</span>
                <span className={`text-lg font-bold ${trendColor(s.trend)}`}>{trendIcon(s.trend)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{s.count} оценок</p>
            </div>
          ))}
        </div>

        {/* Chart + Quarter Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Средний балл по предметам</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => v.toFixed(2)} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} name="Средний балл">
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {safeQG.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Итоговые оценки</h2>
              <ul className="space-y-3">
                {safeQG.map((qg, i) => (
                  <li key={qg.id || i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{qg.subject}</p>
                      <p className="text-xs text-gray-400">{qg.quarter ? `${qg.quarter} четверть` : ''}</p>
                    </div>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${gradeBg(val(qg))}`}>{val(qg)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Журнал оценок {filtered.length !== safeGrades.length && <span className="text-sm font-normal text-gray-400">({filtered.length} из {safeGrades.length})</span>}
          </h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Загрузка...</p>
          ) : sortedFiltered.length === 0 ? (
            <p className="text-gray-400 text-sm">Оценок нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600 rounded-l-lg">Дата</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Предмет</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Тип</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Оценка</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Вес</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 rounded-r-lg">Учитель</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((g, i) => (
                    <tr key={g.id || i} className={`border-t border-gray-50 hover:bg-blue-50 transition ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 text-gray-500">{g.date ? new Date(g.date).toLocaleDateString('ru-RU') : '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{g.subject}</td>
                      <td className="px-4 py-3 text-gray-500">{TYPE_LABELS[g.type] || g.type}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg font-bold ${gradeBg(val(g))}`}>{val(g)}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{g.weight}</td>
                      <td className="px-4 py-3 text-gray-500">{g.teacher_name || `Учитель ${g.teacher_id}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
