/**
 * Toast Demo Component
 * 
 * Demonstrates all features of the professional toast system
 * including different variants, actions, persistence, and configurations.
 */

import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Button, Card, Input } from './ui/design-system';
import type { ToastPosition } from '../types/toast';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const ToastDemo: React.FC = () => {
  const {
    success,
    error,
    warning,
    info,
    showToast,
    removeAllToasts,
    updateConfig,
    config,
    toasts,
    hasToasts
  } = useToast();

  const [customMessage, setCustomMessage] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // Demo toast examples
  const showSuccessToast = () => {
    success('User created successfully!', {
      title: 'Success',
      actions: [
        {
          label: 'View User',
          onClick: () => console.log('Navigate to user'),
          variant: 'primary'
        }
      ]
    });
  };

  const showErrorToast = () => {
    error('Failed to save changes. Please try again.', {
      title: 'Error',
      persistent: true,
      actions: [
        {
          label: 'Retry',
          onClick: () => console.log('Retry action'),
          variant: 'primary'
        },
        {
          label: 'Report Issue',
          onClick: () => console.log('Report issue'),
          variant: 'secondary'
        }
      ]
    });
  };

  const showWarningToast = () => {
    warning('Your session will expire in 5 minutes.', {
      title: 'Session Warning',
      duration: 10000,
      actions: [
        {
          label: 'Extend Session',
          onClick: () => console.log('Extend session'),
          variant: 'primary'
        }
      ]
    });
  };

  const showInfoToast = () => {
    info('New features are available in the latest update.', {
      title: 'Update Available',
      actions: [
        {
          label: 'Learn More',
          onClick: () => console.log('Learn more'),
          variant: 'primary'
        }
      ]
    });
  };

  const showCustomToast = () => {
    if (!customMessage.trim()) return;

    showToast(customMessage, 'info', {
      title: customTitle.trim() || undefined,
      duration: 8000,
      showProgress: true
    });

    setCustomMessage('');
    setCustomTitle('');
  };

  const showProgressToast = () => {
    const id = info('Processing your request...', {
      title: 'Please Wait',
      persistent: true,
      showProgress: false
    });

    // Simulate progress updates
    setTimeout(() => {
      success('Request completed successfully!', {
        title: 'Complete'
      });
    }, 3000);
  };

  const showBatchToasts = () => {
    success('First notification');
    setTimeout(() => warning('Second notification'), 500);
    setTimeout(() => error('Third notification'), 1000);
    setTimeout(() => info('Fourth notification'), 1500);
    setTimeout(() => success('Fifth notification'), 2000);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Toast Notification Demo</h2>
            <p className="text-sm text-neutral-500">
              Professional toast system with advanced features
            </p>
          </div>
        </div>

        {/* Basic Toast Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">Basic Notifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={showSuccessToast}
              variant="success"
              icon={<CheckCircle size={16} />}
              className="justify-center"
            >
              Success
            </Button>
            <Button
              onClick={showErrorToast}
              variant="error"
              icon={<XCircle size={16} />}
              className="justify-center"
            >
              Error
            </Button>
            <Button
              onClick={showWarningToast}
              variant="warning"
              icon={<AlertTriangle size={16} />}
              className="justify-center"
            >
              Warning
            </Button>
            <Button
              onClick={showInfoToast}
              icon={<Info size={16} />}
              className="justify-center"
            >
              Info
            </Button>
          </div>
        </div>

        {/* Custom Toast */}
        <div className="space-y-4 pt-6 border-t border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Custom Toast</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (optional)"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter toast title"
            />
            <Input
              label="Message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter toast message"
            />
          </div>
          <Button
            onClick={showCustomToast}
            disabled={!customMessage.trim()}
            className="w-full md:w-auto"
          >
            Show Custom Toast
          </Button>
        </div>

        {/* Advanced Features */}
        <div className="space-y-4 pt-6 border-t border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Advanced Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={showProgressToast}
              variant="outline"
              icon={<RefreshCw size={16} />}
            >
              Progress Toast
            </Button>
            <Button
              onClick={showBatchToasts}
              variant="outline"
              icon={<ExternalLink size={16} />}
            >
              Batch Toasts
            </Button>
            <Button
              onClick={removeAllToasts}
              variant="outline"
              icon={<Trash2 size={16} />}
              disabled={!hasToasts()}
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4 pt-6 border-t border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Position
              </label>
              <select
                value={config.position}
                onChange={(e) => updateConfig({ position: e.target.value as any })}
                className="w-full text-sm px-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-center">Top Center</option>
                <option value="bottom-center">Bottom Center</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Max Toasts
              </label>
              <select
                value={config.maxToasts}
                onChange={(e) => updateConfig({ maxToasts: parseInt(e.target.value) })}
                className="w-full text-sm px-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
              >
                <option value="3">3 Toasts</option>
                <option value="5">5 Toasts</option>
                <option value="7">7 Toasts</option>
                <option value="10">10 Toasts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Active Toasts: {toasts.length}</span>
            <span>Max Toasts: {config.maxToasts}</span>
            <span>Position: {config.position}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ToastDemo;
