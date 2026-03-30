import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useStudentsStore } from '../store/useStudentsStore';
import { useGradesStore } from '../store/useGradesStore';

const CLASSES = ['10A', '10B'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const calcAvg = (grades) => {
  if (!grades.length) return null;
  return grades.reduce((s, g) => s + g.grade, 0) / grades.length;
};

const riskLevel = (avg) => {
  if (avg === null) return 'none';
  if (avg < 2.5) return 'critical';
  if (avg < 3)   return 'high';
  if (avg < 3.5) return 'medium';
  return 'safe';
};

const RISK = {
  critical: { label: 'Критично',   cls: 'bg-red-100 text-red-700' },
  high:     { label: 'Риск',       cls: 'bg-orange-100 text-orange-700' },
  medium:   { label: 'Внимание',   cls: 'bg-amber-100 text-amber-700' },
  safe:     { label: 'В норме',    cls: 'bg-emerald-100 text-emerald-700' },
  none:     { label: 'Нет данных', cls: 'bg-gray-100 text-gray-500' },
};

export const TeacherDashboard = () => {
  const { students, fetchStudents } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();
  const [selectedClass, setSelectedClass] = useState('10A');

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const safe = Array.isArray(students) ? students : [];
    safe.forEach(s => fetchGrades(s.id));
  }, [students, fetchGrades]);

  const safeStudents = Array.isArray(students) ? students : [];
  const safeGrades   = Array.isArray(grades)   ? grades   : [];

  const classStudents = useMemo(
    () => safeStudents.filter(s => s.class === selectedClass),
    [safeStudents, selectedClass]
  );

  const studentStats = useMemo(() =>
    classStudents.map(s => {
      const sg   = safeGrades.filter(g => g.student_id === s.id);
      const avg  = calcAvg(sg);
      const risk = riskLevel(avg);
      return { ...s, avg, count: sg.length, risk };
    }),
  [classStudents, safeGrades]);

  const atRisk     = studentStats.filter(s => ['critical', 'high', 'medium'].includes(s.risk));
  const excellent  = studentStats.filter(s => s.risk === 'safe');
  const classAvg   = calcAvg(safeGrades.filter(g => classStudents.some(s => s.id === g.student_id)));

  const subjectData = useMemo(() => {
    const map = {};
    safeGrades.filter(g => classStudents.some(s => s.id === g.student_id)).forEach(g => {
      if (!map[g.subject]) map[g.subject] = [];
      map[g.subject].push(g.grade);
    });
    return Object.entries(map).map(([subject, list]) => ({
      subject: subject.slice(0, 8),
      avg: +(list.reduce((a, b) => a + b, 0) / list.length).toFixed(2),
    }));
  }, [safeGrades, classStudents]);

  const distData = [1, 2, 3, 4, 5].map(v => ({
    grade: `${v}`,
    count: safeGrades.filter(g => classStudents.some(s => s.id === g.student_id) && g.grade === v).length,
  }));
  const DIST_COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header + class selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Панель учителя</h1>
          <p className="text-sm text-gray-500 mt-0.5">Мониторинг успеваемости класса</p>
        </div>
        <div className="flex gap-1.5">
          {CLASSES.map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedClass === cls
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Учеников',    value: classStudents.length, sub: 'в классе',        color: 'from-blue-500 to-blue-600' },
          { label: 'В зоне риска', value: atRisk.length,       sub: 'требуют внимания', color: 'from-red-500 to-red-600' },
          { label: 'Ср. балл',    value: classAvg ? classAvg.toFixed(2) : '—', sub: 'по классу', color: 'from-violet-500 to-violet-600' },
          { label: 'Отличников',  value: excellent.length,     sub: 'успешных',         color: 'from-emerald-500 to-emerald-600' },
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
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Список учеников · {selectedClass}</h2>
          {classStudents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Нет данных</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-400 font-medium text-xs">Ученик</th>
                    <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs">Ср. балл</th>
                    <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs">Оценок</th>
                    <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((s, i) => (
                    <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img src={s.avatar} alt="" className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                          <span className="font-medium text-gray-800">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${
                          s.avg >= 4.5 ? 'text-emerald-600' :
                          s.avg >= 3.5 ? 'text-blue-600' :
                          s.avg >= 2.5 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {s.avg !== null ? s.avg.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-gray-500">{s.count}</td>
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

        {/* Early warning */}
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
                    <img src={s.avatar} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
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
                { label: 'Выставить оценки', color: 'hover:bg-blue-50 hover:text-blue-700' },
                { label: 'Сгенерировать отчёт AI', color: 'hover:bg-violet-50 hover:text-violet-700' },
                { label: 'Написать родителям', color: 'hover:bg-emerald-50 hover:text-emerald-700' },
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
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Средний балл по предметам</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => v.toFixed(2)} />
              <Bar dataKey="avg" name="Ср. балл" radius={[5, 5, 0, 0]}>
                {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение оценок</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v} оценок`]} />
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
