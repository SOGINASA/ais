import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useStudentGrades } from '../hooks/useStudentGrades';
import { useClassSchedule } from '../hooks/useClassSchedule';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useAttendanceStore } from '../store/useAttendanceStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ label, value, sub, gradient }) => (
  <div className={`rounded-2xl shadow-sm p-6 text-white ${gradient}`}>
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-4xl font-bold mt-1">{value}</p>
    {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
  </div>
);

export const StudentDashboard = () => {
  const { grades } = useStudentGrades();
  const { weekSchedule } = useClassSchedule();
  const achievements = useAchievementsStore((state) => state.achievements);
  const fetchAchievements = useAchievementsStore((state) => state.fetchAchievements);
  const attendance = useAttendanceStore((state) => state.attendance);
  const fetchAttendance = useAttendanceStore((state) => state.fetchAttendance);

  useEffect(() => {
    fetchAchievements();
    fetchAttendance();
  }, [fetchAchievements, fetchAttendance]);

  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeAttendance = Array.isArray(attendance) ? attendance : [];
  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const safeSchedule = Array.isArray(schedule) ? schedule : [];

  const gpa = useMemo(() => {
    if (!safeGrades.length) return '0.00';
    const total = safeGrades.reduce((s, g) => s + g.grade * (g.weight || 1), 0);
    const weights = safeGrades.reduce((s, g) => s + (g.weight || 1), 0);
    return weights > 0 ? (total / weights).toFixed(2) : '0.00';
  }, [safeGrades]);

  const attendancePct = useMemo(() => {
    if (!safeAttendance.length) return 0;
    const present = safeAttendance.filter(a => a.status === 'present').length;
    return Math.round((present / safeAttendance.length) * 100);
  }, [safeAttendance]);

  const groupedGrades = grades.reduce((acc, grade) => {
    const subject = grade.subject?.name || grade.subject || 'Неизвестный предмет';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(grade);
    return acc;
  }, {});

  const calculateAverage = (subjectGrades) => {
    if (subjectGrades.length === 0) return 0;
    const weighted = subjectGrades.reduce((sum, g) => sum + (g.score || g.grade || 0) * (g.weight || 1), 0);
    const totalWeight = subjectGrades.reduce((sum, g) => sum + (g.weight || 1), 0);
    return weighted / totalWeight;
  };

  const todaySchedule = weekSchedule[new Date().getDay() - 1]?.lessons || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, {user?.first_name || 'Ученик'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {className} · {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Средний балл" value={gpa} sub="GPA" gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
          <StatCard label="Посещаемость" value={`${attendancePct}%`} sub={`${safeAttendance.filter(a => a.status === 'present').length} из ${safeAttendance.length}`} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
          <StatCard label="Достижения" value={safeAchievements.length} sub="получено" gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
          <StatCard label="Оценок" value={safeGrades.length} sub="всего выставлено" gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Динамика успеваемости</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={gpaTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Средний балл" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Успеваемость по предметам</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Балл" dataKey="avg" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="📝 Мои предметы" className="p-6">
            {Object.keys(groupedGrades).length === 0 ? (
              <p className="text-gray-500 text-sm">Нет оценок</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(groupedGrades).map(([subject, subjectGrades]) => (
                  <GradesCard
                    key={subject}
                    subject={subject}
                    average={calculateAverage(subjectGrades)}
                    count={subjectGrades.length}
                    recentGrades={subjectGrades.slice(-5)}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="📅 Расписание на сегодня">
            {todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {lesson.subject?.name || lesson.subject}
                      </p>
                      <p className="text-sm text-gray-600">
                        Кабинет {lesson.room} • {lesson.start_time} - {lesson.end_time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.teacher?.full_name || lesson.teacher_name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-800">Достижения</h2>
              <Link to="/achievements" className="text-xs text-blue-500 hover:underline">Все →</Link>
            </div>
            {recentAchievements.length === 0 ? (
              <p className="text-gray-400 text-sm">Пока нет достижений</p>
            ) : (
              <ul className="space-y-3">
                {recentAchievements.map((a, i) => (
                  <li key={a.id || i} className="flex items-center gap-3">
                    <span className="text-2xl">{a.icon || '🏆'}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{achievement.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{achievement.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Быстрый доступ</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/grades', label: 'Оценки', emoji: '📊', color: 'bg-blue-50 text-blue-700' },
                { to: '/schedule', label: 'Расписание', emoji: '📅', color: 'bg-emerald-50 text-emerald-700' },
                { to: '/achievements', label: 'Достижения', emoji: '🏆', color: 'bg-amber-50 text-amber-700' },
                { to: '/profile', label: 'Профиль', emoji: '👤', color: 'bg-violet-50 text-violet-700' },
              ].map(link => (
                <Link key={link.to} to={link.to} className={`flex flex-col items-center justify-center p-3 rounded-xl text-sm font-medium hover:opacity-80 transition ${link.color}`}>
                  <span className="text-xl mb-1">{link.emoji}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;

