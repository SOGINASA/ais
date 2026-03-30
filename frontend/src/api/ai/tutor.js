import bilimClassClient from '../bilimclass/client';

export const tutorApi = {
  getStudentAnalytics: () =>
    bilimClassClient.get('/student/analytics'),

  getPredictions: (studentId) =>
    bilimClassClient.get(`/ai/predictions/${studentId}`),
};

export default tutorApi;
