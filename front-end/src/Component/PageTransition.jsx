import React from 'react';

const PageTransition = ({ children, className = '' }) => {
  return (
    <div className={`page-transition animate-fade-up ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;

