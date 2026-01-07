/**
 * Accessibility Utilities
 * Safe accessibility helpers that don't break existing functionality
 */

/**
 * Focus management for modals and dialogs
 */
export const trapFocus = (element) => {
  if (!element) return;

  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTab);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTab);
  };
};

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Skip to main content link handler
 */
export const setupSkipLink = () => {
  const skipLink = document.querySelector('a[href="#main-content"]');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
};

/**
 * Keyboard navigation helpers
 */
export const handleKeyboardNavigation = (element, onEnter, onEscape) => {
  if (!element) return;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter(e);
    } else if (e.key === 'Escape' && onEscape) {
      onEscape(e);
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Add ARIA labels to interactive elements without labels
 */
export const enhanceAccessibility = () => {
  // Add aria-labels to icon-only buttons
  document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach((button) => {
    const icon = button.querySelector('svg, i');
    if (icon && !button.textContent.trim()) {
      const title = button.getAttribute('title');
      if (title) {
        button.setAttribute('aria-label', title);
      }
    }
  });

  // Ensure images have alt text
  document.querySelectorAll('img:not([alt])').forEach((img) => {
    if (!img.getAttribute('alt')) {
      img.setAttribute('alt', '');
      img.setAttribute('role', 'presentation');
    }
  });
};

export default {
  trapFocus,
  announceToScreenReader,
  setupSkipLink,
  handleKeyboardNavigation,
  prefersReducedMotion,
  enhanceAccessibility,
};

