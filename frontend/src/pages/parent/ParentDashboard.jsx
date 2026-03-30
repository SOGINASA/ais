import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useGradesStore } from '../../store/useGradesStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useAchievementsStore } from '../../store/useAchievementsStore';

const COLORS = ['#10b981', '#ef4444'];

const TYPE_LABELS = {
  lesson: 'Урок',
  test: 'Контрольная',
  lab: 'Лабораторная',
  homework: 'Домашняя работа',
  exam: 'Экзамен',
};

const gradeColor = (g) => {
  if (g >= 5) return 'bg-green-100 text-green-700';
  if (g === 4) return 'bg-blue-100 text-blue-700';
  if (g === 3) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const FAKE_SCHEDULE = [
  { time: '08:00', subject: 'Алгебра', room: '201', teacher: 'Дарья Иванова' },
  { time: '09:00', subject: 'Физика', room: '305', teacher: 'Сергей Петров' },
  { time: '10:00', subject: 'Казахский язык', room: '112', teacher: 'Ақерке Мусабаева' },
  { time: '11:00', subject: 'Английский язык', room: '214', teacher: 'Ирина Сидорова' },
  { time: '12:00', subject: 'История', room: '108', teacher: 'Игорь Козлов' },
];

export default function ParentDashboard() {
  const user = useAuthStore((s) => s.user);
  const { students, fetchStudents } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();
  const { attendance, fetchAttendance } = useAttendanceStore();
  const { achievements, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (user?.children?.[0]) {
      fetchGrades(user.children[0]);
      fetchAttendance(user.children[0]);
      fetchAchievements(user.children[0]);
    }
  }, [user?.children, fetchGrades, fetchAttendance, fetchAchievements]);

  const childId = user?.children?.[0];
  const child = (Array.isArray(students) ? students : []).find((s) => s.id === childId);

  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeAttendance = Array.isArray(attendance) ? attendance : [];
  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  // Computed stats
  const avgGrade =
    safeGrades.length > 0
      ? (safeGrades.reduce((sum, g) => sum + g.grade, 0) / safeGrades.length).toFixed(2)
      : '—';

  const presentCount = safeAttendance.filter((a) => a.status === 'present').length;
  const absentCount = safeAttendance.filter((a) => a.status === 'absent').length;
  const totalAttendance = safeAttendance.length;
  const attendancePct =
    totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '—';

  const recentGrades = [...safeGrades]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const pieData = [
    { name: 'Присутствовал', value: presentCount },
    { name: 'Отсутствовал', value: absentCount },
  ];

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
        <button
          onClick={() => alert('Функция в разработке')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
          </svg>
          Связаться с учителем
        </button>
      </div>

      {/* Child info card */}
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
              <p className="text-blue-100 text-sm mt-1">Класс: {child.class}</p>
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
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-amber-100 text-xs font-medium uppercase tracking-wider">Достижения</p>
          <p className="text-4xl font-extrabold mt-2">{safeAchievements.length}</p>
          <p className="text-amber-100 text-xs mt-1">наград получено</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-violet-100 text-xs font-medium uppercase tracking-wider">Всего оценок</p>
          <p className="text-4xl font-extrabold mt-2">{safeGrades.length}</p>
          <p className="text-violet-100 text-xs mt-1">за текущий период</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent grades table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Последние оценки</h3>
            <Link
              to="/parent/grades"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
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
                    <tr
                      key={g.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="py-2.5 px-3 text-gray-500">
                        {new Date(g.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-800">{g.subject}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${gradeColor(g.grade)}`}>
                          {g.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">
                        {TYPE_LABELS[g.type] || g.type || '—'}
                      </td>
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
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
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

      {/* Schedule + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Расписание на сегодня</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{todayLabel}</span>
          </div>
          <div className="space-y-2">
            {FAKE_SCHEDULE.map((lesson, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <span className="text-xs font-mono text-gray-400 w-10 shrink-0">{lesson.time}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{lesson.subject}</p>
                  <p className="text-xs text-gray-400">{lesson.teacher}</p>
                </div>
                <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shrink-0">
                  Каб. {lesson.room}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Быстрые ссылки</h3>
          <div className="space-y-3">
            <Link
              to="/parent/grades"
              className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
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
            <Link
              to="/parent/attendance"
              className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors group"
            >
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
            <button
              onClick={() => alert('Функция в разработке')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-900">Написать учителю</p>
                <p className="text-xs text-amber-500">Связаться напрямую</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
