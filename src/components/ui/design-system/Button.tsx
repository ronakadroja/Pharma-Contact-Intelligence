import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn, focusRing, disabledStyles, transitions } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    children, 
    className, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium',
      transitions,
      focusRing,
      disabledStyles
    );

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-medium active:bg-primary-800',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200',
      outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 bg-white',
      ghost: 'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200',
      danger: 'bg-error-600 text-white hover:bg-error-700 shadow-soft hover:shadow-medium active:bg-error-800',
      success: 'bg-success-600 text-white hover:bg-success-700 shadow-soft hover:shadow-medium active:bg-success-800'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5 h-8',
      md: 'px-4 py-2 text-sm rounded-xl gap-2 h-10',
      lg: 'px-6 py-3 text-base rounded-xl gap-2 h-12'
    };

    const isDisabled = disabled || loading;

    return (
      <button 
        ref={ref}
        className={cn(
          baseClasses, 
          variants[variant], 
          sizes[size], 
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
        {!loading && icon && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        <span className={cn(loading && 'opacity-70')}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
