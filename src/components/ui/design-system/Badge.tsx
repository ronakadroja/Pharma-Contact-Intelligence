import React from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium';

    const variants = {
      default: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
      primary: 'bg-primary-100 text-primary-800 border border-primary-200',
      secondary: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
      success: 'bg-success-100 text-success-800 border border-success-200',
      warning: 'bg-warning-100 text-warning-800 border border-warning-200',
      error: 'bg-error-100 text-error-800 border border-error-200',
      outline: 'bg-transparent text-neutral-600 border border-neutral-300'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs rounded-md',
      md: 'px-2.5 py-0.5 text-sm rounded-lg',
      lg: 'px-3 py-1 text-sm rounded-lg'
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
