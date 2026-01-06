import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loading Spinner Component
 */
const LoadingSpinner = ({ size = 48, text = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-purple-600" size={size} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

