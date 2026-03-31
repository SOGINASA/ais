import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Card, Badge } from '../../components/ui';
import DataTable from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

const GRADE_TYPES = [
  { value: 'lesson', label: 'Урок' },
  { value: 'test', label: 'Тест' },
  { value: 'quiz', label: 'Викторина' },
  { value: 'exam', label: 'Экзамен' },
  { value: 'lab', label: 'Лабораторная' },
];

export const GradesManagement = () => {
  const { grades, pagination, loading, error, fetchUsers, users, getGrades, updateGrade, deleteGrade } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [filterStudentId, setFilterStudentId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers(1, '', 100);
  }, [fetchUsers]);

  useEffect(() => {
    getGrades(page, 50, filterStudentId);
  }, [page, filterStudentId, getGrades]);

  const handleEditClick = (grade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (gradeId) => {
    setSelectedGrade(grades.find(g => g.id === gradeId));
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        score: formData.score ? parseInt(formData.score) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        quarter: formData.quarter ? parseInt(formData.quarter) : undefined,
      };
      await updateGrade(selectedGrade.id, payload);
      setIsModalOpen(false);
      setSelectedGrade(null);
      getGrades(page, 50, filterStudentId);
    } catch (err) {
      console.error('Error saving grade:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteGrade(selectedGrade.id);
      setIsDeleteOpen(false);
      setSelectedGrade(null);
      getGrades(page, 50, filterStudentId);
    } catch (err) {
      console.error('Error deleting grade:', err);
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
    { key: 'subject', label: 'Предмет' },
    { key: 'teacher_name', label: 'Учитель' },
    {
      key: 'score',
      label: 'Оценка',
      render: (score) => (
        <Badge variant={score >= 4 ? 'success' : score === 3 ? 'warning' : 'danger'}>
          {score}
        </Badge>
      ),
    },
    { key: 'grade_type', label: 'Тип' },
    { key: 'weight', label: 'Вес' },
    { key: 'quarter', label: 'Четверть' },
  ];

  const fields = [
    { name: 'score', label: 'Оценка', type: 'number', required: true, placeholder: '1-5' },
    {
      name: 'grade_type',
      label: 'Тип оценки',
      type: 'select',
      required: true,
      options: GRADE_TYPES,
    },
    { name: 'weight', label: 'Вес', type: 'number', required: true, placeholder: '1.0' },
    { name: 'quarter', label: 'Четверть', type: 'number', required: true, placeholder: '1-4' },
    { name: 'comment', label: 'Комментарий', type: 'textarea' },
  ];

  return (
    <div className="space-y-6">
      <Card title="📝 Управление оценками">
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
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={grades}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Card>

      <FormModal
        title="Редактировать оценку"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        fields={fields}
        initialData={selectedGrade}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Удалить оценку?"
        message={`Вы уверены, что хотите удалить оценку ${selectedGrade?.score} по предмету ${selectedGrade?.subject}? Это действие необратимо.`}
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

export default GradesManagement;
