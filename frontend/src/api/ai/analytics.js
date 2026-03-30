import bilimClassClient from '../bilimclass/client';

export const analyticsApi = {
  // Полная аналитика текущего студента (JWT)
  getStudentAnalytics: () =>
    bilimClassClient.get('/student/analytics'),

  // AI-отчёт по студенту (для учителей/себя)
  getStudentReport: (studentId) =>
    bilimClassClient.get(`/ai/student-report/${studentId}`),

  // AI-отчёт по классу (только для учителей/админов)
  getClassReport: (classId) =>
    bilimClassClient.get(`/ai/class-report/${classId}`),

  // Анализ по предмету
  getSubjectAnalysis: (studentId, subjectId) =>
    bilimClassClient.get(`/ai/subject-analysis/${studentId}/${subjectId}`),
};

export default analyticsApi;
