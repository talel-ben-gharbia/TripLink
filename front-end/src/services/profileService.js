import api from '../api';

/**
 * Phase 1: Profile API Service
 * Handles user profile operations
 */

// Get public user profile
export const getPublicProfile = async (userId) => {
  const response = await api.get(`/api/users/${userId}/profile`);
  return response.data;
};

