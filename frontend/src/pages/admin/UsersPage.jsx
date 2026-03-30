import { useEffect, useState } from 'react';
import { useStudentsStore } from '../../store/useStudentsStore';

const mockTeachersList = [
  { id: 101, full_name: 'Дарья Иванова', email: 'daria@school.kz', specialization: 'Математика', subjects: ['Алгебра', 'Геометрия'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daria' },
  { id: 102, full_name: 'Сергей Петров', email: 'sergey@school.kz', specialization: 'Физика', subjects: ['Физика'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sergey' },
  { id: 103, full_name: 'Ақерке Мусабаева', email: 'aqerke@school.kz', specialization: 'Казахский язык', subjects: ['Казахский язык', 'Литература'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aqerke' },
  { id: 104, full_name: 'Ирина Сидорова', email: 'irina@school.kz', specialization: 'Английский язык', subjects: ['Английский язык'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irina' },
  { id: 105, full_name: 'Игорь Козлов', email: 'igor@school.kz', specialization: 'История', subjects: ['История', 'Обществознание'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=igor' },
];

const mockParentsList = [
  { id: 201, full_name: 'Жанна Смагулова', email: 'zhanna.smagulova@example.kz', phone: '+7 777 999 9901', children: [1] },
  { id: 202, full_name: 'Сауле Жанова', email: 'saule.zhanova@example.kz', phone: '+7 777 999 9902', children: [2] },
];

const TABS = ['Студенты', 'Учителя', 'Родители'];

const RoleBadge = ({ role }) => {
  const styles = {
    student: 'bg-blue-100 text-blue-700',
    teacher: 'bg-violet-100 text-violet-700',
    parent: 'bg-amber-100 text-amber-700',
    admin: 'bg-gray-100 text-gray-700',
  };
  const labels = {
    student: 'Ученик',
    teacher: 'Учитель',
    parent: 'Родитель',
    admin: 'Админ',
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[role] || styles.admin}`}>
      {labels[role] || role}
    </span>
  );
};

const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onEdit}
      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
    >
      Изменить
    </button>
    <button
      onClick={onDelete}
      className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
    >
      Удалить
    </button>
  </div>
);

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const { students, fetchStudents } = useStudentsStore();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const safeStudents = (Array.isArray(students) ? students : []).filter((s) => s.role === 'student' || !s.role);

  const filterBySearch = (list) =>
    list.filter((item) =>
      item.full_name.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase())
    );

  const filteredStudents = filterBySearch(safeStudents);
  const filteredTeachers = filterBySearch(mockTeachersList);
  const filteredParents = filterBySearch(mockParentsList);

  // For parent children lookup
  const allStudents = [...safeStudents];
  const getChildName = (childId) => {
    const found = allStudents.find((s) => s.id === childId);
    return found?.full_name ?? `Ученик #${childId}`;
  };

  const handleEdit = () => alert('Функция в разработке');
  const handleDelete = () => alert('Функция в разработке');
  const handleAdd = () => alert('Функция в разработке');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-sm text-gray-500 mt-1">Студенты, учителя и родители системы</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить пользователя
        </button>
      </div>

      {/* Tabs + Search bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(i); setSearch(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === i
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === i ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i === 0 ? safeStudents.length : i === 1 ? mockTeachersList.length : mockParentsList.length}
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

        {/* Students tab */}
        {activeTab === 0 && (
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">Ничего не найдено</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Ученик</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Email</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Класс</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Роль</th>
                    <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
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
                            className="w-8 h-8 rounded-full bg-gray-100 shrink-0"
                          />
                          <span className="font-medium text-gray-800">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{s.email}</td>
                      <td className="py-3 px-3 text-gray-600">{s.class}</td>
                      <td className="py-3 px-3 text-center">
                        <RoleBadge role="student" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <ActionButtons onEdit={handleEdit} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Teachers tab */}
        {activeTab === 1 && (
          <div className="overflow-x-auto">
            {filteredTeachers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">Ничего не найдено</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Учитель</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Email</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Специализация</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Предметы</th>
                    <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t, i) => (
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
                            className="w-8 h-8 rounded-full bg-gray-100 shrink-0"
                          />
                          <span className="font-medium text-gray-800">{t.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{t.email}</td>
                      <td className="py-3 px-3 text-gray-600">{t.specialization}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {t.subjects.map((subj) => (
                            <span key={subj} className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">
                              {subj}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <ActionButtons onEdit={handleEdit} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Parents tab */}
        {activeTab === 2 && (
          <div className="overflow-x-auto">
            {filteredParents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">Ничего не найдено</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Родитель</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Email</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Телефон</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Дети</th>
                    <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm shrink-0">
                            {p.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{p.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{p.email}</td>
                      <td className="py-3 px-3 text-gray-600 text-xs">{p.phone}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(p.children) ? p.children : []).map((cid) => (
                            <span key={cid} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              {getChildName(cid)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <ActionButtons onEdit={handleEdit} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
