import bilimClassClient, { mockApiRequest } from './client';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

export const scheduleApi = {
  getSchedule: (className) => {
    if (USE_MOCK) {
      return mockApiRequest('/schedule', { class: className });
    }
    return bilimClassClient.get('/schedule', {
      params: { class: className },
    });
  },
};

export default scheduleApi;
