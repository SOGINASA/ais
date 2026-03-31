import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Card } from '../../components/ui';
import DataTable from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

export const ScheduleManagement = () => {
  const { schedule, classes: classList, pagination, loading, error, fetchSchedule, fetchClasses, createSchedule, updateSchedule, deleteSchedule } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filterClassId, setFilterClassId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchClasses(1);
  }, [fetchClasses]);

  useEffect(() => {
    fetchSchedule(page, 50, filterClassId);
  }, [page, filterClassId, fetchSchedule]);

  const handleAddClick = () => {
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (sched) => {
    setSelectedSchedule(sched);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (scheduleId) => {
    setSelectedSchedule(schedule.find(s => s.id === scheduleId));
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        class_id: parseInt(formData.class_id),
        teacher_id: parseInt(formData.teacher_id),
        subject_id: parseInt(formData.subject_id),
        day_of_week: parseInt(formData.day_of_week),
        time_slot: parseInt(formData.time_slot),
      };
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.id, payload);
      } else {
        await createSchedule(payload);
      }
      setIsModalOpen(false);
      setSelectedSchedule(null);
      fetchSchedule(page, 50, filterClassId);
    } catch (err) {
      console.error('Error saving schedule:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSchedule(selectedSchedule.id);
      setIsDeleteOpen(false);
      setSelectedSchedule(null);
      fetchSchedule(page, 50, filterClassId);
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: 'w-12' },
    { key: 'class_name', label: 'Класс' },
    { key: 'subject', label: 'Предмет' },
    { key: 'teacher_name', label: 'Учитель' },
    {
      key: 'day_of_week',
      label: 'День недели',
      render: (day) => DAYS[day] || `День ${day}`,
    },
    { key: 'time_slot', label: 'Слот', width: 'w-16' },
    { key: 'start_time', label: 'Начало' },
    { key: 'end_time', label: 'Конец' },
    { key: 'room', label: 'Кабинет' },
  ];

  const fields = [
    {
      name: 'class_id',
      label: 'Класс',
      type: 'select',
      required: true,
      options: classList.map(c => ({ value: c.id, label: c.name })),
    },
    { name: 'teacher_id', label: 'ID Учителя', type: 'number', required: true },
    { name: 'subject_id', label: 'ID Предмета', type: 'number', required: true },
    {
      name: 'day_of_week',
      label: 'День недели',
      type: 'select',
      required: true,
      options: DAYS.map((d, i) => ({ value: i, label: d })),
    },
    { name: 'time_slot', label: 'Время слот', type: 'number', required: true, placeholder: '1-7' },
    { name: 'start_time', label: 'Время начала', type: 'time', required: true },
    { name: 'end_time', label: 'Время конца', type: 'time', required: true },
    { name: 'room', label: 'Номер кабинета', type: 'text', required: true, placeholder: '101' },
  ];

  return (
    <div className="space-y-6">
      <Card title="📅 Управление расписанием">
        <div className="flex gap-3 mb-4">
          <select
            value={filterClassId || ''}
            onChange={(e) => {
              setFilterClassId(e.target.value ? parseInt(e.target.value) : null);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все классы</option>
            {classList.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Добавить урок
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={schedule}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Card>

      <FormModal
        title={selectedSchedule ? 'Редактировать урок' : 'Добавить новый урок'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        fields={fields}
        initialData={selectedSchedule}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Удалить урок?"
        message={`Вы уверены, что хотите удалить урок в ${DAYS[selectedSchedule?.day_of_week]} на слоте ${selectedSchedule?.time_slot}? Это действие необратимо.`}
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

export default ScheduleManagement;
