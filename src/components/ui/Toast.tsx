/**
 * Professional Toast Notification System
 * 
 * A production-ready toast notification component with:
 * - Multiple variants (success, error, warning, info)
 * - Smooth animations and transitions
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Auto-dismiss with progress indicator
 * - Action buttons support
 * - Responsive design
 * - Consistent with design system
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from './design-system';
import type { ToastProps, ToastVariant, ToastPosition, ToastAction } from '../../types/toast';

// Re-export types for convenience
export type { ToastProps, ToastVariant, ToastPosition, ToastAction };

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  variant = 'info',
  duration = 5000,
  persistent = false,
  actions = [],
  onDismiss,
  showProgress = true
}) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef<number>(duration);

  // Icon mapping for different variants
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  // Color schemes for different variants
  const variantStyles = {
    success: {
      container: 'bg-white border-l-4 border-success-500 shadow-lg',
      icon: 'text-success-600 bg-success-50',
      progress: 'bg-success-500',
      title: 'text-success-900',
      message: 'text-success-700'
    },
    error: {
      container: 'bg-white border-l-4 border-error-500 shadow-lg',
      icon: 'text-error-600 bg-error-50',
      progress: 'bg-error-500',
      title: 'text-error-900',
      message: 'text-error-700'
    },
    warning: {
      container: 'bg-white border-l-4 border-warning-500 shadow-lg',
      icon: 'text-warning-600 bg-warning-50',
      progress: 'bg-warning-500',
      title: 'text-warning-900',
      message: 'text-warning-700'
    },
    info: {
      container: 'bg-white border-l-4 border-primary-500 shadow-lg',
      icon: 'text-primary-600 bg-primary-50',
      progress: 'bg-primary-500',
      title: 'text-primary-900',
      message: 'text-primary-700'
    }
  };

  const IconComponent = icons[variant];
  const styles = variantStyles[variant];

  // Auto-dismiss logic with pause/resume functionality
  useEffect(() => {
    if (persistent) return;

    const startProgress = () => {
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        if (isHovered) return;

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const progressPercent = (remaining / duration) * 100;

        setProgress(progressPercent);

        if (remaining <= 0) {
          onDismiss(id);
        }
      }, 16); // ~60fps for smooth animation
    };

    startProgress();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id, duration, persistent, onDismiss, isHovered]);

  // Handle mouse enter/leave for pause functionality
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    remainingTimeRef.current = (progress / 100) * duration;
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onDismiss(id);
    }
  };

  // Animation variants
  const toastVariants = {
    initial: {
      opacity: 0,
      y: -50,
      scale: 0.95,
      filter: 'blur(4px)'
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      filter: 'blur(4px)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`
        relative w-full max-w-md rounded-xl overflow-hidden
        ${styles.container}
        backdrop-blur-sm
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress bar */}
      {showProgress && !persistent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200">
          <motion.div
            className={`h-full ${styles.progress}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            ${styles.icon}
          `}>
            <IconComponent size={18} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`
                text-sm font-semibold mb-1 
                ${styles.title}
              `}>
                {title}
              </h4>
            )}
            <p className={`
              text-sm leading-relaxed
              ${styles.message}
            `}>
              {message}
            </p>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={() => {
                      action.onClick();
                      onDismiss(id);
                    }}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => onDismiss(id)}
            className="
              flex-shrink-0 w-6 h-6 rounded-md
              flex items-center justify-center
              text-neutral-400 hover:text-neutral-600
              hover:bg-neutral-100
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500
            "
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;
