import bilimClassClient, { mockApiRequest } from './client';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

export const attendanceApi = {
  getAttendance: (studentId) => {
    if (USE_MOCK) {
      return mockApiRequest('/attendance', { student_id: studentId });
    }
    return bilimClassClient.get('/attendance', {
      params: { student_id: studentId },
    });
  },
};

export default attendanceApi;
