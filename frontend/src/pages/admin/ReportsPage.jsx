import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { bilimClassClient } from '../../api/bilimclass/client';

const TABS = [
  { id: 'users',      label: 'Пользователи' },
  { id: 'attendance', label: 'Посещаемость' },
];

const ROLE_COLORS_MAP = {
  student: '#3b82f6',
  teacher: '#8b5cf6',
  parent:  '#10b981',
  admin:   '#f59e0b',
};

const ROLE_LABELS = {
  student: 'Учеников',
  teacher: 'Учителей',
  parent:  'Родителей',
  admin:   'Администраторов',
};

const PIE_COLORS = ['#10b981', '#ef4444'];

// Placeholder attendance data since there's no admin-wide attendance endpoint
const CLASS_ATTENDANCE = [
  { class: '10A', present: 91, absent: 9 },
  { class: '10B', present: 84, absent: 16 },
];

export default function ReportsPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    bilimClassClient.get('/admin/users', { params: { per_page: 100 } })
      .then((response) => {
        const list = response.users ?? [];
        setUsers(Array.isArray(list) ? list : []);
        setTotal(response.total ?? list.length);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const byRole = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const role = u.user_type || u.role || 'student';
      map[role] = (map[role] || 0) + 1;
    });
    return map;
  }, [users]);

  const roleBarData = useMemo(() =>
    Object.entries(byRole).map(([role, count]) => ({
      role: ROLE_LABELS[role] || role,
      count,
      fill: ROLE_COLORS_MAP[role] || '#94a3b8',
    })),
  [byRole]);

  const recentUsers = useMemo(() =>
    [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
  [users]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Отчёты</h1>
          <p className="text-sm text-gray-500 mt-0.5">Сводная аналитика по школе</p>
        </div>
        <button
          onClick={() => alert('Экспорт PDF — функция в разработке')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Экспорт PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <div key={role} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-3xl font-extrabold mt-2" style={{ color: ROLE_COLORS_MAP[role] }}>
                  {byRole[role] ?? 0}
                </p>
              </div>
            ))}
          </div>

          {/* Role distribution chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение по ролям</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={roleBarData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} чел.`]} />
                  <Bar dataKey="count" name="Кол-во" radius={[5, 5, 0, 0]}>
                    {roleBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Всего пользователей: {total}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={roleBarData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="role"
                  >
                    {roleBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v, name) => [`${v} чел.`, name]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent users */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Последние зарегистрированные</h2>
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">Загрузка...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-3 text-gray-400 font-medium text-xs">Пользователь</th>
                      <th className="text-left py-2.5 px-3 text-gray-400 font-medium text-xs">Email</th>
                      <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs">Роль</th>
                      <th className="text-left py-2.5 px-3 text-gray-400 font-medium text-xs">Зарегистрирован</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u, i) => {
                      const role = u.user_type || u.role || 'student';
                      return (
                        <tr key={u.id} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                                alt=""
                                className="w-7 h-7 rounded-full bg-gray-100"
                              />
                              <span className="font-medium text-gray-800">{u.full_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-400 text-xs">{u.email}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                              {ROLE_LABELS[role] ? ROLE_LABELS[role].slice(0, -2) : role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-400 text-xs">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance tab */}
      {tab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Средняя посещаемость</h2>
            <p className="text-4xl font-extrabold text-gray-900 mb-4">87%</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[{ name: 'Присутствовал', value: 87 }, { name: 'Отсутствовал', value: 13 }]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value"
                >
                  {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">По классам</h2>
            <div className="space-y-4">
              {CLASS_ATTENDANCE.map((c) => (
                <div key={c.class}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{c.class}</span>
                    <span className="text-sm font-bold text-gray-900">{c.present}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.present}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-emerald-600">{c.present}% присутствует</span>
                    <span className="text-xs text-red-500">{c.absent}% пропускает</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
