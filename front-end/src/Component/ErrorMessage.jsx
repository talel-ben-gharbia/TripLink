import React from 'react';
import { AlertCircle, X, RefreshCw, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss, 
  type = 'error',
  title,
  message,
  recoveryActions = []
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'info':
        return <Info className="text-blue-600" size={20} />;
      default:
        return <AlertCircle className="text-red-600" size={20} />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const displayTitle = title || (error?.response?.data?.error || error?.message || 'An error occurred');
  const displayMessage = message || error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

  // Parse error for common issues
  const getRecoverySuggestions = () => {
    if (recoveryActions.length > 0) return recoveryActions;

    const suggestions = [];
    const errorMessage = error?.response?.data?.message || error?.message || '';

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try again in a few moments');
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      suggestions.push('You may need to log in again');
      suggestions.push('Check if your session has expired');
    } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      suggestions.push('You may not have permission for this action');
      suggestions.push('Contact support if you believe this is an error');
    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      suggestions.push('The resource you\'re looking for may not exist');
      suggestions.push('Try navigating back or refreshing the page');
    } else if (errorMessage.includes('500') || errorMessage.includes('server')) {
      suggestions.push('This is a server error. Our team has been notified');
      suggestions.push('Please try again in a few moments');
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      suggestions.push('Please check your input and try again');
      suggestions.push('Make sure all required fields are filled correctly');
    }

    return suggestions.length > 0 ? suggestions : ['Please try again', 'Contact support if the problem persists'];
  };

  return (
    <div className={`rounded-lg border p-4 ${getColorClasses()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1">{displayTitle}</h3>
          <p className="text-sm mb-3">{displayMessage}</p>

          {getRecoverySuggestions().length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-2">Suggestions:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {getRecoverySuggestions().map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-current rounded hover:bg-opacity-10 transition flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-current rounded hover:bg-opacity-10 transition"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-current hover:opacity-70 transition"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;


