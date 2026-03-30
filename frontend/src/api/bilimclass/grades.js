import bilimClassClient from './client';

// Все эндпоинты JWT-based — бэкенд сам знает студента по токену
export const gradesApi = {
  getGrades: (params = {}) =>
    bilimClassClient.get('/student/grades', { params }),

  getQuarterGrades: () =>
    bilimClassClient.get('/student/quarter-grades'),

  getGradesBySubject: (subjectId) =>
    bilimClassClient.get('/student/grades', { params: { subject_id: subjectId } }),

  getAnalytics: () =>
    bilimClassClient.get('/student/analytics'),
};

export default gradesApi;
