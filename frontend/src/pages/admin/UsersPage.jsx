import { useEffect, useMemo, useState } from 'react';
import { bilimClassClient } from '../../api/bilimclass/client';

const TABS = ['Студенты', 'Учителя', 'Родители'];
const ROLE_MAP = ['student', 'teacher', 'parent'];

const RoleBadge = ({ role }) => {
  const styles = {
    student: 'bg-blue-100 text-blue-700',
    teacher: 'bg-violet-100 text-violet-700',
    parent:  'bg-amber-100 text-amber-700',
    admin:   'bg-gray-100 text-gray-700',
  };
  const labels = {
    student: 'Ученик',
    teacher: 'Учитель',
    parent:  'Родитель',
    admin:   'Админ',
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[role] || styles.admin}`}>
      {labels[role] || role}
    </span>
  );
};

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch]       = useState('');
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    setLoading(true);
    bilimClassClient.get('/admin/users', { params: { per_page: 100 } })
      .then((response) => {
        const list = response.users ?? [];
        setUsers(Array.isArray(list) ? list : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const byRole = useMemo(() => {
    const student = [];
    const teacher = [];
    const parent  = [];
    users.forEach((u) => {
      const role = u.user_type || u.role || 'student';
      if (role === 'student') student.push(u);
      else if (role === 'teacher') teacher.push(u);
      else if (role === 'parent') parent.push(u);
    });
    return [student, teacher, parent];
  }, [users]);

  const filterBySearch = (list) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((u) =>
      u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  };

  const currentList = useMemo(
    () => filterBySearch(byRole[activeTab] ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [byRole, activeTab, search]
  );

  const handleAction = () => alert('Функция в разработке');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-sm text-gray-500 mt-1">Студенты, учителя и родители системы</p>
        </div>
        <button
          onClick={handleAction}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить пользователя
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(i); setSearch(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === i ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {byRole[i]?.length ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-64 bg-gray-50"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-10">Загрузка...</p>
        ) : currentList.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">Ничего не найдено</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Пользователь</th>
                  <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Email</th>
                  {activeTab === 0 && <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Класс</th>}
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Роль</th>
                  <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Статус</th>
                  <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((u, i) => {
                  const role = u.user_type || u.role || ROLE_MAP[activeTab];
                  return (
                    <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                            alt={u.full_name}
                            className="w-8 h-8 rounded-full bg-gray-100 shrink-0"
                          />
                          <span className="font-medium text-gray-800">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{u.email}</td>
                      {activeTab === 0 && <td className="py-3 px-3 text-gray-600">{u.class_name || u.class || '—'}</td>}
                      <td className="py-3 px-3 text-center"><RoleBadge role={role} /></td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {u.is_active !== false ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={handleAction}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Изменить
                        </button>
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
