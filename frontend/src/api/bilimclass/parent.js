import bilimClassClient from './client';

export const parentApi = {
  getChild: () =>
    bilimClassClient.get('/parent/child'),

  getGrades: (params = {}) =>
    bilimClassClient.get('/parent/grades', { params }),

  getAttendance: (params = {}) =>
    bilimClassClient.get('/parent/attendance', { params }),

  getAnalytics: () =>
    bilimClassClient.get('/parent/analytics'),

  getSchedule: () =>
    bilimClassClient.get('/parent/schedule'),
};

export default parentApi;
