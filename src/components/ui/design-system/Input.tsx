import React from 'react';
import { cn, focusRing, disabledStyles, transitions } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint, 
    leftIcon, 
    rightIcon, 
    variant = 'default', 
    className, 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseClasses = cn(
      'w-full text-sm placeholder:text-neutral-400',
      transitions,
      focusRing,
      disabledStyles
    );

    const variants = {
      default: cn(
        'border border-neutral-300 rounded-xl px-4 py-3 bg-white',
        'hover:border-neutral-400',
        'focus:border-primary-500 focus:ring-primary-500',
        error && 'border-error-500 focus:border-error-500 focus:ring-error-500'
      ),
      filled: cn(
        'bg-neutral-100 border-0 rounded-xl px-4 py-3',
        'hover:bg-neutral-200',
        'focus:bg-white focus:ring-primary-500',
        error && 'bg-error-50 focus:bg-white focus:ring-error-500'
      ),
      outlined: cn(
        'border-2 border-neutral-300 rounded-xl px-4 py-3 bg-white',
        'hover:border-neutral-400',
        'focus:border-primary-500',
        error && 'border-error-500 focus:border-error-500'
      )
    };

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input 
            ref={ref}
            id={inputId}
            className={cn(
              baseClasses, 
              variants[variant], 
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-error-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="text-sm text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
