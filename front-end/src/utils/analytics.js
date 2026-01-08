/**
 * Analytics Utility - Safe analytics implementation
 * Supports Google Analytics and other analytics providers
 * Only initializes if tracking ID is provided (via env variable)
 */

const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;
const ENABLE_ANALYTICS = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

// Initialize Google Analytics
export const initAnalytics = () => {
  if (!ENABLE_ANALYTICS || !GA_TRACKING_ID) {
    console.log('Analytics disabled or tracking ID not provided');
    return;
  }

  // Load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (path) => {
  if (!ENABLE_ANALYTICS || !GA_TRACKING_ID || !window.gtag) return;
  
  window.gtag('config', GA_TRACKING_ID, {
    page_path: path || window.location.pathname,
  });
};

// Track events
export const trackEvent = (action, category, label, value) => {
  if (!ENABLE_ANALYTICS || !GA_TRACKING_ID || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track conversions (bookings, signups, etc.)
export const trackConversion = (conversionType, value) => {
  if (!ENABLE_ANALYTICS || !GA_TRACKING_ID || !window.gtag) return;
  
  trackEvent('conversion', conversionType, '', value);
};

// Track user actions
export const trackUserAction = (action, details = {}) => {
  if (!ENABLE_ANALYTICS || !GA_TRACKING_ID || !window.gtag) return;
  
  window.gtag('event', action, details);
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackConversion,
  trackUserAction,
};



