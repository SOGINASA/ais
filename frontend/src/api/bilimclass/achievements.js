import bilimClassClient, { mockApiRequest } from './client';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

export const achievementsApi = {
  getAchievements: (studentId) => {
    if (USE_MOCK) {
      return mockApiRequest('/achievements', { student_id: studentId });
    }
    return bilimClassClient.get('/achievements', {
      params: { student_id: studentId },
    });
  },
};

export default achievementsApi;
