import bilimClassClient from './client';

export const achievementsApi = {
  /**
   * GET /api/achievements?student_id=X
   * @param {number} studentId
   * @returns {Promise<Object>} { data: Achievement[] }
   */
  getAchievements: (studentId) => {
    return bilimClassClient.get('/achievements', {
      params: { student_id: studentId },
    });
  },
};

export default achievementsApi;
