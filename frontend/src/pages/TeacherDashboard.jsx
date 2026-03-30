import React, { useEffect, useState } from 'react';
import { useGradesStore } from '../store/useGradesStore';
import { useStudentsStore } from '../store/useStudentsStore';
import { Card, Badge } from '../components/ui';

export const TeacherDashboard = () => {
  const { fetchStudents, students } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();
  const [selectedClass, setSelectedClass] = useState('10A');
  const [riskStudents, setRiskStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const classStudents = students.filter((s) => s.class === selectedClass);
    classStudents.forEach((student) => {
      fetchGrades(student.id);
    });
  }, [selectedClass, students, fetchGrades]);

  useEffect(() => {
    const classStudents = students.filter((s) => s.class === selectedClass);

    const atRiskStudents = classStudents.filter((student) => {
      const studentGrades = grades.filter((g) => g.student_id === student.id);
      if (studentGrades.length === 0) return false;

      const average = studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length;
      return average < 3.5;
    });

    setRiskStudents(atRiskStudents);
  }, [students, grades, selectedClass]);

  const classStudents = students.filter((s) => s.class === selectedClass);

  const getRiskLevel = (studentId) => {
    const studentGrades = grades.filter((g) => g.student_id === studentId);
    if (studentGrades.length === 0) return 'unknown';

    const average = studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length;
    if (average < 2.5) return 'critical';
    if (average < 3) return 'high';
    if (average < 3.5) return 'medium';
    return 'safe';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Студентов в классе</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{classStudents.length}</p>
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
            <p className="text-gray-600 text-sm font-medium">Отличников</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {classStudents.filter((s) => getRiskLevel(s.id) === 'safe').length}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Всего оценок</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{grades.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="📊 Выбор класса и статистика">
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {['10A', '10B', '10C'].map((className) => (
                  <button
                    key={className}
                    onClick={() => setSelectedClass(className)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedClass === className
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {className}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">ФИО</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-900">Средний балл</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-900">Оценок</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-900">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classStudents.map((student) => {
                    const studentGrades = grades.filter((g) => g.student_id === student.id);
                    const average =
                      studentGrades.length > 0
                        ? (
                            studentGrades.reduce((sum, g) => sum + g.grade, 0) /
                            studentGrades.length
                          ).toFixed(2)
                        : 'N/A';

                    const riskLevel = getRiskLevel(student.id);

                    const riskVariants = {
                      critical: 'danger',
                      high: 'warning',
                      medium: 'warning',
                      safe: 'success',
                      unknown: 'info',
                    };

                    const riskLabels = {
                      critical: '🔴 Критически',
                      high: '🟠 Высокий риск',
                      medium: '🟡 Средний риск',
                      safe: '🟢 В норме',
                      unknown: '⚪ Нет данных',
                    };

                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{student.full_name}</td>
                        <td className="px-4 py-3 text-center text-gray-900">{average}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{studentGrades.length}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={riskVariants[riskLevel]}>
                            {riskLabels[riskLevel]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="⚠️ Early Warning System">
            {riskStudents.length > 0 ? (
              <div className="space-y-3">
                {riskStudents.map((student) => {
                  const studentGrades = grades.filter((g) => g.student_id === student.id);
                  const average = (
                    studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length
                  ).toFixed(2);

                  return (
                    <div key={student.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-semibold text-red-900 text-sm">{student.full_name}</p>
                      <p className="text-xs text-red-700 mt-1">Средний: {average}</p>
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ Требует внимания преподавателя
                      </p>
                    </div>
                  );
                })}
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