import api from '../api';

/**
 * Review & Rating API Service
 * Handles destination reviews and ratings
 */

// Get reviews for a destination
export const getReviews = async (destinationId) => {
  const response = await api.get(`/api/destinations/${destinationId}/reviews`);
  return response.data;
};

// Get review statistics for a destination
export const getReviewStats = async (destinationId) => {
  const response = await api.get(`/api/destinations/${destinationId}/reviews/stats`);
  return response.data;
};

// Create a review
export const createReview = async (destinationId, rating, comment = null, isPublic = true) => {
  const response = await api.post(`/api/destinations/${destinationId}/reviews`, {
    rating,
    comment,
    isPublic,
  });
  return response.data;
};

// Update a review
export const updateReview = async (destinationId, reviewId, rating, comment = null, isPublic = true) => {
  const response = await api.put(`/api/destinations/${destinationId}/reviews/${reviewId}`, {
    rating,
    comment,
    isPublic,
  });
  return response.data;
};

// Delete a review
export const deleteReview = async (destinationId, reviewId) => {
  const response = await api.delete(`/api/destinations/${destinationId}/reviews/${reviewId}`);
  return response.data;
};

