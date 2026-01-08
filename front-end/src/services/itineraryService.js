import api from '../api';

export const getItinerary = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/api/itinerary', { params });
  return response.data;
};

export const createItineraryItem = async (item) => {
  const response = await api.post('/api/itinerary', item);
  return response.data;
};

export const updateItineraryItem = async (id, item) => {
  const response = await api.put(`/api/itinerary/${id}`, item);
  return response.data;
};

export const deleteItineraryItem = async (id) => {
  const response = await api.delete(`/api/itinerary/${id}`);
  return response.data;
};




