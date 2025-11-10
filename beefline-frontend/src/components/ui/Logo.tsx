import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* BeefLine Logo SVG */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background Circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="url(#logoGradient)" 
            stroke="#059669" 
            strokeWidth="2"
          />
          
          {/* Cattle Silhouette */}
          <path 
            d="M25 45 C25 40, 30 35, 40 35 L60 35 C70 35, 75 40, 75 45 L75 55 C75 60, 70 65, 60 65 L40 65 C30 65, 25 60, 25 55 Z" 
            fill="white"
          />
          
          {/* Cattle Details */}
          <circle cx="35" cy="42" r="2" fill="#059669" />
          <circle cx="65" cy="42" r="2" fill="#059669" />
          <path d="M30 35 L25 30 M70 35 L75 30" stroke="white" strokeWidth="2" strokeLinecap="round" />
          
          {/* Line Pattern */}
          <path 
            d="M20 70 L80 70 M25 75 L75 75 M30 80 L70 80" 
            stroke="#059669" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Text Logo */}
      <div className="flex flex-col">
        <span className={`font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent ${
          size === 'xl' ? 'text-4xl' : 
          size === 'lg' ? 'text-2xl' : 
          size === 'md' ? 'text-xl' : 'text-lg'
        }`}>
          BeefLine
        </span>
        {size !== 'sm' && (
          <span className={`text-gray-600 ${
            size === 'xl' ? 'text-sm' : 
            size === 'lg' ? 'text-xs' : 'text-xs'
          }`}>
            Ghana Cattle Market
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;