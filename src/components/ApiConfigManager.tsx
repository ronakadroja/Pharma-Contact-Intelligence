/**
 * API Configuration Manager Component
 * 
 * This component allows administrators to view and update API configuration
 * without needing to modify code or restart the application.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input } from './ui/design-system';
import { Settings, Save, RotateCcw, ExternalLink } from 'lucide-react';
import { CURRENT_API_CONFIG } from '../config/api.config';

interface ApiConfigManagerProps {
  onConfigUpdate?: (newConfig: any) => void;
}

const ApiConfigManager: React.FC<ApiConfigManagerProps> = ({ onConfigUpdate }) => {
  const [config, setConfig] = useState({
    baseUrl: CURRENT_API_CONFIG.BASE_URL,
    timeout: CURRENT_API_CONFIG.TIMEOUT,
    environment: 'development' // You can make this dynamic
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you could implement logic to update the configuration
      // For now, we'll just update the local state and call the callback
      
      // You could save to localStorage, send to a backend, etc.
      localStorage.setItem('api_config_override', JSON.stringify(config));
      
      if (onConfigUpdate) {
        onConfigUpdate(config);
      }
      
      setIsEditing(false);
      
      // Show success message (you could use your toast system here)
      console.log('API configuration updated successfully');
      
    } catch (error) {
      console.error('Failed to update API configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      baseUrl: CURRENT_API_CONFIG.BASE_URL,
      timeout: CURRENT_API_CONFIG.TIMEOUT,
      environment: 'development'
    });
    localStorage.removeItem('api_config_override');
    setIsEditing(false);
  };

  const handleTestConnection = async () => {
    try {
      // Test the API connection
      const response = await fetch(`${config.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        console.log('API connection successful');
      } else {
        console.warn('API connection failed:', response.status);
      }
    } catch (error) {
      console.error('API connection test failed:', error);
    }
  };

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('api_config_override');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Failed to parse saved API configuration:', error);
      }
    }
  }, []);

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">API Configuration</h3>
          <p className="text-sm text-neutral-500">Manage API connection settings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="API Base URL"
            value={config.baseUrl}
            onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
            disabled={!isEditing}
            placeholder="https://api.example.com"
            leftIcon={<ExternalLink size={18} />}
          />
          
          <Input
            label="Request Timeout (ms)"
            type="number"
            value={config.timeout.toString()}
            onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
            disabled={!isEditing}
            placeholder="30000"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Environment</label>
            <select
              value={config.environment}
              onChange={(e) => setConfig(prev => ({ ...prev, environment: e.target.value }))}
              disabled={!isEditing}
              className="w-full text-sm px-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200 disabled:bg-neutral-50 disabled:text-neutral-500"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Current Status</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 rounded-xl">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-sm text-neutral-700">Connected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
            >
              Test Connection
            </Button>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                  icon={<RotateCcw size={16} />}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  loading={isSaving}
                  icon={<Save size={16} />}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<Settings size={16} />}
              >
                Edit Configuration
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ApiConfigManager;
