import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Card, Badge } from '../../components/ui';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';

export const UsersManagement = () => {
  const { users, pagination, loading, error, fetchUsers, deactivateUser, activateUser } = useAdminStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, fetchUsers]);

  const handleToggleClick = (userId) => {
    setSelectedUser(users.find(u => u.id === userId));
    setIsDeleteOpen(true);
  };

  const handleToggleConfirm = async () => {
    try {
      if (selectedUser.is_active) {
        await deactivateUser(selectedUser.id);
      } else {
        await activateUser(selectedUser.id);
      }
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers(page, search);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: 'w-12' },
    { key: 'email', label: 'Email' },
    { key: 'full_name', label: 'Полное имя' },
    {
      key: 'user_type',
      label: 'Роль',
      render: (type) => (
        <Badge variant={type === 'admin' ? 'danger' : type === 'teacher' ? 'warning' : 'info'}>
          {type === 'student' ? '👤 Студент' : type === 'teacher' ? '👨‍🏫 Учитель' : type === 'parent' ? '👨‍👩‍👧 Родитель' : '⚙️ Админ'}
        </Badge>
      ),
    },
    { key: 'class_name', label: 'Класс', width: 'w-20' },
    {
      key: 'is_active',
      label: 'Статус',
      render: (isActive) => (
        <Badge variant={isActive ? 'success' : 'danger'}>
          {isActive ? '✅ Активен' : '⛔ Неактивен'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card title="👥 Управление пользователями">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Поиск по email или имени..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onDelete={handleToggleClick}
          deleteLabel={(row) => row.is_active ? '⛔ Деактивировать' : '✅ Активировать'}
        />
      </Card>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title={selectedUser?.is_active ? 'Деактивировать пользователя?' : 'Активировать пользователя?'}
        message={`Вы уверены, что хотите ${selectedUser?.is_active ? 'деактивировать' : 'активировать'} пользователя "${selectedUser?.full_name}"?`}
        confirmText={selectedUser?.is_active ? 'Деактивировать' : 'Активировать'}
        cancelText="Отменить"
        onConfirm={handleToggleConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        isDangerous={selectedUser?.is_active}
        loading={loading}
      />
    </div>
  );
};

export default UsersManagement;
