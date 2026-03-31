import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Card, Badge } from '../../components/ui';
import DataTable from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';

const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Присутствовал' },
  { value: 'absent', label: 'Отсутствовал' },
  { value: 'late', label: 'Опоздал' },
  { value: 'excused', label: 'Уважительная причина' },
];

export const AttendanceManagement = () => {
  const { attendance, pagination, loading, error, fetchUsers, users, getAttendance, createAttendance, updateAttendance, deleteAttendance } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [filterStudentId, setFilterStudentId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers(1, '', 100);
  }, [fetchUsers]);

  useEffect(() => {
    getAttendance(page, 50, filterStudentId, filterStatus);
  }, [page, filterStudentId, filterStatus, getAttendance]);

  const handleAddClick = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (att) => {
    setSelectedAttendance(att);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (attendanceId) => {
    setSelectedAttendance(attendance.find(a => a.id === attendanceId));
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        student_id: formData.student_id ? parseInt(formData.student_id) : undefined,
        schedule_id: formData.schedule_id ? parseInt(formData.schedule_id) : undefined,
      };
      if (selectedAttendance) {
        await updateAttendance(selectedAttendance.id, payload);
      } else {
        await createAttendance(payload);
      }
      setIsModalOpen(false);
      setSelectedAttendance(null);
      getAttendance(page, 50, filterStudentId, filterStatus);
    } catch (err) {
      console.error('Error saving attendance:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAttendance(selectedAttendance.id);
      setIsDeleteOpen(false);
      setSelectedAttendance(null);
      getAttendance(page, 50, filterStudentId, filterStatus);
    } catch (err) {
      console.error('Error deleting attendance:', err);
    }
  };

  const studentMap = {};
  (users || []).forEach(u => { studentMap[u.id] = u.full_name; });

  const columns = [
    { key: 'id', label: 'ID', width: 'w-12' },
    {
      key: 'student_id',
      label: 'Студент',
      render: (val, row) => {
        const sid = val || row.student_id;
        return studentMap[sid] || (sid ? `#${sid}` : '—');
      },
    },
    { key: 'date', label: 'Дата' },
    {
      key: 'status',
      label: 'Статус',
      render: (status) => {
        let variant = 'success';
        if (status === 'absent') variant = 'danger';
        if (status === 'late') variant = 'warning';
        if (status === 'excused') variant = 'info';
        const labels = {
          present: '✅ Присутствовал',
          absent: '❌ Отсутствовал',
          late: '⏰ Опоздал',
          excused: '📝 Уважительная',
        };
        return <Badge variant={variant}>{labels[status] || status}</Badge>;
      },
    },
    { key: 'notes', label: 'Примечание' },
  ];

  const fields = [
    {
      name: 'student_id',
      label: 'Студент',
      type: 'select',
      required: true,
      options: (users || []).filter(u => u.user_type === 'student' || u.role === 'student').map(u => ({ value: u.id, label: u.full_name })),
    },
    { name: 'schedule_id', label: 'ID Расписания', type: 'number', required: true },
    { name: 'date', label: 'Дата', type: 'date', required: true },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      required: true,
      options: ATTENDANCE_STATUSES,
    },
    { name: 'notes', label: 'Примечание', type: 'textarea' },
  ];

  return (
    <div className="space-y-6">
      <Card title="✅ Управление посещаемостью">
        <div className="flex gap-3 mb-4 flex-wrap">
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

          <select
            value={filterStatus || ''}
            onChange={(e) => {
              setFilterStatus(e.target.value || null);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            {ATTENDANCE_STATUSES.map(st => (
              <option key={st.value} value={st.value}>{st.label}</option>
            ))}
          </select>

          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Добавить запись
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={attendance}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Card>

      <FormModal
        title={selectedAttendance ? 'Редактировать посещаемость' : 'Добавить запись посещаемости'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        fields={fields}
        initialData={selectedAttendance}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Удалить запись?"
        message={`Вы уверены, что хотите удалить запись посещаемости от ${selectedAttendance?.date}? Это действие необратимо.`}
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

export default AttendanceManagement;
