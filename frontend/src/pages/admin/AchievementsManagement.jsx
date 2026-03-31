import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Card } from '../../components/ui';
import DataTable from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

const ACHIEVEMENT_TYPES = [
  { value: 'grades', label: 'За оценки' },
  { value: 'olympiad', label: 'Олимпиада' },
  { value: 'attendance', label: 'Посещаемость' },
];

export const AchievementsManagement = () => {
  const { achievements, pagination, loading, error, fetchUsers, users, getAchievements, createAchievement, updateAchievement, deleteAchievement } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filterStudentId, setFilterStudentId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers(1, '', 100);
  }, [fetchUsers]);

  useEffect(() => {
    getAchievements(page, 50, filterStudentId);
  }, [page, filterStudentId, getAchievements]);

  const handleAddClick = () => {
    setSelectedAchievement(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (achievementId) => {
    setSelectedAchievement(achievements.find(a => a.id === achievementId));
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        student_id: formData.student_id ? parseInt(formData.student_id) : undefined,
        points: formData.points ? parseInt(formData.points) : undefined,
      };
      if (selectedAchievement) {
        await updateAchievement(selectedAchievement.id, payload);
      } else {
        await createAchievement(payload);
      }
      setIsModalOpen(false);
      setSelectedAchievement(null);
      getAchievements(page, 50, filterStudentId);
    } catch (err) {
      console.error('Error saving achievement:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAchievement(selectedAchievement.id);
      setIsDeleteOpen(false);
      setSelectedAchievement(null);
      getAchievements(page, 50, filterStudentId);
    } catch (err) {
      console.error('Error deleting achievement:', err);
    }
  };

  const studentMap = {};
  (users || []).forEach(u => { studentMap[u.id] = u.full_name; });

  const columns = [
    { key: 'id', label: 'ID', width: 'w-12' },
    {
      key: 'student_id',
      label: 'Студент',
      render: (val) => studentMap[val] || (val ? `#${val}` : '—'),
    },
    { key: 'title', label: 'Название' },
    {
      key: 'icon',
      label: 'Иконка',
      render: (icon) => <span className="text-2xl">{icon}</span>,
    },
    { key: 'achievement_type', label: 'Тип' },
    { key: 'points', label: 'Очки', width: 'w-16' },
  ];

  const fields = [
    {
      name: 'student_id',
      label: 'Студент',
      type: 'select',
      required: true,
      options: (users || []).filter(u => u.user_type === 'student' || u.role === 'student').map(u => ({ value: u.id, label: u.full_name })),
    },
    { name: 'title', label: 'Название достижения', type: 'text', required: true, placeholder: 'Отличник' },
    { name: 'description', label: 'Описание', type: 'textarea' },
    { name: 'icon', label: 'Эмодзи иконка', type: 'text', required: true, placeholder: '🏆' },
    {
      name: 'achievement_type',
      label: 'Тип',
      type: 'select',
      required: true,
      options: ACHIEVEMENT_TYPES,
    },
    { name: 'points', label: 'Очки', type: 'number', required: true, placeholder: '10' },
  ];

  return (
    <div className="space-y-6">
      <Card title="🏆 Управление достижениями">
        <div className="flex gap-3 mb-4">
          <select
            value={filterStudentId || ''}
            onChange={(e) => {
              setFilterStudentId(e.target.value ? parseInt(e.target.value) : null);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все студенты</option>
            {(users || []).filter(u => u.user_type === 'student' || u.role === 'student').map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Добавить достижение
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={achievements}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Card>

      <FormModal
        title={selectedAchievement ? 'Редактировать достижение' : 'Добавить новое достижение'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        fields={fields}
        initialData={selectedAchievement}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Удалить достижение?"
        message={`Вы уверены, что хотите удалить достижение "${selectedAchievement?.title}"? Это действие необратимо.`}
        confirmText="Удалить"
        cancelText="Отменить"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        isDangerous={true}
        loading={loading}
      />
    </div>
  );
};

export default AchievementsManagement;
