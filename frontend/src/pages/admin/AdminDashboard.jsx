import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { bilimClassClient } from '../../api/bilimclass/client';

const GRADE_COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981'];

const ROLE_LABELS = {
  student: 'Ученик',
  teacher: 'Учитель',
  parent:  'Родитель',
  admin:   'Администратор',
};

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-violet-100 text-violet-700',
  parent:  'bg-emerald-100 text-emerald-700',
  admin:   'bg-amber-100 text-amber-700',
};

export default function AdminDashboard() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    bilimClassClient.get('/admin/users', { params: { per_page: 50 } })
      .then((response) => {
        const list = response.users ?? [];
        setUsers(Array.isArray(list) ? list : []);
        setTotal(response.total ?? list.length);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const students = useMemo(() => users.filter((u) => u.user_type === 'student' || u.role === 'student'), [users]);
  const teachers = useMemo(() => users.filter((u) => u.user_type === 'teacher' || u.role === 'teacher'), [users]);
  const parents  = useMemo(() => users.filter((u) => u.user_type === 'parent'  || u.role === 'parent'),  [users]);

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
          <p className="text-4xl font-extrabold mt-2">{students.length}</p>
          <p className="text-blue-100 text-xs mt-1">зарегистрировано</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-violet-100 text-xs font-medium uppercase tracking-wider">Учителей</p>
          <p className="text-4xl font-extrabold mt-2">{teachers.length}</p>
          <p className="text-violet-100 text-xs mt-1">в системе</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Родителей</p>
          <p className="text-4xl font-extrabold mt-2">{parents.length}</p>
          <p className="text-emerald-100 text-xs mt-1">аккаунтов</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-amber-100 text-xs font-medium uppercase tracking-wider">Всего пользователей</p>
          <p className="text-4xl font-extrabold mt-2">{total}</p>
          <p className="text-amber-100 text-xs mt-1">в базе данных</p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Все пользователи</h3>
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Загрузка...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Нет данных</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Пользователь</th>
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Email</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Роль</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const role = u.user_type || u.role || 'student';
                  return (
                    <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                            alt={u.full_name}
                            className="w-8 h-8 rounded-full bg-gray-100"
                          />
                          <span className="font-medium text-gray-800">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{u.email}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABELS[role] || role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {u.is_active !== false ? 'Активен' : 'Неактивен'}
                        </span>
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
  );
}
