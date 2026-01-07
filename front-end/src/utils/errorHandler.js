/**
 * Centralized error handling utility
 */

export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Network errors
  if (!error.response) {
    if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error',
        recoveryActions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a few moments and try again'
        ]
      };
    }
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred',
      type: 'error'
    };
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // HTTP status code based errors
  switch (status) {
    case 400:
      return {
        title: 'Invalid Request',
        message: data?.message || 'The request was invalid. Please check your input and try again.',
        type: 'error',
        recoveryActions: [
          'Check all required fields are filled',
          'Verify your input is correct',
          'Try again with different values'
        ]
      };

    case 401:
      return {
        title: 'Authentication Required',
        message: data?.message || 'You need to be logged in to perform this action.',
        type: 'warning',
        recoveryActions: [
          'Please log in to continue',
          'Your session may have expired',
          'Try logging in again'
        ]
      };

    case 403:
      return {
        title: 'Access Denied',
        message: data?.message || 'You do not have permission to perform this action.',
        type: 'error',
        recoveryActions: [
          'Contact support if you believe this is an error',
          'Check if you have the required permissions',
          'Try logging in with a different account'
        ]
      };

    case 404:
      return {
        title: 'Not Found',
        message: data?.message || 'The resource you are looking for could not be found.',
        type: 'info',
        recoveryActions: [
          'The item may have been deleted',
          'Check the URL is correct',
          'Try navigating back or refreshing'
        ]
      };

    case 422:
      return {
        title: 'Validation Error',
        message: data?.message || 'Please check your input and try again.',
        type: 'error',
        recoveryActions: [
          'Review the form for highlighted errors',
          'Check all required fields',
          'Verify your input matches the expected format'
        ],
        validationErrors: data?.errors || {}
      };

    case 429:
      return {
        title: 'Too Many Requests',
        message: data?.message || 'You have made too many requests. Please wait a moment and try again.',
        type: 'warning',
        recoveryActions: [
          'Wait a few seconds before trying again',
          'Reduce the frequency of your requests',
          'Contact support if this persists'
        ]
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        title: 'Server Error',
        message: data?.message || 'Our servers are experiencing issues. Please try again later.',
        type: 'error',
        recoveryActions: [
          'This is a server-side issue. Our team has been notified',
          'Please try again in a few moments',
          'Contact support if the problem persists'
        ]
      };

    default:
      return {
        title: data?.error || 'Error',
        message: data?.message || `An error occurred (${status}). Please try again.`,
        type: 'error',
        recoveryActions: [
          'Try refreshing the page',
          'Clear your browser cache',
          'Contact support if the problem persists'
        ]
      };
  }
};

export const handleApiError = (error, callback) => {
  const errorInfo = getErrorMessage(error);
  
  if (callback && typeof callback === 'function') {
    callback(errorInfo);
  } else {
    // Default behavior: log to console
    console.error('API Error:', errorInfo);
  }

  return errorInfo;
};

export const isNetworkError = (error) => {
  return !error.response && (error.message?.includes('Network Error') || error.message?.includes('fetch'));
};

export const isAuthError = (error) => {
  return error.response?.status === 401 || error.response?.status === 403;
};

export const isValidationError = (error) => {
  return error.response?.status === 422;
};

export const shouldRetry = (error) => {
  const status = error.response?.status;
  // Retry on network errors and 5xx server errors
  return !error.response || (status >= 500 && status < 600);
};


