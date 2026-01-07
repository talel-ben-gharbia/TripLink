import api from '../api';
import axios from 'axios';
import { API_URL } from '../config';

// Create a separate axios instance for unauthenticated requests
const unauthenticatedApi = axios.create({
  baseURL: API_URL,
});

export const submitAgentApplication = async (applicationData) => {
  try {
    // Use unauthenticated API since agent application doesn't require login
    const response = await unauthenticatedApi.post('/api/agent/apply', applicationData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  } catch (error) {
    // Re-throw with more context
    if (error.response) {
      // Server responded with error status
      throw error;
    } else if (error.request) {
      // Request was made but no response
      throw new Error('Network error: Unable to reach server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

export const getAgentApplicationStatus = async () => {
  const response = await api.get('/api/agent/application');
  return response.data;
};

export const getAgentDashboard = async () => {
  const response = await api.get('/api/agent/dashboard');
  return response.data;
};

export const getPendingBookings = async () => {
  const response = await api.get('/api/agent/pending-bookings');
  return response.data;
};

export const getAgentBookings = async () => {
  const response = await api.get('/api/agent/bookings');
  return response.data;
};

export const assignBooking = async (bookingId) => {
  const response = await api.post(`/api/agent/bookings/${bookingId}/assign`);
  return response.data;
};

export const confirmAgentBooking = async (bookingId) => {
  const response = await api.post(`/api/agent/bookings/${bookingId}/confirm`);
  return response.data;
};

// Messaging
export const sendMessage = async (clientId, subject, message, bookingId = null) => {
  try {
    const response = await api.post('/api/agent/messages', {
      clientId: parseInt(clientId),
      subject: subject.trim(),
      message: message.trim(),
      bookingId: bookingId ? parseInt(bookingId) : null
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    // Re-throw with better error message
    if (error.response) {
      throw error; // Let the component handle the error
    } else if (error.request) {
      throw new Error('Network error: Unable to reach server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while sending the message.');
    }
  }
};

export const getConversation = async (clientId) => {
  const response = await api.get(`/api/agent/messages/conversation/${clientId}`);
  return response.data;
};

export const getUnreadMessageCount = async () => {
  const response = await api.get('/api/agent/messages/unread-count');
  return response.data;
};

export const markMessageAsRead = async (messageId) => {
  const response = await api.post(`/api/agent/messages/${messageId}/read`);
  return response.data;
};

// Commissions
export const getCommissions = async () => {
  const response = await api.get('/api/agent/commissions');
  return response.data;
};

