import bilimClassClient, { mockApiRequest } from './client';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

export const gradesApi = {
  getGrades: (studentId) => {
    if (USE_MOCK) {
      return mockApiRequest('/grades', { student_id: studentId });
    }
    return bilimClassClient.get('/grades', {
      params: { student_id: studentId },
    });
  },

  getQuarterGrades: (studentId) => {
    if (USE_MOCK) {
      return mockApiRequest('/quarter-grades', { student_id: studentId });
    }
    return bilimClassClient.get('/quarter-grades', {
      params: { student_id: studentId },
    });
  },

  getGradesBySubject: (studentId, subject) => {
    if (USE_MOCK) {
      return mockApiRequest('/grades', { student_id: studentId, subject });
    }
    return bilimClassClient.get('/grades', {
      params: { student_id: studentId, subject },
    });
  },
};

export default gradesApi;
