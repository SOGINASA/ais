import bilimClassClient from './client';

export const attendanceApi = {
  /**
   * GET /api/attendance?student_id=X
   * @param {number} studentId
   * @returns {Promise<Object>} { data: Attendance[] }
   */
  getAttendance: (studentId) => {
    return bilimClassClient.get('/attendance', {
      params: { student_id: studentId },
    });
  },
};

export default attendanceApi;
