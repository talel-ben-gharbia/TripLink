import React from 'react';

const ProfessionalCard = ({ 
  children, 
  className = '', 
  hover = true,
  delay = 0,
  ...props 
}) => {
  const style = delay > 0 ? { animationDelay: `${delay}s` } : {};
  
  return (
    <div
      style={style}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-300 animate-fade-up card-hover ${
        hover ? 'hover:shadow-2xl cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ProfessionalCard;

