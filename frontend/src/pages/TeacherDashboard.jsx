import React, { useEffect, useState } from 'react';
import { useStudentsStore } from '../store/useStudentsStore';
import { Card, Badge } from '../components/ui';

export const TeacherDashboard = () => {
  const {
    classes,
    students,
    riskStudents,
    loading,
    fetchTeacherClasses,
    fetchClassStudents,
    fetchRiskStudents,
  } = useStudentsStore();

  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchTeacherClasses();
    fetchRiskStudents();
  }, [fetchTeacherClasses, fetchRiskStudents]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      const first = classes[0];
      setSelectedClass(first);
      fetchClassStudents(first.id);
    }
  }, [classes, selectedClass, fetchClassStudents]);

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    fetchClassStudents(cls.id);
  };

  const getRiskBadge = (riskLevel) => {
    const map = {
      critical: { variant: 'danger', label: '🔴 Критически' },
      warning: { variant: 'warning', label: '🟠 Требует внимания' },
      normal: { variant: 'success', label: '🟢 В норме' },
    };
    return map[riskLevel] || { variant: 'info', label: '⚪ Нет данных' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Студентов в классе</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{students.length}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">В зоне риска</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{riskStudents.length}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Классов</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{classes.length}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Критических</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">
              {riskStudents.filter(s => s.risk_level === 'critical').length}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="📊 Классы и студенты">
            {classes.length > 0 && (
              <div className="mb-6 flex gap-2 flex-wrap">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedClass?.id === cls.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p className="text-gray-500 text-sm">Загрузка...</p>
            ) : students.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {classes.length === 0
                  ? 'Нет закреплённых классов'
                  : 'Нет студентов в этом классе'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">ФИО</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-900">Средний балл</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-900">Посещаемость</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-900">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((item) => {
                      const student = item.user || item;
                      const analytics = item.analytics || {};
                      const avg = analytics.average_score ?? 'N/A';
                      const attendance = analytics.attendance_rate != null
                        ? `${analytics.attendance_rate}%`
                        : 'N/A';
                      const risk = getRiskBadge(analytics.risk_level);

                      return (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{student.name || student.full_name}</td>
                          <td className="px-4 py-3 text-center text-gray-900">
                            {typeof avg === 'number' ? avg.toFixed(2) : avg}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{attendance}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={risk.variant}>{risk.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="⚠️ Early Warning System">
            {riskStudents.length > 0 ? (
              <div className="space-y-3">
                {riskStudents.map((student) => (
                  <div key={student.student_id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-900 text-sm">{student.name}</p>
                    <p className="text-xs text-red-700 mt-1">Класс: {student.class}</p>
                    <p className="text-xs text-red-700">Средний: {typeof student.average === 'number' ? student.average.toFixed(2) : student.average}</p>
                    {student.reasons?.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">⚠️ {student.reasons[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет студентов в зоне риска</p>
            )}
          </Card>

          <Card title="📝 Быстрые действия">
            <div className="space-y-2">
              <button className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors text-sm">
                ✍️ Выставить оценки
              </button>
              <button className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors text-sm">
                📊 Экспортировать отчет
              </button>
              <button className="w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors text-sm">
                📢 Отправить сообщение
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
