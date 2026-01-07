import api from '../api';

export const getAdminBookings = async () => {
  const response = await api.get('/api/admin/bookings');
  return response.data;
};

export const getAdminBookingStats = async () => {
  const response = await api.get('/api/admin/bookings/stats');
  return response.data;
};

export const getAdminAgentApplications = async () => {
  const response = await api.get('/api/admin/agent-applications');
  return response.data;
};

export const approveAgentApplication = async (applicationId, adminNotes = null) => {
  const response = await api.post(`/api/admin/agent-applications/${applicationId}/approve`, { adminNotes });
  return response.data;
};

export const rejectAgentApplication = async (applicationId, reason = null) => {
  const response = await api.post(`/api/admin/agent-applications/${applicationId}/reject`, { reason });
  return response.data;
};

export const getAdminAgents = async () => {
  const response = await api.get('/api/admin/agents');
  return response.data;
};

export const removeAgentRole = async (agentId) => {
  const response = await api.post(`/api/admin/agents/${agentId}/remove-role`);
  return response.data;
};

