import bilimClassClient, { mockApiRequest } from './client';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

export const studentsApi = {
  getStudents: () => {
    if (USE_MOCK) {
      return mockApiRequest('/students');
    }
    return bilimClassClient.get('/students');
  },

  getStudent: (id) => {
    if (USE_MOCK) {
      return mockApiRequest(`/students/${id}`);
    }
    return bilimClassClient.get(`/students/${id}`);
  },
};

export default studentsApi;
