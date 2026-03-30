import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useGradesStore } from '../../store/useGradesStore';

const TABS = [
  { id: 'performance', label: 'Успеваемость' },
  { id: 'attendance',  label: 'Посещаемость' },
  { id: 'rankings',    label: 'Рейтинг' },
];

const COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981'];
const PIE_COLORS = ['#10b981', '#ef4444'];

const CLASS_ATTENDANCE = [
  { class: '10A', present: 91, absent: 9 },
  { class: '10B', present: 84, absent: 16 },
];

export default function ReportsPage() {
  const [tab, setTab] = useState('performance');
  const { students, fetchStudents } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { [1, 2, 3, 4].forEach(id => fetchGrades(id)); }, [fetchGrades]);

  const safeStudents = Array.isArray(students) ? students : [];
  const safeGrades   = Array.isArray(grades)   ? grades   : [];

  const schoolAvg = useMemo(() => {
    if (!safeGrades.length) return '—';
    return (safeGrades.reduce((s, g) => s + g.grade, 0) / safeGrades.length).toFixed(2);
  }, [safeGrades]);

  const subjectStats = useMemo(() => {
    const map = {};
    safeGrades.forEach(g => {
      if (!map[g.subject]) map[g.subject] = { list: [], students: [] };
      map[g.subject].list.push(g.grade);
      if (!map[g.subject].students.includes(g.student_id)) map[g.subject].students.push(g.student_id);
    });
    return Object.entries(map).map(([subj, { list, students: sids }]) => {
      const avg = list.reduce((a, b) => a + b, 0) / list.length;
      const best = safeStudents.find(s => {
        const sg = safeGrades.filter(g => g.subject === subj && g.student_id === s.id);
        if (!sg.length) return false;
        const a = sg.reduce((x, g) => x + g.grade, 0) / sg.length;
        return a === Math.max(...sids.map(id => {
          const x = safeGrades.filter(g => g.subject === subj && g.student_id === id);
          return x.length ? x.reduce((a, g) => a + g.grade, 0) / x.length : 0;
        }));
      });
      return { subject: subj, avg: +avg.toFixed(2), best: best?.full_name || '—' };
    });
  }, [safeGrades, safeStudents]);

  const classData = useMemo(() => {
    return ['10A', '10B'].map(cls => {
      const clsStudents = safeStudents.filter(s => s.class === cls);
      const clsGrades = safeGrades.filter(g => clsStudents.some(s => s.id === g.student_id));
      const avg = clsGrades.length
        ? clsGrades.reduce((a, g) => a + g.grade, 0) / clsGrades.length
        : 0;
      return { class: cls, avg: +avg.toFixed(2) };
    });
  }, [safeStudents, safeGrades]);

  const rankings = useMemo(() =>
    safeStudents
      .map(s => {
        const sg  = safeGrades.filter(g => g.student_id === s.id);
        const avg = sg.length ? sg.reduce((a, g) => a + g.grade, 0) / sg.length : 0;
        return { ...s, avg: +avg.toFixed(2) };
      })
      .sort((a, b) => b.avg - a.avg),
  [safeStudents, safeGrades]);

  const gradeDist = [1, 2, 3, 4, 5].map(v => ({
    grade: `${v}`,
    count: safeGrades.filter(g => g.grade === v).length,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Отчёты</h1>
          <p className="text-sm text-gray-500 mt-0.5">Сводная аналитика по школе</p>
        </div>
        <button
          onClick={() => alert('Экспорт PDF — функция в разработке')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Экспорт PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Performance */}
      {tab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <p className="text-xs opacity-70 uppercase tracking-wider">Средний балл по школе</p>
              <p className="text-5xl font-extrabold mt-2">{schoolAvg}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">По классам</h2>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={classData} barSize={40}>
                  <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avg" name="Ср. балл" radius={[5, 5, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение оценок</h2>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={gradeDist} barSize={28}>
                  <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {gradeDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">По предметам</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Предмет', 'Ср. балл', 'Лучший ученик'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-gray-400 text-xs font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subjectStats.map((s, i) => (
                    <tr key={s.subject} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                      <td className="py-3 px-3 font-medium text-gray-800">{s.subject}</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold text-sm ${
                          s.avg >= 4.5 ? 'text-emerald-600' :
                          s.avg >= 3.5 ? 'text-blue-600' :
                          s.avg >= 2.5 ? 'text-amber-600' : 'text-red-600'
                        }`}>{s.avg}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{s.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance */}
      {tab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Общая посещаемость</h2>
            <p className="text-4xl font-extrabold text-gray-900 mb-4">87%</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[{ name: 'Присутствовал', value: 87 }, { name: 'Отсутствовал', value: 13 }]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value"
                >
                  {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip formatter={v => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">По классам</h2>
            <div className="space-y-4">
              {CLASS_ATTENDANCE.map(c => (
                <div key={c.class}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{c.class}</span>
                    <span className="text-sm font-bold text-gray-900">{c.present}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.present}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-emerald-600">✓ {c.present}% присутствует</span>
                    <span className="text-xs text-red-500">{c.absent}% пропускает</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rankings */}
      {tab === 'rankings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Топ учеников</h2>
            <div className="space-y-3">
              {rankings.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>{i + 1}</span>
                  <img src={s.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-400">{s.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{s.avg}</p>
                    <p className="text-xs text-gray-400">балл</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Требуют внимания</h2>
            <div className="space-y-3">
              {rankings.slice(-3).reverse().map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                  <img src={s.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${(s.avg / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600">{s.avg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
