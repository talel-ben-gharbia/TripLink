import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Page Tracker - Safely tracks page views for analytics
 * Wraps the app to track route changes
 */
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    trackPageView(location.pathname);
  }, [location]);

  return null; // This component doesn't render anything
};

export default PageTracker;



