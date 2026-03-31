import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Card } from '../../components/ui';
import DataTable from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

export const ClassesManagement = () => {
  const { classes: classList, pagination, loading, error, fetchClasses, createClass, updateClass, deleteClass } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchClasses(page);
  }, [page, fetchClasses]);

  const handleAddClick = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (classId) => {
    setSelectedClass(classList.find(c => c.id === classId));
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        grade_level: formData.grade_level ? parseInt(formData.grade_level) : undefined,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : undefined,
      };
      if (selectedClass) {
        await updateClass(selectedClass.id, payload);
      } else {
        await createClass(payload);
      }
      setIsModalOpen(false);
      setSelectedClass(null);
      fetchClasses(page);
    } catch (err) {
      console.error('Error saving class:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteClass(selectedClass.id);
      setIsDeleteOpen(false);
      setSelectedClass(null);
      fetchClasses(page);
    } catch (err) {
      console.error('Error deleting class:', err);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: 'w-12' },
    { key: 'name', label: 'Название класса' },
    { key: 'grade_level', label: 'Уровень', width: 'w-20' },
    { key: 'teacher_id', label: 'ID Классного руководителя', width: 'w-32' },
  ];

  const fields = [
    { name: 'name', label: 'Название класса', type: 'text', required: true, placeholder: 'Например: 10A' },
    { name: 'grade_level', label: 'Уровень обучения', type: 'number', required: true, placeholder: '10' },
    { name: 'teacher_id', label: 'ID Классного руководителя', type: 'number', placeholder: 'ID учителя (опционально)' },
  ];

  return (
    <div className="space-y-6">
      <Card title="🏫 Управление классами">
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Добавить класс
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={classList}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Card>

      <FormModal
        title={selectedClass ? 'Редактировать класс' : 'Добавить новый класс'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        fields={fields}
        initialData={selectedClass}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Удалить класс?"
        message={`Вы уверены, что хотите удалить класс "${selectedClass?.name}"? Это действие необратимо.`}
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

export default ClassesManagement;
