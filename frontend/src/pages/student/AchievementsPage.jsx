import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAchievementsStore } from '../../store/useAchievementsStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useStudentGrades } from '../../hooks/useStudentGrades';

const TYPE_LABELS = { grades: 'Оценки', attendance: 'Посещаемость', all: 'Все' };
const TYPE_COLORS = {
  grades: 'bg-blue-100 text-blue-700',
  attendance: 'bg-emerald-100 text-emerald-700',
  other: 'bg-violet-100 text-violet-700',
};

const LOCKED_ACHIEVEMENTS = [
  {
    id: 'lock1',
    title: 'Сдал 10 контрольных',
    description: 'Напиши 10 контрольных работ',
    icon: '📝',
    type: 'grades',
    getProgress: (grades) => ({ current: Math.min(grades.filter(g => g.type === 'quiz').length, 10), max: 10 }),
  },
  {
    id: 'lock2',
    title: '100% посещаемость месяца',
    description: 'Не пропусти ни одного урока за месяц',
    icon: '📅',
    type: 'attendance',
    getProgress: (grades, attendance) => {
      const now = new Date();
      const monthAtt = (Array.isArray(attendance) ? attendance : []).filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const present = monthAtt.filter(a => a.status === 'present').length;
      return { current: present, max: Math.max(monthAtt.length, 20) };
    },
  },
  {
    id: 'lock3',
    title: 'Средний балл 5.0',
    description: 'Достигни среднего балла 5.0 по всем предметам',
    icon: '⭐',
    type: 'grades',
    getProgress: (grades) => {
      const safe = Array.isArray(grades) ? grades : [];
      if (!safe.length) return { current: 0, max: 5 };
      const avg = safe.reduce((s, g) => s + g.grade, 0) / safe.length;
      return { current: +avg.toFixed(1), max: 5 };
    },
  },
];

export default function AchievementsPage() {
  const { user } = useAuth();
  const achievements = useAchievementsStore((state) => state.achievements);
  const fetchAchievements = useAchievementsStore((state) => state.fetchAchievements);
  const attendance = useAttendanceStore((state) => state.attendance);
  const fetchAttendance = useAttendanceStore((state) => state.fetchAttendance);
  const { grades } = useStudentGrades(user?.id);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchAchievements(user.id);
      fetchAttendance(user.id);
    }
  }, [user?.id, fetchAchievements, fetchAttendance]);

  const safeA = Array.isArray(achievements) ? achievements : [];
  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeAtt = Array.isArray(attendance) ? attendance : [];

  const now = new Date();
  const thisMonthCount = safeA.filter(a => {
    if (!a.date) return false;
    const d = new Date(a.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const rareCount = safeA.filter(a => a.rarity === 'rare' || a.type === 'rare').length;

  const filtered = useMemo(() => {
    if (filter === 'all') return safeA;
    return safeA.filter(a => a.type === filter);
  }, [safeA, filter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Hero */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Мои достижения</h1>
          <p className="text-amber-100 text-sm mt-1">Твои заслуженные награды</p>
          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">{safeA.length}</p>
              <p className="text-xs text-amber-100 mt-0.5">Всего</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">{rareCount}</p>
              <p className="text-xs text-amber-100 mt-0.5">Редких</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">{thisMonthCount}</p>
              <p className="text-xs text-amber-100 mt-0.5">В этом месяце</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'grades', 'attendance'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {TYPE_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-gray-500">Нет достижений в этой категории</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a, i) => (
              <div key={a.id || i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{a.icon || '🏅'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {a.type && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[a.type] || TYPE_COLORS.other}`}>
                          {TYPE_LABELS[a.type] || a.type}
                        </span>
                      )}
                      {a.date && (
                        <span className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Locked / Progress Section */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Следующие достижения</h2>
          <div className="space-y-3">
            {LOCKED_ACHIEVEMENTS.map(la => {
              const { current, max } = la.getProgress(safeGrades, safeAtt);
              const pct = Math.min(100, Math.round((current / max) * 100));
              return (
                <div key={la.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 opacity-80">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale">{la.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-700 text-sm">{la.title}</p>
                        <span className="text-xs text-gray-500">{current} / {max}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{la.description}</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{pct}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
