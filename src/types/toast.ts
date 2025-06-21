/**
 * Toast System Type Definitions
 * 
 * Centralized type definitions for the toast notification system
 */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-center' 
  | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
  onDismiss: (id: string) => void;
  position?: ToastPosition;
  showProgress?: boolean;
}

export interface ToastConfig {
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
  enableDeduplication?: boolean;
  enableQueue?: boolean;
  enableSound?: boolean;
  enableReducedMotion?: boolean;
}

export interface CreateToastOptions {
  title?: string;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
  position?: ToastPosition;
  showProgress?: boolean;
  metadata?: Record<string, any>;
  deduplicate?: boolean;
}
