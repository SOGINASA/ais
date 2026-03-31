import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Card } from '../../components/ui';
import DataTable from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

export const SubjectsManagement = () => {
  const { subjects, pagination, loading, error, fetchSubjects, createSubject, updateSubject, deleteSubject } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, fetchSubjects]);

  const handleAddClick = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (subjectId) => {
    setSelectedSubject(subjects.find(s => s.id === subjectId));
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedSubject) {
        await updateSubject(selectedSubject.id, formData);
      } else {
        await createSubject(formData);
      }
      setIsModalOpen(false);
      setSelectedSubject(null);
      fetchSubjects(page, search);
    } catch (err) {
      console.error('Error saving subject:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSubject(selectedSubject.id);
      setIsDeleteOpen(false);
      setSelectedSubject(null);
      fetchSubjects(page, search);
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: 'w-12' },
    { key: 'name', label: 'Название' },
    { key: 'code', label: 'Код' },
    {
      key: 'color',
      label: 'Цвет',
      render: (color) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: color }}></div>
          <span className="text-xs text-gray-600">{color}</span>
        </div>
      ),
    },
  ];

  const fields = [
    { name: 'name', label: 'Название предмета', type: 'text', required: true, placeholder: 'Например: Математика' },
    { name: 'code', label: 'Код', type: 'text', required: true, placeholder: 'Например: MATH' },
    { name: 'description', label: 'Описание', type: 'textarea', placeholder: 'Описание предмета' },
    { name: 'color', label: 'Цвет', type: 'text', placeholder: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <Card title="📚 Управление предметами">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Добавить предмет
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={subjects}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Card>

      <FormModal
        title={selectedSubject ? 'Редактировать предмет' : 'Добавить новый предмет'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        fields={fields}
        initialData={selectedSubject}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Удалить предмет?"
        message={`Вы уверены, что хотите удалить предмет "${selectedSubject?.name}"? Это действие необратимо.`}
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

export default SubjectsManagement;
