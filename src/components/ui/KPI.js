import React from 'react';

const KPI = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className = '',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const valueSizes = {
    sm: 'text-lg',
    default: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className={`${iconSizes[size]} text-blue-400`} />}
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
        {trend && (
          <div className={`text-xs font-medium ${
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className={`font-bold text-white ${valueSizes[size]}`}>
        {value}
      </div>
    </div>
  );
};

export default KPI;
