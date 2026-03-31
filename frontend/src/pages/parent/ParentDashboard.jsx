import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useParentStore } from '../../store/useParentStore';

const COLORS = ['#10b981', '#ef4444'];

const val = (g) => g.score ?? g.grade ?? 0;

const gradeColor = (g) => {
  if (g >= 5) return 'bg-green-100 text-green-700';
  if (g === 4) return 'bg-blue-100 text-blue-700';
  if (g === 3) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const TYPE_LABELS = {
  lesson: 'Урок',
  test: 'Контрольная',
  lab: 'Лабораторная',
  homework: 'Домашняя',
  exam: 'Экзамен',
};

export default function ParentDashboard() {
  const {
    child, grades, attendance, schedule,
    fetchChild, fetchGrades, fetchAttendance, fetchSchedule,
  } = useParentStore();

  useEffect(() => {
    fetchChild();
    fetchGrades();
    fetchAttendance();
    fetchSchedule();
  }, [fetchChild, fetchGrades, fetchAttendance, fetchSchedule]);

  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeAttendance = Array.isArray(attendance) ? attendance : [];
  const safeSchedule = Array.isArray(schedule) ? schedule : [];

  const avgGrade = useMemo(() => {
    if (!safeGrades.length) return '—';
    const total = safeGrades.reduce((s, g) => s + val(g) * (g.weight || 1), 0);
    const w = safeGrades.reduce((s, g) => s + (g.weight || 1), 0);
    return w ? (total / w).toFixed(2) : '—';
  }, [safeGrades]);

  const presentCount = safeAttendance.filter((a) => a.status === 'present').length;
  const absentCount  = safeAttendance.filter((a) => a.status === 'absent').length;
  const totalAttendance = safeAttendance.length;
  const attendancePct = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '—';

  const recentGrades = [...safeGrades]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const pieData = [
    { name: 'Присутствовал', value: presentCount },
    { name: 'Отсутствовал', value: absentCount },
  ];

  // Today's schedule (filter by day_of_week)
  const todayDow = new Date().getDay(); // 0=Sun,1=Mon,...
  const todayLessons = safeSchedule.filter((s) => s.day_of_week === todayDow);

  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const today = new Date();
  const todayLabel = `${days[today.getDay()]}, ${today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд родителя</h1>
          <p className="text-sm text-gray-500 mt-1">Мониторинг успеваемости вашего ребёнка</p>
        </div>
      </div>

      {/* Child info */}
      {child ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center gap-5">
            <img
              src={child.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.id}`}
              alt={child.full_name}
              className="w-16 h-16 rounded-full border-2 border-white/50 bg-white/20"
            />
            <div className="flex-1">
              <p className="text-blue-100 text-sm font-medium">Ваш ребёнок</p>
              <h2 className="text-2xl font-bold mt-0.5">{child.full_name}</h2>
              <p className="text-blue-100 text-sm mt-1">Класс: {child.class_name || child.class || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs uppercase tracking-wider">Средний балл</p>
              <p className="text-4xl font-extrabold mt-1">{avgGrade}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
          Загрузка данных ребёнка...
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Средний балл</p>
          <p className="text-4xl font-extrabold mt-2">{avgGrade}</p>
          <p className="text-blue-100 text-xs mt-1">по всем предметам</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Посещаемость</p>
          <p className="text-4xl font-extrabold mt-2">{attendancePct}{attendancePct !== '—' ? '%' : ''}</p>
          <p className="text-emerald-100 text-xs mt-1">{presentCount} из {totalAttendance} уроков</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-violet-100 text-xs font-medium uppercase tracking-wider">Всего оценок</p>
          <p className="text-4xl font-extrabold mt-2">{safeGrades.length}</p>
          <p className="text-violet-100 text-xs mt-1">за текущий период</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Пропусков</p>
          <p className="text-4xl font-extrabold mt-2">{absentCount}</p>
          <p className="text-red-100 text-xs mt-1">уроков</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent grades */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Последние оценки</h3>
            <Link to="/parent/grades" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Все оценки →
            </Link>
          </div>
          {recentGrades.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Оценки не найдены</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Дата</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Предмет</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-medium">Оценка</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Тип</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGrades.map((g, i) => (
                    <tr key={g.id || i} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="py-2.5 px-3 text-gray-500">
                        {new Date(g.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-800">{g.subject}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${gradeColor(val(g))}`}>
                          {val(g)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{TYPE_LABELS[g.type] || g.type || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Посещаемость</h3>
          {totalAttendance === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Данные не найдены</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} уроков`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
              <p className="text-xs text-gray-500">присутствий</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{absentCount}</p>
              <p className="text-xs text-gray-500">пропусков</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's schedule + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Расписание на сегодня</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{todayLabel}</span>
          </div>
          {todayLessons.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Уроков сегодня нет</p>
          ) : (
            <div className="space-y-2">
              {todayLessons.map((lesson, i) => (
                <div key={lesson.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                  <span className="text-xs font-mono text-gray-400 w-10 shrink-0">
                    {lesson.start_time || `${7 + lesson.time_slot}:00`}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{lesson.subject_name || lesson.subject}</p>
                    <p className="text-xs text-gray-400">{lesson.teacher_name || ''}</p>
                  </div>
                  {lesson.room && (
                    <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shrink-0">
                      Каб. {lesson.room}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Быстрые ссылки</h3>
          <div className="space-y-3">
            <Link to="/parent/grades" className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Дневник оценок</p>
                <p className="text-xs text-blue-500">Подробная статистика</p>
              </div>
            </Link>
            <Link to="/parent/attendance" className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Посещаемость</p>
                <p className="text-xs text-emerald-500">Журнал посещений</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
