import { useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useGradesStore } from '../../store/useGradesStore';

const GRADE_COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981'];

const ACTIVITY_FEED = [
  { id: 1, text: 'Дарья Иванова выставила 5 оценок', time: '5 мин назад', icon: '📝', color: 'bg-blue-100 text-blue-600' },
  { id: 2, text: 'Айман Смагулов получил достижение «Отличник»', time: '23 мин назад', icon: '🏆', color: 'bg-amber-100 text-amber-600' },
  { id: 3, text: 'Берик Оспанов — низкая посещаемость (62%)', time: '1 час назад', icon: '⚠️', color: 'bg-red-100 text-red-600' },
  { id: 4, text: 'Новый ученик добавлен: Гульнур Нурова', time: '2 часа назад', icon: '👤', color: 'bg-emerald-100 text-emerald-600' },
  { id: 5, text: 'Сергей Петров обновил расписание', time: '3 часа назад', icon: '📅', color: 'bg-violet-100 text-violet-600' },
  { id: 6, text: 'Айнур Жанова сдала контрольную работу', time: '5 часов назад', icon: '✅', color: 'bg-emerald-100 text-emerald-600' },
];

const MOCK_TEACHERS = [
  { id: 101, full_name: 'Дарья Иванова', specialization: 'Математика', subjects: ['Алгебра', 'Геометрия'], phone: '+7 777 111 0001', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daria' },
  { id: 102, full_name: 'Сергей Петров', specialization: 'Физика', subjects: ['Физика'], phone: '+7 777 111 0002', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sergey' },
  { id: 103, full_name: 'Ақерке Мусабаева', specialization: 'Казахский язык', subjects: ['Казахский язык', 'Литература'], phone: '+7 777 111 0003', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aqerke' },
  { id: 104, full_name: 'Ирина Сидорова', specialization: 'Английский язык', subjects: ['Английский язык'], phone: '+7 777 111 0004', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irina' },
  { id: 105, full_name: 'Игорь Козлов', specialization: 'История', subjects: ['История', 'Обществознание'], phone: '+7 777 111 0005', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=igor' },
];

export default function AdminDashboard() {
  const { students, fetchStudents } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    // Load grades for all known student IDs (1-4)
    [1, 2, 3, 4].forEach((id) => fetchGrades(id));
  }, [fetchGrades]);

  const safeStudents = Array.isArray(students) ? students : [];
  const safeGrades = Array.isArray(grades) ? grades : [];

  // Grade distribution
  const gradeDist = [1, 2, 3, 4, 5].map((v) => ({
    grade: `Оценка ${v}`,
    count: safeGrades.filter((g) => g.grade === v).length,
  }));

  // Per-student avg
  const studentAvgs = safeStudents.map((s) => {
    const sg = safeGrades.filter((g) => g.student_id === s.id);
    const avg = sg.length > 0
      ? (sg.reduce((acc, g) => acc + g.grade, 0) / sg.length).toFixed(2)
      : '—';
    return { ...s, avg };
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
        <p className="text-sm text-gray-500 mt-1">Обзор системы и состояния школы</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Учеников</p>
          <p className="text-4xl font-extrabold mt-2">{safeStudents.length || 4}</p>
          <p className="text-blue-100 text-xs mt-1">зарегистрировано</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Учителей</p>
          <p className="text-4xl font-extrabold mt-2">5</p>
          <p className="text-emerald-100 text-xs mt-1">в системе</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-amber-100 text-xs font-medium uppercase tracking-wider">Родителей</p>
          <p className="text-4xl font-extrabold mt-2">2</p>
          <p className="text-amber-100 text-xs mt-1">аккаунтов</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-violet-100 text-xs font-medium uppercase tracking-wider">Статус системы</p>
          <p className="text-2xl font-extrabold mt-2">✓ OK</p>
          <p className="text-violet-100 text-xs mt-1">все сервисы работают</p>
        </div>
      </div>

      {/* Students table + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Список учеников</h3>
          {studentAvgs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Загрузка...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Ученик</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Класс</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Email</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Ср. балл</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAvgs.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`}
                            alt={s.full_name}
                            className="w-8 h-8 rounded-full bg-gray-100"
                          />
                          <span className="font-medium text-gray-800">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{s.class}</td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{s.email}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold text-sm ${
                          s.avg >= 4.5 ? 'text-green-600' :
                          s.avg >= 3.5 ? 'text-blue-600' :
                          s.avg >= 2.5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {s.avg}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                          Активен
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Последние события</h3>
          <div className="space-y-3">
            {ACTIVITY_FEED.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${event.color}`}>
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{event.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teachers table + Grade distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Список учителей</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Учитель</th>
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Специализация</th>
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Телефон</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TEACHERS.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.avatar}
                          alt={t.full_name}
                          className="w-8 h-8 rounded-full bg-gray-100"
                        />
                        <div>
                          <p className="font-medium text-gray-800 text-xs leading-tight">{t.full_name}</p>
                          <p className="text-gray-400 text-xs">{t.subjects.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">{t.specialization}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{t.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade distribution chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Распределение оценок по школе</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={gradeDist} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} оценок`]} />
              <Bar dataKey="count" name="Количество" radius={[6, 6, 0, 0]}>
                {gradeDist.map((_, i) => (
                  <Cell key={i} fill={GRADE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
