/**
 * API Configuration
 * 
 * This file contains all API-related configuration settings.
 * Update the BASE_URL and other settings here as needed.
 */

// API Configuration Object
export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: 'https://3148-152-58-35-171.ngrok-free.app',
  
  // API Version (if your API uses versioning)
  VERSION: 'v1',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000, // 30 seconds
  
  // Default headers for all requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  
  // Authentication settings
  AUTH: {
    TOKEN_KEY: 'token', // localStorage key for auth token
    TOKEN_PREFIX: 'Bearer', // Token prefix for Authorization header
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      LOGIN: '/api/login',
      LOGOUT: '/api/logout',
      REFRESH: '/api/refresh',
      PROFILE: '/api/profile'
    },
    
    // User management endpoints
    USERS: {
      BASE: '/api/users',
      CREATE: '/api/users',
      UPDATE: (id: string) => `/api/users/${id}`,
      DELETE: (id: string) => `/api/users/${id}`,
      STATUS: (id: string) => `/api/users/${id}/status`,
      ROLE: (id: string) => `/api/users/${id}/role`
    },
    
    // Contact management endpoints
    CONTACTS: {
      BASE: '/api/contacts',
      CREATE: '/api/contacts',
      UPDATE: (id: string) => `/api/contacts/${id}`,
      DELETE: (id: string) => `/api/contacts/${id}`,
      REVEAL: (id: string) => `/api/contacts/${id}/reveal`,
      STATUS: (id: string) => `/api/contacts/${id}/status`,
      BULK_IMPORT: '/api/contacts/bulk-import',
      EXPORT: '/api/contacts/export'
    }
  }
};

// Environment-specific configurations
export const ENVIRONMENT_CONFIG = {
  development: {
    ...API_CONFIG,
    BASE_URL: 'https://3148-152-58-35-171.ngrok-free.app', // Development API URL
    TIMEOUT: 30000,
  },
  
  staging: {
    ...API_CONFIG,
    BASE_URL: 'https://staging-api.yourapp.com', // Staging API URL
    TIMEOUT: 25000,
  },
  
  production: {
    ...API_CONFIG,
    BASE_URL: 'https://api.yourapp.com', // Production API URL
    TIMEOUT: 20000,
  }
};

// Get current environment (you can change this logic as needed)
const getCurrentEnvironment = (): keyof typeof ENVIRONMENT_CONFIG => {
  // You can implement your own logic here
  // For example, check window.location.hostname or a custom environment variable
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging')) {
      return 'staging';
    } else {
      return 'production';
    }
  }
  
  return 'development'; // Default fallback
};

// Export the current environment configuration
export const CURRENT_API_CONFIG = ENVIRONMENT_CONFIG[getCurrentEnvironment()];

// Helper functions for building URLs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = CURRENT_API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to get full endpoint URL
export const getEndpointUrl = (endpointPath: string): string => {
  return buildApiUrl(endpointPath);
};

// Export individual config parts for convenience
export const { BASE_URL, TIMEOUT, DEFAULT_HEADERS, AUTH, ENDPOINTS } = CURRENT_API_CONFIG;
