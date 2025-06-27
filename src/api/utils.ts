/**
 * API Utility Functions
 * 
 * This file contains utility functions for making API calls
 * using our centralized configuration.
 */

import { ENDPOINTS, getEndpointUrl } from '../config/api.config';

/**
 * Get the full URL for an authentication endpoint
 */
export const getAuthUrl = (endpoint: keyof typeof ENDPOINTS.AUTH): string => {
  return getEndpointUrl(ENDPOINTS.AUTH[endpoint]);
};

/**
 * Get the full URL for a user management endpoint
 */
export const getUserUrl = (action: keyof typeof ENDPOINTS.USERS, id?: string): string => {
  const endpoint = ENDPOINTS.USERS[action];
  if (typeof endpoint === 'function' && id) {
    return getEndpointUrl(endpoint(id));
  }
  return getEndpointUrl(endpoint as string);
};

/**
 * Get the full URL for a contact management endpoint
 */
export const getContactUrl = (action: keyof typeof ENDPOINTS.CONTACTS, id?: string): string => {
  const endpoint = ENDPOINTS.CONTACTS[action];
  if (typeof endpoint === 'function' && id) {
    return getEndpointUrl(endpoint(id));
  }
  return getEndpointUrl(endpoint as string);
};

/**
 * Get the full URL for a combo/dropdown endpoint
 */
export const getComboUrl = (action: keyof typeof ENDPOINTS.COMBO): string => {
  return getEndpointUrl(ENDPOINTS.COMBO[action]);
};

/**
 * Build query string from parameters object
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Build full URL with query parameters
 */
export const buildUrlWithParams = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = buildQueryString(params);
  return `${baseUrl}${queryString}`;
};

/**
 * Common API response interface
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

/**
 * Paginated API response interface
 */
export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Type guard to check if response is an error
 */
export const isApiError = (response: any): response is ApiError => {
  return response && typeof response.message === 'string' && !response.success;
};

/**
 * Handle API response and extract data
 */
export const handleApiResponse = <T>(response: any): T => {
  if (isApiError(response)) {
    throw new Error(response.message);
  }

  // If response has a data property, return it; otherwise return the response itself
  return response.data ?? response;
};

/**
 * Create form data for file uploads
 */
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
