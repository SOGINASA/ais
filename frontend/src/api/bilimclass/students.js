import bilimClassClient from './client';

export const studentsApi = {
  // Для учителя: получить классы
  getTeacherClasses: () =>
    bilimClassClient.get('/teacher/classes'),

  // Для учителя: получить студентов класса с аналитикой
  getClassStudents: (classId) =>
    bilimClassClient.get(`/teacher/class/${classId}/students`),

  // Для учителя: студенты в зоне риска
  getRiskStudents: () =>
    bilimClassClient.get('/teacher/risk-students'),

  // Для учителя: выставить оценку
  addGrade: (data) =>
    bilimClassClient.post('/teacher/grade', data),

  // Для учителя: отметить посещаемость
  markAttendance: (records) =>
    bilimClassClient.post('/teacher/mark-attendance', { records }),
};

export default studentsApi;
