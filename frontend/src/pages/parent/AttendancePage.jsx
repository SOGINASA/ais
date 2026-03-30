import { useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';

const PIE_COLORS = ['#10b981', '#ef4444'];

const statusLabel = (status) =>
  status === 'present' ? 'Присутствовал' : 'Отсутствовал';

export default function AttendancePage() {
  const user = useAuthStore((s) => s.user);
  const { attendance, fetchAttendance } = useAttendanceStore();

  useEffect(() => {
    if (user?.children?.[0]) {
      fetchAttendance(user.children[0]);
    }
  }, [user?.children, fetchAttendance]);

  const safeAttendance = Array.isArray(attendance) ? attendance : [];

  const presentCount = safeAttendance.filter((a) => a.status === 'present').length;
  const absentCount = safeAttendance.filter((a) => a.status === 'absent').length;
  const totalCount = safeAttendance.length;
  const pct = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  // Last 30 days calendar grid
  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d;
  });

  const byDate = {};
  safeAttendance.forEach((a) => {
    if (!byDate[a.date]) byDate[a.date] = [];
    byDate[a.date].push(a.status);
  });

  const dayStatus = (d) => {
    const key = d.toISOString().slice(0, 10);
    const statuses = byDate[key];
    if (!statuses || statuses.length === 0) return 'none';
    const hasAbsent = statuses.includes('absent');
    const hasPresent = statuses.includes('present');
    if (hasAbsent && hasPresent) return 'mixed';
    if (hasAbsent) return 'absent';
    return 'present';
  };

  const squareColor = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-400';
      case 'absent': return 'bg-red-400';
      case 'mixed': return 'bg-amber-400';
      default: return 'bg-gray-200';
    }
  };

  // Per-subject stats
  const subjects = [...new Set(safeAttendance.map((a) => a.subject))];
  const subjectStats = subjects.map((subj) => {
    const records = safeAttendance.filter((a) => a.subject === subj);
    const p = records.filter((a) => a.status === 'present').length;
    const ab = records.filter((a) => a.status === 'absent').length;
    const tot = records.length;
    return {
      subject: subj,
      present: p,
      absent: ab,
      total: tot,
      pct: tot > 0 ? ((p / tot) * 100).toFixed(0) : 0,
    };
  }).sort((a, b) => b.total - a.total);

  // Recent records
  const recentRecords = [...safeAttendance]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  const pieData = [
    { name: 'Присутствовал', value: presentCount },
    { name: 'Отсутствовал', value: absentCount },
  ];

  const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Посещаемость</h1>
        <p className="text-sm text-gray-500 mt-1">Мониторинг посещения уроков</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Присутствий</p>
          <p className="text-4xl font-extrabold mt-2">{presentCount}</p>
          <p className="text-emerald-100 text-xs mt-1">уроков</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Пропусков</p>
          <p className="text-4xl font-extrabold mt-2">{absentCount}</p>
          <p className="text-red-100 text-xs mt-1">уроков</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Всего</p>
          <p className="text-4xl font-extrabold mt-2">{totalCount}</p>
          <p className="text-blue-100 text-xs mt-1">записей</p>
        </div>
        <div className={`rounded-2xl p-5 text-white shadow-sm ${
          Number(pct) >= 80
            ? 'bg-gradient-to-br from-violet-500 to-violet-600'
            : 'bg-gradient-to-br from-amber-500 to-amber-600'
        }`}>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Процент</p>
          <p className="text-4xl font-extrabold mt-2">{pct}%</p>
          <p className="text-white/80 text-xs mt-1">посещаемость</p>
        </div>
      </div>

      {/* Calendar grid + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar heatmap */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Последние 30 дней</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block"></span>
                Присутствие
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block"></span>
                Пропуск
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block"></span>
                Нет данных
              </span>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {last30.map((d, i) => {
              const status = dayStatus(d);
              const tooltip = `${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} (${DAYS_SHORT[d.getDay()]})`;
              return (
                <div
                  key={i}
                  title={tooltip}
                  className={`aspect-square rounded-md ${squareColor(status)} cursor-default transition-opacity hover:opacity-80`}
                />
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {last30.filter((_, i) => i % 5 === 0).map((d, i) => (
              <span key={i} className="text-xs text-gray-400">
                {d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Общая статистика</h3>
          {totalCount === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Нет данных</p>
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
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} уроков`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 grid grid-cols-2 gap-3 text-center">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
              <p className="text-xs text-emerald-500">присутствий</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-500">{absentCount}</p>
              <p className="text-xs text-red-400">пропусков</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-subject table */}
      {subjectStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">По предметам</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Предмет</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Присутствий</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Пропусков</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Всего</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {subjectStats.map((s, i) => (
                  <tr
                    key={s.subject}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-gray-800">{s.subject}</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{s.present}</td>
                    <td className="py-3 px-3 text-center text-red-500 font-semibold">{s.absent}</td>
                    <td className="py-3 px-3 text-center text-gray-500">{s.total}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${Number(s.pct) >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${Number(s.pct) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {s.pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline */}
      {recentRecords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Последние записи</h3>
          <div className="space-y-2">
            {recentRecords.map((r, i) => (
              <div
                key={r.id ?? i}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{r.subject}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.date).toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    r.status === 'present'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {statusLabel(r.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
