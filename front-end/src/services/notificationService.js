import api from '../api';

export const getNotifications = async (limit = 50, offset = 0, unreadOnly = false) => {
  const params = { limit, offset };
  if (unreadOnly) {
    params.unread_only = 'true';
  }
  const response = await api.get('/api/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data.count;
};

export const markAsRead = async (notificationIds) => {
  const response = await api.post('/api/notifications/mark-read', { notificationIds });
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.post('/api/notifications/mark-all-read');
  return response.data;
};


