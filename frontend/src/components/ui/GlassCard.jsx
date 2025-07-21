import React from 'react';
import { cn } from '../../utils/cn';

const GlassCard = React.forwardRef(({ 
  className, 
  children, 
  variant = 'default',
  blur = 'md',
  ...props 
}, ref) => {
  const baseClasses = "relative rounded-2xl border border-white/20 dark:border-white/10";
  
  const variants = {
    default: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md",
    strong: "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg",
    subtle: "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm",
    frosted: "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl",
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        blurClasses[blur],
        "shadow-glass",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent dark:from-white/5" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

GlassCard.displayName = "GlassCard";

export { GlassCard };