import bilimClassClient from './client';

export const attendanceApi = {
  // Посещаемость текущего студента (JWT)
  getAttendance: (days = 30) =>
    bilimClassClient.get('/student/attendance', { params: { days } }),
};

export default attendanceApi;
