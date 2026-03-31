import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { scheduleApi } from '../../api/bilimclass/schedule';

const DAY_NAMES = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
const DAY_FULL = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const TIME_SLOTS = [
  { slot: 1, start: '08:00', end: '08:45' },
  { slot: 2, start: '09:00', end: '09:45' },
  { slot: 3, start: '10:00', end: '10:45' },
  { slot: 4, start: '11:00', end: '11:45' },
  { slot: 5, start: '13:00', end: '13:45' },
  { slot: 6, start: '14:00', end: '14:45' },
];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const subjectColor = (subject, allSubjects) => {
  const idx = allSubjects.indexOf(subject);
  return COLORS[idx >= 0 ? idx % COLORS.length : 0];
};

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  const todayDow = new Date().getDay();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    scheduleApi
      .getTeacherSchedule(user.id)
      .then((res) => {
        const data = res.data ?? [];
        setSchedule(Array.isArray(data) ? data : []);
      })
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Normalize: backend may return flat list or grouped
  const weekSchedule = useMemo(() => {
    if (!Array.isArray(schedule)) return [];
    // If already grouped [{day, lessons:[...]}]
    if (schedule.length > 0 && 'lessons' in schedule[0]) return schedule;
    // Flat list
    return [1, 2, 3, 4, 5].map((day) => ({
      day,
      lessons: schedule.filter(
        (s) => s.day_of_week === day || s.day_of_week === day - 1 || s.day === day
      ),
    }));
  }, [schedule]);

  const allSubjects = useMemo(() => {
    const set = new Set();
    weekSchedule.forEach((d) => d.lessons.forEach((l) => set.add(l.subject)));
    return Array.from(set);
  }, [weekSchedule]);

  const getLesson = (day, slot) => {
    const dayData = weekSchedule.find((d) => d.day === day);
    if (!dayData) return null;
    return dayData.lessons.find((l) => l.time_slot === slot || l.lesson_number === slot) || null;
  };

  const allLessons = useMemo(() => {
    const result = [];
    weekSchedule.forEach((d) => d.lessons.forEach((l) => result.push({ ...l, day: d.day })));
    return result.sort((a, b) => a.day - b.day || (a.time_slot || 0) - (b.time_slot || 0));
  }, [weekSchedule]);

  const isToday = (dow) => dow === todayDow;

  const todayLessons = allLessons.filter((l) => l.day === todayDow);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Моё расписание</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          {['grid', 'list'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v === 'grid' ? 'Сетка' : 'Список'}
            </button>
          ))}
        </div>
      </div>

      {/* Today highlight */}
      {todayDow >= 1 && todayDow <= 5 && todayLessons.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Сегодня</p>
          <div className="flex gap-3 flex-wrap">
            {todayLessons.map((l, i) => {
              const ts = TIME_SLOTS.find((t) => t.slot === (l.time_slot || l.lesson_number));
              const color = subjectColor(l.subject, allSubjects);
              return (
                <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-blue-100">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{l.subject}</p>
                    <p className="text-xs text-gray-400">{ts?.start} · каб. {l.room} · {l.class_name || ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject legend */}
      {allSubjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
          {allSubjects.map((sub) => (
            <span key={sub} className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: subjectColor(sub, allSubjects) }} />
              {sub}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          Загрузка расписания...
        </div>
      ) : view === 'grid' ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-6 border-b border-gray-100">
            <div className="p-3 bg-gray-50 border-r border-gray-100" />
            {[1, 2, 3, 4, 5].map((dow) => (
              <div
                key={dow}
                className={`p-3 text-center font-semibold text-sm border-r border-gray-100 last:border-r-0 ${
                  isToday(dow) ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                }`}
              >
                <div>{DAY_NAMES[dow]}</div>
                {isToday(dow) && <div className="text-xs font-normal text-blue-500">сегодня</div>}
              </div>
            ))}
          </div>
          {/* Slots */}
          {TIME_SLOTS.map((ts) => (
            <div key={ts.slot} className="grid grid-cols-6 border-b border-gray-50 last:border-b-0">
              <div className="p-3 border-r border-gray-100 bg-gray-50 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-500">{ts.slot}</span>
                <span className="text-xs text-gray-400 mt-0.5">{ts.start}</span>
                <span className="text-xs text-gray-300">{ts.end}</span>
              </div>
              {[1, 2, 3, 4, 5].map((dow) => {
                const lesson = getLesson(dow, ts.slot);
                const color = lesson ? subjectColor(lesson.subject, allSubjects) : null;
                return (
                  <div
                    key={dow}
                    className={`p-2 border-r border-gray-50 last:border-r-0 min-h-[80px] ${isToday(dow) ? 'bg-blue-50/30' : ''}`}
                  >
                    {lesson && (
                      <div className="h-full rounded-lg p-2 text-white text-xs" style={{ background: color }}>
                        <p className="font-semibold leading-tight">{lesson.subject}</p>
                        <p className="opacity-80 mt-1 text-xs leading-tight">{lesson.class_name || ''}</p>
                        <p className="opacity-70 mt-1 text-xs">каб. {lesson.room}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((dow) => {
            const dayLessons = allLessons.filter((l) => l.day === dow);
            return (
              <div
                key={dow}
                className={`bg-white rounded-2xl border p-5 ${isToday(dow) ? 'border-blue-200' : 'border-gray-100'}`}
              >
                <h3 className={`font-semibold mb-3 ${isToday(dow) ? 'text-blue-700' : 'text-gray-800'}`}>
                  {DAY_FULL[dow]}
                  {isToday(dow) && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">Сегодня</span>
                  )}
                </h3>
                {dayLessons.length === 0 ? (
                  <p className="text-gray-400 text-sm">Уроков нет</p>
                ) : (
                  <div className="space-y-2">
                    {dayLessons.map((l, i) => {
                      const color = subjectColor(l.subject, allSubjects);
                      const ts = TIME_SLOTS.find((t) => t.slot === (l.time_slot || l.lesson_number));
                      return (
                        <div key={l.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                          <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: color }} />
                          <div className="w-16 flex-shrink-0 text-xs text-gray-500">
                            <div className="font-medium">{l.start_time || ts?.start}</div>
                            <div>{l.end_time || ts?.end}</div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{l.subject}</p>
                            <p className="text-xs text-gray-400">
                              {l.class_name && `${l.class_name} · `}каб. {l.room}
                            </p>
                          </div>
                          {l.lesson_type && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {l.lesson_type}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
