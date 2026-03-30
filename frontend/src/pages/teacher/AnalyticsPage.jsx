import React, { useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  LineChart, Line,
} from 'recharts';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useGradesStore } from '../../store/useGradesStore';

const COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981'];
const SUBJ_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const FAKE_ATTENDANCE = [
  { week: 'Нед 1', pct: 88 }, { week: 'Нед 2', pct: 91 }, { week: 'Нед 3', pct: 86 },
  { week: 'Нед 4', pct: 93 }, { week: 'Нед 5', pct: 89 }, { week: 'Нед 6', pct: 95 },
];

export default function AnalyticsPage() {
  const { students, fetchStudents } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => {
    [1, 2, 3, 4].forEach(id => fetchGrades(id));
  }, [fetchGrades]);

  const safeStudents = useMemo(() => Array.isArray(students) ? students : [], [students]);
  const safeGrades   = useMemo(() => Array.isArray(grades)   ? grades   : [], [grades]);

  const schoolAvg = useMemo(() => {
    if (!safeGrades.length) return null;
    return (safeGrades.reduce((s, g) => s + g.grade, 0) / safeGrades.length).toFixed(2);
  }, [safeGrades]);

  const atRiskCount = useMemo(() => {
    return safeStudents.filter(s => {
      const sg  = safeGrades.filter(g => g.student_id === s.id);
      if (!sg.length) return false;
      const avg = sg.reduce((a, g) => a + g.grade, 0) / sg.length;
      return avg < 3.5;
    }).length;
  }, [safeStudents, safeGrades]);

  const gradeDist = [1, 2, 3, 4, 5].map(v => ({
    grade: `${v}`,
    count: safeGrades.filter(g => g.grade === v).length,
  }));

  const pieData = gradeDist.map(d => ({ name: `Оценка ${d.grade}`, value: d.count }));

  const subjectData = useMemo(() => {
    const map = {};
    safeGrades.forEach(g => {
      if (!map[g.subject]) map[g.subject] = [];
      map[g.subject].push(g.grade);
    });
    return Object.entries(map).map(([subj, list]) => ({
      subject: subj.slice(0, 8),
      avg: +(list.reduce((a, b) => a + b, 0) / list.length).toFixed(2),
    }));
  }, [safeGrades]);

  const topStudents = useMemo(() =>
    safeStudents
      .map(s => {
        const sg  = safeGrades.filter(g => g.student_id === s.id);
        const avg = sg.length ? sg.reduce((a, g) => a + g.grade, 0) / sg.length : 0;
        return { ...s, avg: +avg.toFixed(2) };
      })
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5),
  [safeStudents, safeGrades]);

  const atRiskList = useMemo(() =>
    safeStudents
      .map(s => {
        const sg  = safeGrades.filter(g => g.student_id === s.id);
        const avg = sg.length ? sg.reduce((a, g) => a + g.grade, 0) / sg.length : null;
        return { ...s, avg: avg ? +avg.toFixed(2) : null };
      })
      .filter(s => s.avg !== null && s.avg < 3.5)
      .sort((a, b) => a.avg - b.avg),
  [safeStudents, safeGrades]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Аналитика</h1>
        <p className="text-sm text-gray-500 mt-0.5">Общая картина успеваемости и посещаемости</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Учеников',    value: safeStudents.length || 4, color: 'from-blue-500 to-blue-600' },
          { label: 'Оценок',      value: safeGrades.length,        color: 'from-violet-500 to-violet-600' },
          { label: 'Ср. балл',    value: schoolAvg || '—',         color: 'from-emerald-500 to-emerald-600' },
          { label: 'В зоне риска',value: atRiskCount,              color: 'from-red-500 to-red-600' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white`}>
            <p className="text-xs opacity-70 uppercase tracking-wider font-medium">{c.label}</p>
            <p className="text-4xl font-extrabold mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение оценок</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Ср. балл по предметам</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => v.toFixed(2)} />
              <Bar dataKey="avg" name="Ср. балл" radius={[5, 5, 0, 0]}>
                {subjectData.map((_, i) => <Cell key={i} fill={SUBJ_COLORS[i % SUBJ_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Посещаемость по неделям</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={FAKE_ATTENDANCE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={v => `${v}%`} />
              <Line type="monotone" dataKey="pct" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top students + At-risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Топ учеников</h2>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-amber-400 text-white' :
                  i === 1 ? 'bg-gray-300 text-gray-700' :
                  i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{i + 1}</span>
                <img src={s.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.full_name}</p>
                  <p className="text-xs text-gray-400">{s.class}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{s.avg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Требуют внимания</h2>
          {atRiskList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-emerald-600 font-medium">Всё в порядке</p>
              <p className="text-xs text-gray-400 mt-1">Нет учеников в зоне риска</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskList.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <img src={s.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded-full"
                          style={{ width: `${(s.avg / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-red-600 font-medium w-6 text-right">{s.avg}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
