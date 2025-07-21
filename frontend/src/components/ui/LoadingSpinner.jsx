import React from 'react';
import { cn } from '../../utils/cn';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    acoustic: 'text-acoustic-600',
    electric: 'text-electric-600',
    frequency: 'text-frequency-600',
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <div
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

const AudioWaveLoader = ({ className, ...props }) => {
  return (
    <div className={cn("flex items-center space-x-1", className)} {...props}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary-600 rounded-full animate-audio-bounce"
          style={{
            height: `${Math.random() * 20 + 10}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

const PulseLoader = ({ 
  size = 'md', 
  color = 'primary', 
  className,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    acoustic: 'bg-acoustic-600',
    electric: 'bg-electric-600',
    frequency: 'bg-frequency-600',
  };

  return (
    <div className={cn("flex space-x-1", className)} {...props}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
};

export { LoadingSpinner, AudioWaveLoader, PulseLoader };