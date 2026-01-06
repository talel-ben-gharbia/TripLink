import api from '../api';

/**
 * Phase 1: Destination API Service
 * Handles all destination-related API calls
 */

// Get featured destinations
export const getFeaturedDestinations = async () => {
  const response = await api.get('/api/destinations/featured');
  return response.data;
};

// Get destinations with enhanced filtering
export const getDestinations = async (params = {}) => {
  const {
    q,
    country,
    tags, // Can be string (comma-separated) or array
    category,
    priceMin,
    priceMax,
    sort, // Format: "popularity:desc" or "rating:asc", etc.
    limit = 100,
    offset = 0
  } = params;

  const queryParams = { limit, offset };
  
  if (q) queryParams.q = q;
  if (country) queryParams.country = country;
  if (category) queryParams.category = category;
  if (priceMin !== undefined) queryParams.priceMin = priceMin;
  if (priceMax !== undefined) queryParams.priceMax = priceMax;
  if (sort) queryParams.sort = sort;
  
  // Handle multi-tag filtering
  if (tags) {
    if (Array.isArray(tags)) {
      queryParams.tags = tags.join(',');
    } else {
      queryParams.tags = tags;
    }
  }

  const response = await api.get('/api/destinations', { params: queryParams });
  return response.data;
};

// Search autocomplete
export const getAutocompleteSuggestions = async (query, limit = 10) => {
  if (!query || query.length < 2) return [];
  
  const response = await api.get('/api/destinations/autocomplete', {
    params: { q: query, limit }
  });
  return response.data;
};

// Get all available tags
export const getAllTags = async () => {
  const response = await api.get('/api/destinations/tags');
  return response.data;
};

// Get all categories
export const getAllCategories = async () => {
  const response = await api.get('/api/destinations/categories');
  return response.data;
};

