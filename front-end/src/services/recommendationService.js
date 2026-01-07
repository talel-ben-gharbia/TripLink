import api from '../api';

export const getRecommendations = async (limit = 10) => {
  const response = await api.get('/api/recommendations', { params: { limit } });
  return response.data;
};


