import api from '../api';

/**
 * Phase 1: Collections API Service
 * Handles curated destination collections
 */

// Get all active collections
export const getCollections = async (type = null) => {
  const params = type ? { type } : {};
  const response = await api.get('/api/collections', { params });
  return response.data;
};

// Get collection by slug
export const getCollectionBySlug = async (slug) => {
  const response = await api.get(`/api/collections/${slug}`);
  return response.data;
};

