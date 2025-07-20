import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white shadow-md hover:bg-primary-700 focus-visible:ring-primary-500",
        destructive: "bg-error-600 text-white shadow-md hover:bg-error-700 focus-visible:ring-error-500",
        outline: "border border-neutral-300 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50 focus-visible:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
        secondary: "bg-secondary-600 text-white shadow-md hover:bg-secondary-700 focus-visible:ring-secondary-500",
        ghost: "text-neutral-700 hover:bg-neutral-100 focus-visible:ring-primary-500 dark:text-neutral-300 dark:hover:bg-neutral-800",
        link: "text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500",
        gradient: "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg hover:from-primary-700 hover:to-secondary-700 focus-visible:ring-primary-500",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
  const Comp = asChild ? "span" : "button";
  
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
      )}
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
