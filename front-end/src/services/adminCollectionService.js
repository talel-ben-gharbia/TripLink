import api from '../api';

/**
 * Admin Collections API Service
 * Handles CRUD operations for destination collections (admin only)
 */

// Get all collections (including inactive)
export const getAdminCollections = async () => {
  const response = await api.get('/api/admin/collections');
  return response.data;
};

// Get collection details
export const getAdminCollection = async (id) => {
  const response = await api.get(`/api/admin/collections/${id}`);
  return response.data;
};

// Create new collection
export const createCollection = async (collectionData) => {
  const response = await api.post('/api/admin/collections', collectionData);
  return response.data;
};

// Update collection
export const updateCollection = async (id, collectionData) => {
  const response = await api.put(`/api/admin/collections/${id}`, collectionData);
  return response.data;
};

// Delete collection
export const deleteCollection = async (id) => {
  const response = await api.delete(`/api/admin/collections/${id}`);
  return response.data;
};

// Add destination to collection
export const addDestinationToCollection = async (collectionId, destinationId, order = null) => {
  const response = await api.post(`/api/admin/collections/${collectionId}/destinations/${destinationId}`, { order });
  return response.data;
};

// Remove destination from collection
export const removeDestinationFromCollection = async (collectionId, destinationId) => {
  const response = await api.delete(`/api/admin/collections/${collectionId}/destinations/${destinationId}`);
  return response.data;
};

// Update destination order in collection
export const updateDestinationOrder = async (collectionId, destinationOrders) => {
  const response = await api.put(`/api/admin/collections/${collectionId}/destinations/order`, { destinationOrders });
  return response.data;
};

