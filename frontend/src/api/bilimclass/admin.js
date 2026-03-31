import bilimClassClient from './client';

export const adminApi = {
  getUsers: (page = 1, perPage = 20, search = '') =>
    bilimClassClient.get('/admin/users', { params: { page, per_page: perPage, search } }),

  getUser: (userId) =>
    bilimClassClient.get(`/admin/users/${userId}`),

  createUser: (data) =>
    bilimClassClient.post('/admin/users', data),

  updateUser: (userId, data) =>
    bilimClassClient.put(`/admin/users/${userId}`, data),

  deleteUser: (userId) =>
    bilimClassClient.delete(`/admin/users/${userId}`),

  activateUser: (userId) =>
    bilimClassClient.post(`/admin/users/${userId}/activate`),

  deactivateUser: (userId) =>
    bilimClassClient.post(`/admin/users/${userId}/deactivate`),

  getSubjects: (page = 1, perPage = 50, search = '') =>
    bilimClassClient.get('/admin/subjects', { params: { page, per_page: perPage, search } }),

  createSubject: (data) =>
    bilimClassClient.post('/admin/subjects', data),

  updateSubject: (subjectId, data) =>
    bilimClassClient.put(`/admin/subjects/${subjectId}`, data),

  deleteSubject: (subjectId) =>
    bilimClassClient.delete(`/admin/subjects/${subjectId}`),

  getClasses: (page = 1, perPage = 100) =>
    bilimClassClient.get('/admin/classes', { params: { page, per_page: perPage } }),

  createClass: (data) =>
    bilimClassClient.post('/admin/classes', data),

  updateClass: (classId, data) =>
    bilimClassClient.put(`/admin/classes/${classId}`, data),

  deleteClass: (classId) =>
    bilimClassClient.delete(`/admin/classes/${classId}`),

  getSchedule: (page = 1, perPage = 100, classId = null, dayOfWeek = null) =>
    bilimClassClient.get('/admin/schedule', { params: { page, per_page: perPage, class_id: classId, day_of_week: dayOfWeek } }),

  createSchedule: (data) =>
    bilimClassClient.post('/admin/schedule', data),

  updateSchedule: (scheduleId, data) =>
    bilimClassClient.put(`/admin/schedule/${scheduleId}`, data),

  deleteSchedule: (scheduleId) =>
    bilimClassClient.delete(`/admin/schedule/${scheduleId}`),

  getGrades: (page = 1, perPage = 50, studentId = null, subjectId = null) =>
    bilimClassClient.get('/admin/grades', { params: { page, per_page: perPage, student_id: studentId, subject_id: subjectId } }),

  updateGrade: (gradeId, data) =>
    bilimClassClient.put(`/admin/grades/${gradeId}`, data),

  deleteGrade: (gradeId) =>
    bilimClassClient.delete(`/admin/grades/${gradeId}`),

  getAchievements: (page = 1, perPage = 50, studentId = null) =>
    bilimClassClient.get('/admin/achievements', { params: { page, per_page: perPage, student_id: studentId } }),

  createAchievement: (data) =>
    bilimClassClient.post('/admin/achievements', data),

  updateAchievement: (achievementId, data) =>
    bilimClassClient.put(`/admin/achievements/${achievementId}`, data),

  deleteAchievement: (achievementId) =>
    bilimClassClient.delete(`/admin/achievements/${achievementId}`),

  getAttendance: (page = 1, perPage = 50, studentId = null, status = null) =>
    bilimClassClient.get('/admin/attendance', { params: { page, per_page: perPage, student_id: studentId, status } }),

  createAttendance: (data) =>
    bilimClassClient.post('/admin/attendance', data),

  updateAttendance: (attendanceId, data) =>
    bilimClassClient.put(`/admin/attendance/${attendanceId}`, data),

  deleteAttendance: (attendanceId) =>
    bilimClassClient.delete(`/admin/attendance/${attendanceId}`),

  getStats: () =>
    bilimClassClient.get('/admin/stats'),

  getFeedback: (page = 1, perPage = 20, unreadOnly = false) =>
    bilimClassClient.get('/admin/feedback', { params: { page, per_page: perPage, unread: unreadOnly } }),

  markFeedbackRead: (feedbackId) =>
    bilimClassClient.post(`/admin/feedback/${feedbackId}/read`),

  getAuditLogs: (page = 1, perPage = 50, actionType = null, status = null) =>
    bilimClassClient.get('/admin/audit-logs', { params: { page, per_page: perPage, action_type: actionType, status } }),
};

export default adminApi;
