# Admin User Guide - Pharma Contact Intelligence

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Admin Dashboard](#admin-dashboard)
4. [User Management](#user-management)
5. [Contact Database Management](#contact-database-management)
6. [Navigation & Layout](#navigation--layout)
7. [Security & Permissions](#security--permissions)
8. [Best Practices](#best-practices)

## Overview

The Pharma Contact Intelligence admin panel provides comprehensive tools for managing users, contacts, and system settings. As an admin user, you have full access to all system features and can perform administrative tasks across the platform.

### Key Features
- **User Management**: Create, edit, delete, and manage user accounts
- **Contact Database**: Manage pharmaceutical industry contacts with full CRUD operations
- **Role-Based Access Control**: Assign and manage user roles and permissions
- **Bulk Operations**: Import/export contacts and perform bulk actions
- **Real-time Monitoring**: Track system usage and user activities
- **Security Management**: Control access and monitor authentication

## Getting Started

### Accessing the Admin Panel

1. **Login**: Use your admin credentials to log into the system
2. **Navigation**: After login, you'll be redirected to the admin dashboard
3. **URL Structure**: Admin pages are accessible at `/admin/*` routes

### Admin Credentials
- Admin users have the role `admin` in the system
- Only users with admin role can access admin-specific features
- Admin access is protected by role-based authentication

## Admin Dashboard

The admin dashboard serves as the central hub for all administrative activities.

### Dashboard Components

#### User Management Card
- **Purpose**: Quick access to user management features
- **Displays**: Total number of active users
- **Action**: Click to navigate to User Management page
- **Location**: `/admin/users`

#### Contact Database Card
- **Purpose**: Overview of contact database
- **Displays**: Total number of contacts in the system
- **Action**: Click to navigate to Contact Management page
- **Location**: `/admin/contacts`

#### Quick Actions
- View system statistics
- Access recent activities
- Navigate to key management areas

## User Management

### Overview
The User Management section allows you to control all user accounts in the system.

### Features Available

#### User Creation
- **Access**: Click "Add User" button or Plus icon
- **Required Fields**:
  - Name
  - Email address
  - Password
  - Phone number
  - Company
  - Country
  - Role (admin/user)
  - Credits allocation
  - Status (active/inactive)

#### User Editing
- **Access**: Click edit icon (pencil) next to any user
- **Editable Fields**: All user information except ID
- **Real-time Updates**: Changes are saved immediately

#### User Status Management
- **Active/Inactive Toggle**: Control user access to the system
- **Bulk Operations**: Select multiple users for status changes
- **Immediate Effect**: Status changes take effect immediately

#### Role Management
- **Available Roles**:
  - `admin`: Full system access
  - `user`: Standard user access
- **Role Changes**: Can be updated through user edit form
- **Permission Impact**: Role changes affect access immediately

#### User Deletion
- **Soft Delete**: Users are typically deactivated rather than permanently deleted
- **Confirmation Required**: Deletion requires confirmation dialog
- **Data Preservation**: User data may be retained for audit purposes

### User List Features

#### Search and Filtering
- **Search**: Real-time search across user fields
- **Filters**: Filter by role, status, country, company
- **Sorting**: Sort by any column (name, email, role, status, created date)

#### Pagination
- **Page Size**: Configurable number of users per page
- **Navigation**: Previous/Next page controls
- **Total Count**: Display total number of users

#### Export Functionality
- **CSV Export**: Download user list as CSV file
- **Filtered Export**: Export respects current filters
- **Data Fields**: Includes all relevant user information

## Contact Database Management

### Overview
Manage the pharmaceutical industry contact database with comprehensive tools for data management.

### Core Features

#### Contact Creation
- **Manual Entry**: Add individual contacts through form
- **Required Fields**:
  - Company Name
  - Person Name
  - Department
  - Designation
  - Company Type
  - Email
  - Person Country
  - Company Country
  - Company LinkedIn URL
  - Company Website
  - Status (Active/Inactive)

#### Contact Editing
- **Inline Editing**: Edit contacts directly from the list
- **Form-based Editing**: Detailed edit form for complex changes
- **Field Validation**: Ensure data integrity with validation rules

#### Bulk Import
- **CSV Upload**: Import multiple contacts from CSV files
- **Template Download**: Download CSV template for proper formatting
- **Validation**: System validates imported data before processing
- **Error Reporting**: Detailed feedback on import issues

#### Contact Export
- **Full Export**: Export entire contact database
- **Filtered Export**: Export based on current search/filter criteria
- **Format Options**: CSV format for easy data manipulation

### Search and Filtering

#### Advanced Search
- **Company Name**: Search by company name
- **Designation**: Filter by job titles/designations
- **Country**: Filter by person or company country
- **City**: Location-based filtering

#### Filter Controls
- **Show/Hide Filters**: Toggle filter panel visibility
- **Clear Filters**: Reset all filters to default
- **Real-time Results**: Filters apply immediately

#### Status Management
- **Active/Inactive**: Control contact visibility
- **Bulk Status Updates**: Change status for multiple contacts
- **Status Indicators**: Visual indicators for contact status

## Navigation & Layout

### Admin Layout Structure

#### Header
- **Logo/Brand**: Application branding
- **User Profile**: Current admin user information
- **Logout**: Secure logout functionality

#### Sidebar Navigation
- **Dashboard**: Main admin dashboard
- **User Management**: User administration tools
- **Contact Database**: Contact management interface
- **Credit Management**: User credit allocation (if implemented)
- **Bulk Upload**: Mass data import tools (if implemented)
- **Settings**: System configuration (if implemented)

#### Main Content Area
- **Page Content**: Dynamic content based on selected navigation
- **Breadcrumbs**: Navigation path indicators
- **Action Buttons**: Context-specific action controls

### Responsive Design
- **Mobile Friendly**: Optimized for mobile and tablet devices
- **Adaptive Layout**: Layout adjusts to screen size
- **Touch Friendly**: Mobile-optimized controls and interactions

## Security & Permissions

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic session handling
- **Token Refresh**: Automatic token renewal when possible

### Role-Based Access Control
- **Admin Role**: Full system access
- **User Role**: Limited to user-specific features
- **Route Protection**: Admin routes protected by role verification

### Security Features
- **Password Encoding**: Secure password handling
- **Token Validation**: Automatic token expiration checking
- **Secure Logout**: Complete session cleanup on logout

## Best Practices

### User Management
1. **Regular Audits**: Periodically review user accounts and permissions
2. **Status Management**: Deactivate unused accounts rather than deleting
3. **Role Assignment**: Assign minimum necessary permissions
4. **Credit Monitoring**: Monitor and manage user credit allocations

### Contact Management
1. **Data Quality**: Maintain high-quality contact information
2. **Regular Updates**: Keep contact information current
3. **Bulk Operations**: Use bulk import for large datasets
4. **Backup**: Regular export of contact data for backup purposes

### Security
1. **Strong Passwords**: Enforce strong password policies
2. **Regular Logout**: Log out when not actively using the system
3. **Access Monitoring**: Monitor user access patterns
4. **Role Reviews**: Regularly review and update user roles

### System Maintenance
1. **Regular Monitoring**: Check system performance and usage
2. **Data Cleanup**: Periodically clean up inactive or duplicate data
3. **User Training**: Ensure users understand their permissions and responsibilities
4. **Documentation**: Keep documentation updated with system changes
