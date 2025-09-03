import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'p-4',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'rounded-xl border border-white/5 bg-gray-900/50 backdrop-blur-sm';
  
  const variants = {
    default: 'bg-gray-900/50',
    glass: 'bg-gray-900/30 backdrop-blur-md',
    elevated: 'bg-gray-900/60 shadow-lg',
    subtle: 'bg-gray-900/20'
  };
  
  const hoverClasses = hover ? 'hover:bg-gray-900/70 hover:border-white/10 transition-all duration-200' : '';
  
  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${padding} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
