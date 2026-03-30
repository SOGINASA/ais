import bilimClassClient from '../bilimclass/client';

export const reportsApi = {
  // Генерация AI-отчёта по студенту (POST, учителем)
  generateStudentReport: (studentId) =>
    bilimClassClient.post(`/teacher/report/${studentId}`),

  // AI-отчёт по студенту (GET)
  getStudentReport: (studentId) =>
    bilimClassClient.get(`/ai/student-report/${studentId}`),

  // AI-отчёт по классу
  getClassReport: (classId) =>
    bilimClassClient.get(`/ai/class-report/${classId}`),
};

export default reportsApi;
