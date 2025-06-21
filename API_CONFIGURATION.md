# API Configuration Guide

This document explains how to configure and manage API settings in the Pharma Contact Intelligence application.

## Overview

The application now uses a centralized API configuration system that is completely separate from Vite environment variables. This allows for easier management and deployment across different environments.

## Configuration Files

### 1. Main Configuration (`src/config/api.config.ts`)

This is the primary configuration file that contains:

- **Base URL**: The main API endpoint
- **Timeout settings**: Request timeout values
- **Default headers**: Common headers for all requests
- **Authentication settings**: Token management configuration
- **Endpoint definitions**: All API endpoint paths

### 2. API Client (`src/api/config.ts`)

This file creates the Axios instance using the configuration from `api.config.ts` and includes:

- Request/response interceptors
- Error handling
- Authentication token management

### 3. Utility Functions (`src/api/utils.ts`)

Helper functions for:

- Building API URLs
- Handling responses
- Managing authentication tokens
- Creating form data for uploads

## How to Change API Base URL

### Method 1: Edit Configuration File (Recommended)

1. Open `src/config/api.config.ts`
2. Update the `BASE_URL` in the `API_CONFIG` object:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-new-api-url.com', // Change this
  // ... other settings
};
```

3. For environment-specific URLs, update the `ENVIRONMENT_CONFIG`:

```typescript
export const ENVIRONMENT_CONFIG = {
  development: {
    ...API_CONFIG,
    BASE_URL: 'https://dev-api.yourapp.com',
  },
  staging: {
    ...API_CONFIG,
    BASE_URL: 'https://staging-api.yourapp.com',
  },
  production: {
    ...API_CONFIG,
    BASE_URL: 'https://api.yourapp.com',
  }
};
```

### Method 2: Using the API Configuration Manager (Admin UI)

1. Navigate to the admin panel
2. Add the `ApiConfigManager` component to any admin page
3. Use the UI to update the API base URL
4. Changes are saved to localStorage and take effect immediately

```tsx
import ApiConfigManager from '../components/ApiConfigManager';

// In your admin component
<ApiConfigManager onConfigUpdate={(config) => {
  console.log('API config updated:', config);
}} />
```

### Method 3: Runtime Configuration

You can also override the configuration at runtime:

```typescript
import { CURRENT_API_CONFIG } from '../config/api.config';

// Override for current session
CURRENT_API_CONFIG.BASE_URL = 'https://new-api-url.com';
```

## Environment Detection

The system automatically detects the environment based on the hostname:

- `localhost` or `127.0.0.1` → Development
- Hostnames containing `staging` → Staging  
- All other hostnames → Production

You can customize this logic in the `getCurrentEnvironment()` function in `api.config.ts`.

## Available Endpoints

All API endpoints are centrally defined in the configuration:

### Authentication
- `LOGIN`: `/api/login`
- `LOGOUT`: `/api/logout`
- `REFRESH`: `/api/refresh`
- `PROFILE`: `/api/profile`

### User Management
- `BASE`: `/api/users`
- `CREATE`: `/api/users`
- `UPDATE`: `/api/users/{id}`
- `DELETE`: `/api/users/{id}`
- `STATUS`: `/api/users/{id}/status`
- `ROLE`: `/api/users/{id}/role`

### Contact Management
- `BASE`: `/api/contacts`
- `CREATE`: `/api/contacts`
- `UPDATE`: `/api/contacts/{id}`
- `DELETE`: `/api/contacts/{id}`
- `REVEAL`: `/api/contacts/{id}/reveal`
- `STATUS`: `/api/contacts/{id}/status`
- `BULK_IMPORT`: `/api/contacts/bulk-import`
- `EXPORT`: `/api/contacts/export`

## Usage Examples

### Making API Calls

```typescript
import { getAuthUrl, getUserUrl, getContactUrl } from '../api/utils';
import api from '../api/config';

// Authentication
const loginResponse = await api.post(getAuthUrl('LOGIN'), credentials);

// User management
const users = await api.get(getUserUrl('BASE'));
const user = await api.put(getUserUrl('UPDATE', userId), userData);

// Contact management
const contacts = await api.get(getContactUrl('BASE'));
const contact = await api.post(getContactUrl('CREATE'), contactData);
```

### Building URLs with Parameters

```typescript
import { buildUrlWithParams } from '../api/utils';

const url = buildUrlWithParams('/api/contacts', {
  page: 1,
  per_page: 10,
  search: 'company name'
});
// Result: /api/contacts?page=1&per_page=10&search=company+name
```

## Configuration Options

### Timeout Settings
- **Development**: 30 seconds
- **Staging**: 25 seconds  
- **Production**: 20 seconds

### Default Headers
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `ngrok-skip-browser-warning`: `true` (for development)

### Authentication
- **Token Key**: `token` (localStorage key)
- **Token Prefix**: `Bearer`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the API server allows requests from your domain
2. **401 Unauthorized**: Check if the authentication token is valid
3. **Network Errors**: Verify the API base URL is correct and accessible
4. **Timeout Errors**: Increase the timeout value in the configuration

### Testing API Connection

Use the API Configuration Manager component to test the connection, or manually test:

```typescript
const testConnection = async () => {
  try {
    const response = await fetch(`${CURRENT_API_CONFIG.BASE_URL}/api/health`);
    console.log('Connection test:', response.ok ? 'Success' : 'Failed');
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};
```

## Migration from Vite Environment Variables

If you were previously using `VITE_API_URL`, you can now remove it from your `.env` files. The new system doesn't depend on Vite environment variables.

## Best Practices

1. **Environment-specific URLs**: Use the `ENVIRONMENT_CONFIG` for different environments
2. **Error Handling**: All API functions include proper error handling
3. **Type Safety**: Use TypeScript interfaces for all API responses
4. **Centralized Configuration**: Keep all API-related settings in the configuration files
5. **Testing**: Always test API changes in development before deploying

## Security Considerations

- Never commit sensitive API keys or tokens to version control
- Use HTTPS URLs in production
- Implement proper authentication token refresh logic
- Validate all API responses before using the data
