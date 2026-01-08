import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage Component - Safe lazy loading for images
 * Improves performance without breaking existing functionality
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    let observer;
    const currentImg = imgRef.current;

    // If IntersectionObserver is supported, use lazy loading
    if ('IntersectionObserver' in window && currentImg) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Load the image
              const img = new Image();
              img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
              };
              img.onerror = () => {
                setHasError(true);
                if (onError) {
                  onError();
                } else {
                  // Default fallback
                  setImageSrc('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80');
                }
              };
              img.src = src;
              observer.unobserve(currentImg);
            }
          });
        },
        { rootMargin: '50px' } // Start loading 50px before image enters viewport
      );

      observer.observe(currentImg);
    } else {
      // Fallback: load immediately if IntersectionObserver not supported
      setImageSrc(src);
    }

    return () => {
      if (observer && currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [src, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0 transition-opacity duration-300' : 'opacity-100'} ${hasError ? 'object-cover' : ''}`}
      loading="lazy"
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
          if (onError) {
            onError(e);
          } else {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80';
          }
        }
      }}
      {...props}
    />
  );
};

export default LazyImage;



