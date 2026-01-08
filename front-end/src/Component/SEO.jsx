import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Manages page meta tags, Open Graph, and Twitter Cards
 * Safe implementation that doesn't break existing functionality
 */
const SEO = ({ 
  title = 'TripLink - Intelligent Travel Companion',
  description = 'Discover and book amazing travel destinations with TripLink. Personalized recommendations, intelligent routing, and professional travel services.',
  image = '/assets/og-image.png',
  type = 'website',
  url = '',
  keywords = 'travel, booking, destinations, vacation, trip planning'
}) => {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'TripLink');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1');

    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', fullImageUrl, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'TripLink', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImageUrl);

    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('theme-color', '#7c3aed');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Structured Data (JSON-LD)
    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebSite',
      name: 'TripLink',
      url: window.location.origin,
      description: description,
      publisher: {
        '@type': 'Organization',
        name: 'TripLink',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/assets/logo.png`
        }
      }
    };

    structuredData.textContent = JSON.stringify(schema);
  }, [title, description, image, type, url, keywords, currentUrl, fullImageUrl]);

  return null; // This component doesn't render anything
};

export default SEO;



