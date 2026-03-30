import bilimClassClient from './client';

export const gradesApi = {
  /**
   * GET /api/grades?student_id=X
   * @param {number} studentId
   * @returns {Promise<Object>} { data: Grade[] }
   */
  getGrades: (studentId) => {
    return bilimClassClient.get('/grades', {
      params: { student_id: studentId },
    });
  },

  /**
   * GET /api/quarter-grades?student_id=X
   * @param {number} studentId
   * @returns {Promise<Object>} { data: QuarterGrade[] }
   */
  getQuarterGrades: (studentId) => {
    return bilimClassClient.get('/quarter-grades', {
      params: { student_id: studentId },
    });
  },

  /**
   * GET /api/grades?student_id=X&subject=Y
   * @param {number} studentId
   * @param {string} subject
   * @returns {Promise<Object>} { data: Grade[] }
   */
  getGradesBySubject: (studentId, subject) => {
    return bilimClassClient.get('/grades', {
      params: { student_id: studentId, subject },
    });
  },
};

export default gradesApi;
