import bilimClassClient from './bilimclass/client';

export const notificationsApi = {
  getNotifications: (page = 1, perPage = 20) =>
    bilimClassClient.get('/notifications/get', { params: { page, per_page: perPage } }),

  getUnreadCount: () =>
    bilimClassClient.get('/notifications/unread-count'),

  markAsRead: (id) =>
    bilimClassClient.post(`/notifications/read/${id}`),

  markAllAsRead: () =>
    bilimClassClient.post('/notifications/read-all'),

  deleteNotification: (id) =>
    bilimClassClient.delete(`/notifications/${id}`),

  deleteAll: () =>
    bilimClassClient.delete('/notifications/delete-all'),

  getPreferences: () =>
    bilimClassClient.get('/notifications/preferences'),

  updatePreferences: (prefs) =>
    bilimClassClient.put('/notifications/preferences', prefs),
};

export default notificationsApi;
