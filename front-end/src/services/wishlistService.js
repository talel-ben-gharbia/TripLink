import api from '../api';

/**
 * Wishlist API Service
 * Handles all wishlist-related API calls
 */

/**
 * Get user's wishlist
 * @returns {Promise<Array>} Array of wishlisted destinations
 */
export const getWishlist = async () => {
  const response = await api.get('/api/wishlist');
  return response.data;
};

/**
 * Add destination to wishlist
 * @param {number} destinationId - ID of the destination to add
 * @returns {Promise<Object>} Response object with status
 */
export const addWishlistItem = async (destinationId) => {
  const response = await api.post(`/api/wishlist/${destinationId}`);
  return response.data;
};

/**
 * Remove destination from wishlist
 * @param {number} destinationId - ID of the destination to remove
 * @returns {Promise<Object>} Response object with status
 */
export const removeWishlistItem = async (destinationId) => {
  const response = await api.delete(`/api/wishlist/${destinationId}`);
  return response.data;
};

