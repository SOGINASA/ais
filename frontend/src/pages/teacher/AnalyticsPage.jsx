import React, { useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { useStudentsStore } from '../../store/useStudentsStore';

const COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981'];
const SUBJ_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const { classes, students, riskStudents, loading, fetchTeacherClasses, fetchClassStudents, fetchRiskStudents } = useStudentsStore();

  useEffect(() => {
    fetchTeacherClasses();
    fetchRiskStudents();
  }, [fetchTeacherClasses, fetchRiskStudents]);

  // Load students from first class for grade distribution
  useEffect(() => {
    const safeClasses = Array.isArray(classes) ? classes : [];
    if (safeClasses.length > 0) {
      fetchClassStudents(safeClasses[0].id);
    }
  }, [classes, fetchClassStudents]);

  const safeClasses      = useMemo(() => Array.isArray(classes)      ? classes      : [], [classes]);
  const safeStudents     = useMemo(() => Array.isArray(students)     ? students     : [], [students]);
  const safeRiskStudents = useMemo(() => Array.isArray(riskStudents) ? riskStudents : [], [riskStudents]);

  // Flatten student analytics
  const studentList = useMemo(() =>
    safeStudents.map((item) => {
      const user      = item.user ?? item;
      const analytics = item.analytics ?? {};
      return {
        id:           user.id,
        full_name:    user.full_name,
        avatar:       user.avatar,
        avg:          analytics.average_score != null ? Number(analytics.average_score) : null,
        grades_count: analytics.grades_count ?? 0,
        risk_level:   analytics.risk_level ?? 'low',
        attendance:   analytics.attendance_rate != null ? Math.round(analytics.attendance_rate * 100) : null,
      };
    }),
  [safeStudents]);

  const riskList = useMemo(() =>
    safeRiskStudents.map((item) => {
      const user      = item.user ?? item;
      const analytics = item.analytics ?? {};
      return {
        id:        user.id,
        full_name: user.full_name,
        avatar:    user.avatar,
        avg:       analytics.average_score != null ? +Number(analytics.average_score).toFixed(2) : null,
      };
    }).filter((s) => s.avg !== null).sort((a, b) => a.avg - b.avg),
  [safeRiskStudents]);

  const topStudents = useMemo(() =>
    [...studentList]
      .filter((s) => s.avg !== null)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5),
  [studentList]);

  const schoolAvg = useMemo(() => {
    const withAvg = studentList.filter((s) => s.avg !== null);
    if (!withAvg.length) return null;
    return (withAvg.reduce((s, x) => s + x.avg, 0) / withAvg.length).toFixed(2);
  }, [studentList]);

  // Grade distribution from avg buckets
  const gradeDist = [
    { grade: '≤2', count: studentList.filter((s) => s.avg !== null && s.avg <= 2).length, fill: '#ef4444' },
    { grade: '2–3', count: studentList.filter((s) => s.avg !== null && s.avg > 2 && s.avg < 3.5).length, fill: '#f59e0b' },
    { grade: '3–4', count: studentList.filter((s) => s.avg !== null && s.avg >= 3.5 && s.avg < 4.5).length, fill: '#3b82f6' },
    { grade: '≥4.5', count: studentList.filter((s) => s.avg !== null && s.avg >= 4.5).length, fill: '#10b981' },
  ];

  const pieData = gradeDist.map((d) => ({ name: d.grade, value: d.count }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Аналитика</h1>
        <p className="text-sm text-gray-500 mt-0.5">Общая картина успеваемости и посещаемости</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Классов',      value: safeClasses.length,      color: 'from-blue-500 to-blue-600' },
          { label: 'Учеников',     value: studentList.length,      color: 'from-violet-500 to-violet-600' },
          { label: 'Ср. балл',     value: schoolAvg || '—',        color: 'from-emerald-500 to-emerald-600' },
          { label: 'В зоне риска', value: riskList.length,         color: 'from-red-500 to-red-600' },
        ].map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white`}>
            <p className="text-xs opacity-70 uppercase tracking-wider font-medium">{c.label}</p>
            <p className="text-4xl font-extrabold mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение среднего балла</h2>
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-10">Загрузка...</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Средний балл по группам</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeDist} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} учеников`]} />
              <Bar dataKey="count" name="Учеников" radius={[5, 5, 0, 0]}>
                {gradeDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top students + At-risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Топ учеников</h2>
          {topStudents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{i + 1}</span>
                  <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.full_name}</p>
                    {s.attendance != null && <p className="text-xs text-gray-400">посещ. {s.attendance}%</p>}
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{s.avg?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Требуют внимания</h2>
          {riskList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-emerald-600 font-medium">Всё в порядке</p>
              <p className="text-xs text-gray-400 mt-1">Нет учеников в зоне риска</p>
            </div>
          ) : (
            <div className="space-y-3">
              {riskList.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${(s.avg / 5) * 100}%` }} />
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
