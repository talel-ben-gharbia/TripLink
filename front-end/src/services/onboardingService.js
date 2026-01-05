import api from '../api';

/**
 * Phase 1: Onboarding API Service
 * Handles first-login onboarding flow
 */

// Check onboarding status
export const getOnboardingStatus = async () => {
  const response = await api.get('/api/onboarding/status');
  return response.data;
};

// Complete onboarding with preferences
export const completeOnboarding = async (preferences) => {
  const response = await api.post('/api/onboarding/complete', preferences);
  return response.data;
};

// Skip onboarding
export const skipOnboarding = async () => {
  const response = await api.post('/api/onboarding/skip');
  return response.data;
};

