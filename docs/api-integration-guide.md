# API Integration Guide - Admin Documentation

## Table of Contents
1. [Overview](#overview)
2. [API Configuration](#api-configuration)
3. [Authentication Endpoints](#authentication-endpoints)
4. [User Management Endpoints](#user-management-endpoints)
5. [Contact Management Endpoints](#contact-management-endpoints)
6. [Request/Response Format](#requestresponse-format)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [API Testing](#api-testing)
10. [Integration Examples](#integration-examples)

## Overview

The Pharma Contact Intelligence platform provides a comprehensive REST API for all administrative and user operations. This guide covers API endpoints, authentication, request formats, and integration patterns for admin users.

### API Architecture
- **RESTful Design**: Standard REST API principles
- **JSON Format**: All requests and responses in JSON format
- **Token Authentication**: JWT-based authentication system
- **Centralized Configuration**: Configurable API endpoints and settings
- **Error Handling**: Standardized error responses

### Base Configuration
- **Base URL**: Configurable in `src/config/api.config.ts`
- **Current Default**: `https://3148-152-58-35-171.ngrok-free.app`
- **API Version**: v1 (configurable)
- **Timeout**: 30 seconds (configurable)
- **Headers**: Standard JSON headers with ngrok bypass

## API Configuration

### Configuration Files

#### Main Configuration (`src/config/api.config.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://3148-152-58-35-171.ngrok-free.app',
  VERSION: 'v1',
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  AUTH: {
    TOKEN_KEY: 'token',
    TOKEN_PREFIX: 'Bearer'
  }
}
```

#### Environment-Specific Configuration
- **Development**: Local development settings
- **Staging**: Staging environment configuration
- **Production**: Production environment settings
- **Auto-Detection**: Environment detected by hostname

### Changing API Configuration

#### Method 1: Configuration File
1. Edit `src/config/api.config.ts`
2. Update `BASE_URL` in `API_CONFIG`
3. Restart application for changes to take effect

#### Method 2: Runtime Configuration
```typescript
import { CURRENT_API_CONFIG } from '../config/api.config';
CURRENT_API_CONFIG.BASE_URL = 'https://new-api-url.com';
```

#### Method 3: Environment Detection
- System automatically selects configuration based on hostname
- Customizable environment detection logic
- Override available for specific deployments

## Authentication Endpoints

### Login
**Endpoint**: `POST /api/login`

**Purpose**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "username": "admin@example.com",
  "password": "securepassword"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "admin@example.com",
    "role": "admin",
    "credits": "100",
    "name": "Admin User"
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Logout
**Endpoint**: `POST /api/logout`

**Purpose**: Invalidate user session and token

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Profile
**Endpoint**: `GET /api/profile`

**Purpose**: Get current user profile information

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "credits": 100,
    "status": "active"
  }
}
```

## User Management Endpoints

### Get Users
**Endpoint**: `GET /api/users`

**Purpose**: Retrieve list of all users (admin only)

**Query Parameters**:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `search`: Search term
- `role`: Filter by role (admin/user)
- `status`: Filter by status (active/inactive)

**Example Request**:
```
GET /api/users?page=1&per_page=10&role=user&status=active
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "credits": 50,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

### Create User
**Endpoint**: `POST /api/users`

**Purpose**: Create new user account (admin only)

**Request Body**:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword",
  "phone_number": "+1-555-123-4567",
  "company": "Example Corp",
  "country": "United States",
  "role": "user",
  "credits": "50",
  "status": "active"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user"
  }
}
```

### Update User
**Endpoint**: `PUT /api/users/{id}`

**Purpose**: Update existing user account (admin only)

**Request Body** (partial update supported):
```json
{
  "name": "Updated Name",
  "credits": "75",
  "status": "inactive"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Updated Name",
    "email": "user@example.com",
    "credits": 75,
    "status": "inactive"
  }
}
```

### Delete User
**Endpoint**: `DELETE /api/users/{id}`

**Purpose**: Delete user account (admin only)

**Success Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Update User Status
**Endpoint**: `PUT /api/users/{id}/status`

**Purpose**: Update user status only

**Request Body**:
```json
{
  "status": "inactive"
}
```

### Update User Role
**Endpoint**: `PUT /api/users/{id}/role`

**Purpose**: Update user role only

**Request Body**:
```json
{
  "role": "admin"
}
```

## Contact Management Endpoints

### Get Contacts
**Endpoint**: `GET /api/contacts`

**Purpose**: Retrieve contact list with filtering

**Query Parameters**:
- `page`: Page number
- `per_page`: Items per page
- `company_name`: Filter by company name
- `designation`: Filter by designation
- `person_country`: Filter by person country
- `city`: Filter by city

**Example Request**:
```
GET /api/contacts?page=1&per_page=10&company_name=Pfizer&designation=Director
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "company_name": "Pfizer Inc.",
      "person_name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@pfizer.com",
      "department": "Research & Development",
      "designation": "Senior Research Director",
      "person_country": "United States",
      "company_country": "United States",
      "company_linkedin_url": "https://linkedin.com/company/pfizer",
      "company_website": "https://www.pfizer.com",
      "status": "active"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 1234,
    "total_pages": 124
  }
}
```

### Create Contact
**Endpoint**: `POST /api/contacts`

**Purpose**: Create new contact (admin only)

**Request Body**:
```json
{
  "company_name": "New Pharma Corp",
  "person_name": "Dr. Jane Smith",
  "email": "jane.smith@newpharma.com",
  "department": "Clinical Research",
  "designation": "Clinical Research Manager",
  "company_type": "Pharmaceutical Manufacturer",
  "person_country": "Canada",
  "company_country": "Canada",
  "company_linkedin_url": "https://linkedin.com/company/newpharma",
  "company_website": "https://www.newpharma.com",
  "status": "active"
}
```

### Update Contact
**Endpoint**: `PUT /api/contacts/{id}`

**Purpose**: Update existing contact (admin only)

### Delete Contact
**Endpoint**: `DELETE /api/contacts/{id}`

**Purpose**: Delete contact (admin only)

### Reveal Contact
**Endpoint**: `POST /api/contacts/{id}/reveal`

**Purpose**: Reveal contact details (user action, costs credits)

### Bulk Import Contacts
**Endpoint**: `POST /api/contacts/bulk/import`

**Purpose**: Import multiple contacts from CSV (admin only)

**Request**: Multipart form data with CSV file

### Export Contacts
**Endpoint**: `GET /api/contacts/export`

**Purpose**: Export contacts as CSV (admin only)

**Query Parameters**: Same as Get Contacts for filtering

## Request/Response Format

### Request Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {jwt_token}
ngrok-skip-browser-warning: true
```

### Standard Response Format
```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "pagination": {
    "current_page": number,
    "per_page": number,
    "total": number,
    "total_pages": number
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error

### Common Error Scenarios

#### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### Validation Errors (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email must be valid"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

#### Permission Errors (403)
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

## Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response (429)
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retry_after": 60
}
```

## API Testing

### Testing Tools
- **Postman**: API testing and documentation
- **curl**: Command-line testing
- **Browser DevTools**: Network tab for debugging
- **API Configuration Manager**: Built-in testing component

### Test Authentication
```bash
curl -X POST https://api.example.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"password"}'
```

### Test Protected Endpoint
```bash
curl -X GET https://api.example.com/api/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

## Integration Examples

### JavaScript/TypeScript Integration
```typescript
import api from '../api/config';
import { getUserUrl } from '../api/utils';

// Get users
const users = await api.get(getUserUrl('BASE'));

// Create user
const newUser = await api.post(getUserUrl('CREATE'), userData);

// Update user
const updatedUser = await api.put(getUserUrl('UPDATE', userId), updateData);
```

### Error Handling Example
```typescript
try {
  const response = await api.post('/api/users', userData);
  console.log('User created:', response.data);
} catch (error) {
  if (error.response?.status === 422) {
    console.log('Validation errors:', error.response.data.errors);
  } else {
    console.log('Error:', error.message);
  }
}
```

### Pagination Example
```typescript
const fetchUsers = async (page = 1) => {
  const response = await api.get(`/api/users?page=${page}&per_page=10`);
  return {
    users: response.data.data,
    pagination: response.data.pagination
  };
};
```
