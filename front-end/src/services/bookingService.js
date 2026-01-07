import api from '../api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/api/bookings', bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/api/bookings');
  return response.data;
};

export const getBooking = async (bookingId) => {
  const response = await api.get(`/api/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId, reason) => {
  const response = await api.post(`/api/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

export const checkRouting = async (destinationId, bookingData) => {
  const response = await api.post('/api/bookings/check-routing', {
    destinationId,
    ...bookingData
  });
  return response.data;
};

export const createPaymentIntent = async (bookingId) => {
  const response = await api.post('/api/payments/create-intent', { bookingId });
  return response.data;
};

export const createCheckoutSession = async (bookingId) => {
  const response = await api.post('/api/payments/create-checkout', { bookingId });
  return response.data;
};

export const verifyCheckoutSession = async (bookingId, sessionId) => {
  const response = await api.post('/api/payments/verify-checkout', { 
    bookingId, 
    sessionId 
  });
  return response.data;
};

export const confirmPayment = async (bookingId, paymentIntentId) => {
  const response = await api.post('/api/payments/confirm', {
    bookingId,
    paymentIntentId
  });
  return response.data;
};

export const updateBooking = async (bookingId, bookingData) => {
  const response = await api.put(`/api/bookings/${bookingId}`, bookingData);
  return response.data;
};

export const completeBooking = async (bookingId) => {
  const response = await api.post(`/api/bookings/${bookingId}/complete`);
  return response.data;
};

export const finalizeBooking = async (bookingId, notes = null) => {
  const response = await api.post(`/api/bookings/${bookingId}/finalize`, { notes });
  return response.data;
};

