import bilimClassClient from './client';

export const scheduleApi = {
  // Расписание текущего студента (JWT)
  getStudentSchedule: () =>
    bilimClassClient.get('/student/schedule'),

  // Расписание класса по ID
  getClassSchedule: (classId) =>
    bilimClassClient.get(`/schedule/class/${classId}`),

  // Расписание учителя по ID
  getTeacherSchedule: (teacherId) =>
    bilimClassClient.get(`/schedule/teacher/${teacherId}`),
};

export default scheduleApi;
