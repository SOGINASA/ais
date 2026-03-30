import bilimClassClient from './bilimclass/client';

export const scheduleApi = {
  getStudentSchedule: () =>
    bilimClassClient.get('/student/schedule'),

  getClassSchedule: (classId) =>
    bilimClassClient.get(`/schedule/class/${classId}`),

  getTeacherSchedule: (teacherId) =>
    bilimClassClient.get(`/schedule/teacher/${teacherId}`),

  updateScheduleEntry: (scheduleId, data) =>
    bilimClassClient.put(`/schedule/${scheduleId}`, data),
};

export default scheduleApi;
