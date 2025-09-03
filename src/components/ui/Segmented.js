import React from 'react';

const Segmented = ({ 
  options, 
  value, 
  onChange, 
  className = '',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-8 text-xs px-2',
    default: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  };
  
  return (
    <div className={`inline-flex bg-gray-900/50 rounded-lg border border-white/5 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`${sizeClasses[size]} rounded-md font-medium transition-all duration-200 ${
            value === option.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Segmented;
