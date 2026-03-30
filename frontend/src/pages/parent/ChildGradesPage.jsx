import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useGradesStore } from '../../store/useGradesStore';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const TYPE_LABELS = {
  lesson: 'Урок',
  test: 'Контрольная',
  lab: 'Лабораторная',
  homework: 'Домашняя работа',
  exam: 'Экзамен',
};

const gradeColorClass = (g) => {
  if (g >= 5) return 'bg-green-100 text-green-700 border-green-200';
  if (g === 4) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (g === 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (g === 2) return 'bg-red-100 text-red-600 border-red-200';
  return 'bg-red-200 text-red-800 border-red-300';
};

const gradeTextColor = (avg) => {
  if (avg >= 4.5) return 'text-green-600';
  if (avg >= 3.5) return 'text-blue-600';
  if (avg >= 2.5) return 'text-yellow-600';
  return 'text-red-600';
};

export default function ChildGradesPage() {
  const user = useAuthStore((s) => s.user);
  const { students, fetchStudents } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();
  const [activeSubject, setActiveSubject] = useState('Все');

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (user?.children?.[0]) {
      fetchGrades(user.children[0]);
    }
  }, [user?.children, fetchGrades]);

  const childId = user?.children?.[0];
  const child = (Array.isArray(students) ? students : []).find((s) => s.id === childId);
  const safeGrades = Array.isArray(grades) ? grades : [];

  const subjects = ['Все', ...new Set(safeGrades.map((g) => g.subject))];

  const filteredGrades = activeSubject === 'Все'
    ? safeGrades
    : safeGrades.filter((g) => g.subject === activeSubject);

  const sortedGrades = [...filteredGrades].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Per-subject summary
  const subjectStats = [...new Set(safeGrades.map((g) => g.subject))].map((subj) => {
    const sg = safeGrades.filter((g) => g.subject === subj);
    const avg = sg.length > 0
      ? (sg.reduce((s, g) => s + g.grade, 0) / sg.length)
      : 0;
    return { subject: subj, avg: parseFloat(avg.toFixed(2)), count: sg.length };
  });

  const chartData = subjectStats.map((s) => ({
    name: s.subject.length > 10 ? s.subject.slice(0, 10) + '…' : s.subject,
    fullName: s.subject,
    avg: s.avg,
  }));

  const overallAvg = safeGrades.length > 0
    ? (safeGrades.reduce((s, g) => s + g.grade, 0) / safeGrades.length).toFixed(2)
    : '—';

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Оценки:{' '}
          <span className="text-blue-600">{child?.full_name ?? '...'}</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Класс: {child?.class ?? '—'} · Всего оценок: {safeGrades.length} · Средний балл: {overallAvg}
        </p>
      </div>

      {/* Subject summary cards */}
      {subjectStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {subjectStats.map((s) => (
            <button
              key={s.subject}
              onClick={() => setActiveSubject(activeSubject === s.subject ? 'Все' : s.subject)}
              className={`bg-white rounded-2xl shadow-sm border p-4 text-left transition-all hover:shadow-md ${
                activeSubject === s.subject ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-100'
              }`}
            >
              <p className="text-xs text-gray-500 truncate">{s.subject}</p>
              <div className="flex items-end justify-between mt-2">
                <span className={`text-2xl font-bold ${gradeTextColor(s.avg)}`}>
                  {s.avg.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">{s.count} оц.</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Средний балл по предметам</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, _, props) => [v, props.payload.fullName]}
                labelFormatter={() => ''}
              />
              <Bar dataKey="avg" name="Средний балл" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject filter tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Журнал оценок</h3>
          <span className="text-xs text-gray-400">{sortedGrades.length} записей</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setActiveSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeSubject === subj
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {sortedGrades.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">Нет оценок для отображения</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Дата</th>
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Предмет</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Оценка</th>
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Тип</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Вес</th>
                </tr>
              </thead>
              <tbody>
                {sortedGrades.map((g, i) => (
                  <tr
                    key={g.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                    }`}
                  >
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                      {new Date(g.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-800">{g.subject}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${gradeColorClass(g.grade)}`}
                      >
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {TYPE_LABELS[g.type] || g.type || '—'}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-400 text-xs">
                      {g.weight ?? 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
