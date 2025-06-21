/**
 * Professional Toast Context System
 *
 * A production-ready toast notification system with:
 * - Advanced toast management (queue, deduplication, persistence)
 * - Multiple notification types and configurations
 * - Accessibility features and keyboard navigation
 * - Performance optimizations
 * - TypeScript support with comprehensive interfaces
 */

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import ToastContainer from '../components/ui/ToastContainer';
import type { ToastVariant, ToastPosition, ToastAction, ToastConfig, CreateToastOptions } from '../types/toast';

// Enhanced Toast interface with all professional features
export interface Toast {
    id: string;
    title?: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
    persistent?: boolean;
    actions?: ToastAction[];
    timestamp: number;
    position?: ToastPosition;
    showProgress?: boolean;
    metadata?: Record<string, any>;
}

// Context interface with comprehensive methods
interface ToastContextType {
    toasts: Toast[];
    config: ToastConfig;

    // Core methods
    showToast: (message: string, variant?: ToastVariant, options?: CreateToastOptions) => string;
    removeToast: (id: string) => void;
    removeAllToasts: () => void;

    // Convenience methods for different variants
    success: (message: string, options?: CreateToastOptions) => string;
    error: (message: string, options?: CreateToastOptions) => string;
    warning: (message: string, options?: CreateToastOptions) => string;
    info: (message: string, options?: CreateToastOptions) => string;

    // Advanced methods
    updateToast: (id: string, updates: Partial<Toast>) => void;
    pauseToast: (id: string) => void;
    resumeToast: (id: string) => void;
    updateConfig: (newConfig: Partial<ToastConfig>) => void;

    // Utility methods
    getToastById: (id: string) => Toast | undefined;
    getToastsByVariant: (variant: ToastVariant) => Toast[];
    hasToasts: () => boolean;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Default configuration
const defaultConfig: ToastConfig = {
    position: 'top-right',
    maxToasts: 5,
    defaultDuration: 5000,
    enableDeduplication: true,
    enableQueue: true,
    enableSound: false,
    enableReducedMotion: false
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{
    children: ReactNode;
    config?: Partial<ToastConfig>;
}> = ({
    children,
    config: userConfig = {}
}) => {
        const [toasts, setToasts] = useState<Toast[]>([]);
        const [config, setConfig] = useState<ToastConfig>({ ...defaultConfig, ...userConfig });
        const toastQueue = useRef<Toast[]>([]);
        const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

        // Generate unique ID for toasts
        const generateId = useCallback(() => {
            return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        }, []);

        // Check for duplicate toasts
        const isDuplicate = useCallback((message: string, variant: ToastVariant) => {
            if (!config.enableDeduplication) return false;
            return toasts.some(toast =>
                toast.message === message &&
                toast.variant === variant &&
                Date.now() - toast.timestamp < 1000 // Within 1 second
            );
        }, [toasts, config.enableDeduplication]);

        // Process toast queue
        const processQueue = useCallback(() => {
            if (toastQueue.current.length === 0) return;
            if (toasts.length >= (config.maxToasts || 5)) return;

            const nextToast = toastQueue.current.shift();
            if (nextToast) {
                setToasts(prev => [...prev, nextToast]);
            }
        }, [toasts.length, config.maxToasts]);

        // Auto-remove toast after duration
        const scheduleRemoval = useCallback((id: string, duration: number) => {
            if (timeoutRefs.current.has(id)) {
                clearTimeout(timeoutRefs.current.get(id)!);
            }

            const timeoutId = setTimeout(() => {
                removeToast(id);
            }, duration);

            timeoutRefs.current.set(id, timeoutId);
        }, []);

        // Remove toast
        const removeToast = useCallback((id: string) => {
            setToasts(prev => prev.filter(toast => toast.id !== id));

            // Clear timeout
            if (timeoutRefs.current.has(id)) {
                clearTimeout(timeoutRefs.current.get(id)!);
                timeoutRefs.current.delete(id);
            }

            // Process queue after removal
            setTimeout(processQueue, 100);
        }, [processQueue]);

        // Core toast creation method
        const showToast = useCallback((
            message: string,
            variant: ToastVariant = 'info',
            options: CreateToastOptions = {}
        ): string => {
            // Check for duplicates
            if (options.deduplicate !== false && isDuplicate(message, variant)) {
                return '';
            }

            const id = generateId();
            const duration = options.duration ?? config.defaultDuration ?? 5000;

            const newToast: Toast = {
                id,
                title: options.title,
                message,
                variant,
                duration: options.persistent ? undefined : duration,
                persistent: options.persistent || false,
                actions: options.actions || [],
                timestamp: Date.now(),
                position: options.position || config.position,
                showProgress: options.showProgress ?? true,
                metadata: options.metadata || {}
            };

            // Add to queue if at max capacity
            if (config.enableQueue && toasts.length >= (config.maxToasts || 5)) {
                toastQueue.current.push(newToast);
            } else {
                setToasts(prev => [...prev, newToast]);
            }

            // Schedule auto-removal if not persistent
            if (!options.persistent) {
                scheduleRemoval(id, duration);
            }

            return id;
        }, [toasts.length, config, isDuplicate, generateId, scheduleRemoval]);

        // Remove all toasts
        const removeAllToasts = useCallback(() => {
            setToasts([]);
            toastQueue.current = [];
            timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
            timeoutRefs.current.clear();
        }, []);

        // Convenience methods for different variants
        const success = useCallback((message: string, options?: CreateToastOptions) => {
            return showToast(message, 'success', options);
        }, [showToast]);

        const error = useCallback((message: string, options?: CreateToastOptions) => {
            return showToast(message, 'error', options);
        }, [showToast]);

        const warning = useCallback((message: string, options?: CreateToastOptions) => {
            return showToast(message, 'warning', options);
        }, [showToast]);

        const info = useCallback((message: string, options?: CreateToastOptions) => {
            return showToast(message, 'info', options);
        }, [showToast]);

        // Advanced methods
        const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
            setToasts(prev => prev.map(toast =>
                toast.id === id ? { ...toast, ...updates } : toast
            ));
        }, []);

        const pauseToast = useCallback((id: string) => {
            if (timeoutRefs.current.has(id)) {
                clearTimeout(timeoutRefs.current.get(id)!);
                timeoutRefs.current.delete(id);
            }
        }, []);

        const resumeToast = useCallback((id: string) => {
            const toast = toasts.find(t => t.id === id);
            if (toast && !toast.persistent && toast.duration) {
                scheduleRemoval(id, toast.duration);
            }
        }, [toasts, scheduleRemoval]);

        const updateConfig = useCallback((newConfig: Partial<ToastConfig>) => {
            setConfig(prev => ({ ...prev, ...newConfig }));
        }, []);

        // Utility methods
        const getToastById = useCallback((id: string) => {
            return toasts.find(toast => toast.id === id);
        }, [toasts]);

        const getToastsByVariant = useCallback((variant: ToastVariant) => {
            return toasts.filter(toast => toast.variant === variant);
        }, [toasts]);

        const hasToasts = useCallback(() => {
            return toasts.length > 0;
        }, [toasts.length]);

        // Memoized context value to prevent unnecessary re-renders
        const contextValue = React.useMemo(() => ({
            toasts,
            config,
            showToast,
            removeToast,
            removeAllToasts,
            success,
            error,
            warning,
            info,
            updateToast,
            pauseToast,
            resumeToast,
            updateConfig,
            getToastById,
            getToastsByVariant,
            hasToasts
        }), [
            toasts,
            config,
            showToast,
            removeToast,
            removeAllToasts,
            success,
            error,
            warning,
            info,
            updateToast,
            pauseToast,
            resumeToast,
            updateConfig,
            getToastById,
            getToastsByVariant,
            hasToasts
        ]);

        // Convert our Toast interface to the Toast component props
        const toastProps = toasts.map(toast => ({
            ...toast,
            onDismiss: removeToast
        }));

        return (
            <ToastContext.Provider value={contextValue}>
                {children}
                <ToastContainer
                    toasts={toastProps}
                    position={config.position}
                    maxToasts={config.maxToasts}
                />
            </ToastContext.Provider>
        );
    };