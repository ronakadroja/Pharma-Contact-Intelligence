/**
 * Toast Container Component
 * 
 * Manages the positioning and rendering of multiple toast notifications
 * with proper stacking, animations, and responsive behavior.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';
import type { ToastProps, ToastPosition } from '../../types/toast';

export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
  maxToasts?: number;
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  maxToasts = 5,
  className = ''
}) => {
  // Position-based styling
  const positionStyles = {
    'top-right': 'top-4 right-4 items-end',
    'top-left': 'top-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center'
  };

  // Limit the number of visible toasts
  const visibleToasts = toasts.slice(0, maxToasts);

  // Don't render if no toasts
  if (visibleToasts.length === 0) return null;

  const containerContent = (
    <div
      className={`
        fixed z-[9999] flex flex-col gap-3 pointer-events-none
        ${positionStyles[position]}
        ${className}
      `}
      style={{
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'calc(100vh - 2rem)'
      }}
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              // Ensure toasts don't overflow viewport
              maxWidth: '100%'
            }}
          >
            <Toast {...toast} position={position} />
          </div>
        ))}
      </AnimatePresence>

      {/* Overflow indicator */}
      {toasts.length > maxToasts && (
        <div className="
          pointer-events-auto
          bg-neutral-800 text-white text-xs
          px-3 py-2 rounded-lg shadow-lg
          flex items-center justify-center
          backdrop-blur-sm bg-opacity-90
        ">
          +{toasts.length - maxToasts} more notifications
        </div>
      )}
    </div>
  );

  // Render in portal to ensure proper z-index stacking
  return createPortal(containerContent, document.body);
};

export default ToastContainer;
