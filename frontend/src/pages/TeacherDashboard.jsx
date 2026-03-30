import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useStudentsStore } from '../store/useStudentsStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const RISK = {
  critical: { label: 'Критично',   cls: 'bg-red-100 text-red-700' },
  high:     { label: 'Риск',       cls: 'bg-orange-100 text-orange-700' },
  medium:   { label: 'Внимание',   cls: 'bg-amber-100 text-amber-700' },
  safe:     { label: 'В норме',    cls: 'bg-emerald-100 text-emerald-700' },
  none:     { label: 'Нет данных', cls: 'bg-gray-100 text-gray-500' },
};

const mapRisk = (avg, backendRisk) => {
  if (backendRisk === 'critical') return 'critical';
  if (backendRisk === 'warning') return avg !== null && avg < 3 ? 'high' : 'medium';
  if (avg === null) return 'none';
  return 'safe';
};

export const TeacherDashboard = () => {
  const {
    classes,
    students,
    loading,
    fetchTeacherClasses,
    fetchClassStudents,
    fetchRiskStudents,
  } = useStudentsStore();

  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchTeacherClasses();
    fetchRiskStudents();
  }, [fetchTeacherClasses, fetchRiskStudents]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      const first = classes[0];
      setSelectedClass(first);
      fetchClassStudents(first.id);
    }
  }, [classes, selectedClass, fetchClassStudents]);

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    fetchClassStudents(cls.id);
  };

  // Нормализуем данные из API: { user, analytics } → плоский объект для UI
  const studentStats = useMemo(() =>
    (Array.isArray(students) ? students : []).map(item => {
      const student = item.user || item;
      const analytics = item.analytics || {};
      const avg = analytics.average_score ?? null;
      return {
        id: student.id,
        full_name: student.name || student.full_name || '—',
        avatar: student.avatar || null,
        avg,
        count: analytics.grades_count ?? 0,
        attendancePct: analytics.attendance_rate != null ? `${analytics.attendance_rate}%` : '—',
        risk: mapRisk(avg, analytics.risk_level),
      };
    }),
  [students]);

  const atRisk    = studentStats.filter(s => ['critical', 'high', 'medium'].includes(s.risk));
  const excellent = studentStats.filter(s => s.risk === 'safe');
  const classAvg  = useMemo(() => {
    const vals = studentStats.map(s => s.avg).filter(v => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }, [studentStats]);

  // Распределение студентов по среднему баллу (1–5)
  const distData = [1, 2, 3, 4, 5].map(v => ({
    grade: `${v}`,
    count: studentStats.filter(s => {
      const a = s.avg;
      if (a === null) return false;
      if (v === 1) return a < 2;
      if (v === 2) return a >= 2 && a < 3;
      if (v === 3) return a >= 3 && a < 3.5;
      if (v === 4) return a >= 3.5 && a < 4.5;
      return a >= 4.5;
    }).length,
  }));
  const DIST_COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981'];

  // Топ студентов по баллу для барчарта
  const topStudentsData = useMemo(() =>
    [...studentStats]
      .filter(s => s.avg !== null)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8)
      .map(s => ({
        name: (s.full_name || '').split(' ')[0],
        avg: +s.avg.toFixed(2),
      })),
  [studentStats]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header + class selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Панель учителя</h1>
          <p className="text-sm text-gray-500 mt-0.5">Мониторинг успеваемости класса</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(Array.isArray(classes) ? classes : []).map(cls => (
            <button
              key={cls.id}
              onClick={() => handleSelectClass(cls)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedClass?.id === cls.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {cls.name}
            </button>
          ))}
          {classes.length === 0 && !loading && (
            <span className="text-sm text-gray-400">Нет закреплённых классов</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Учеников',     value: studentStats.length, sub: 'в классе',         color: 'from-blue-500 to-blue-600' },
          { label: 'В зоне риска', value: atRisk.length,        sub: 'требуют внимания', color: 'from-red-500 to-red-600' },
          { label: 'Ср. балл',     value: classAvg ? classAvg.toFixed(2) : '—', sub: 'по классу', color: 'from-violet-500 to-violet-600' },
          { label: 'Отличников',   value: excellent.length,     sub: 'успешных',          color: 'from-emerald-500 to-emerald-600' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white`}>
            <p className="text-xs opacity-70 uppercase tracking-wider font-medium">{c.label}</p>
            <p className="text-4xl font-extrabold mt-2">{c.value}</p>
            <p className="text-xs opacity-60 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Список учеников · {selectedClass?.name || '—'}
          </h2>
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Загрузка...</p>
          ) : studentStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Нет данных</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-400 font-medium text-xs">Ученик</th>
                    <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs">Ср. балл</th>
                    <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs">Посещ.</th>
                    <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {s.avatar ? (
                            <img src={s.avatar} alt="" className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                              {s.full_name?.[0] || '?'}
                            </div>
                          )}
                          <span className="font-medium text-gray-800">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${
                          s.avg === null ? 'text-gray-400' :
                          s.avg >= 4.5 ? 'text-emerald-600' :
                          s.avg >= 3.5 ? 'text-blue-600' :
                          s.avg >= 2.5 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {s.avg !== null ? s.avg.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-gray-500">{s.attendancePct}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${RISK[s.risk].cls}`}>
                          {RISK[s.risk].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Early warning + actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">⚠ Early Warning</h2>
            {atRisk.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-emerald-600 font-medium text-sm">Всё в порядке</p>
                <p className="text-xs text-gray-400 mt-1">Нет учеников в зоне риска</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {atRisk.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50 border border-red-100">
                    <div className="w-7 h-7 rounded-full bg-red-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-red-700">
                      {s.full_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-800 truncate">{s.full_name}</p>
                      <p className="text-xs text-red-500">Балл: {s.avg !== null ? s.avg.toFixed(2) : '—'}</p>
                    </div>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${RISK[s.risk].cls}`}>
                      {RISK[s.risk].label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Быстрые действия</h2>
            <div className="space-y-2">
              {[
                { label: 'Выставить оценки',      color: 'hover:bg-blue-50 hover:text-blue-700' },
                { label: 'Сгенерировать отчёт AI', color: 'hover:bg-violet-50 hover:text-violet-700' },
                { label: 'Написать родителям',     color: 'hover:bg-emerald-50 hover:text-emerald-700' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => alert('Функция в разработке')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-100 transition-colors ${a.color}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Топ учеников по баллу</h2>
          {topStudentsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topStudentsData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => v.toFixed(2)} />
                <Bar dataKey="avg" name="Ср. балл" radius={[5, 5, 0, 0]}>
                  {topStudentsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">Нет данных</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение по среднему баллу</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v} учеников`]} />
              <Bar dataKey="count" name="Количество" radius={[5, 5, 0, 0]}>
                {distData.map((_, i) => <Cell key={i} fill={DIST_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
