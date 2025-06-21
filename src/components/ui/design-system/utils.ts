import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with proper class merging
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Utility function to create consistent focus ring styles
 */
export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';

/**
 * Utility function to create consistent disabled styles
 */
export const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

/**
 * Utility function to create consistent transition styles
 */
export const transitions = 'transition-all duration-200 ease-in-out';
