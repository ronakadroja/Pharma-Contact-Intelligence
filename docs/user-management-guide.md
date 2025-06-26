# User Management Guide - Admin Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Creation](#user-creation)
3. [User Editing](#user-editing)
4. [User Status Management](#user-status-management)
5. [Role Management](#role-management)
6. [User Search and Filtering](#user-search-and-filtering)
7. [Bulk Operations](#bulk-operations)
8. [Data Export](#data-export)
9. [User Deletion](#user-deletion)
10. [Troubleshooting](#troubleshooting)

## Overview

The User Management system provides comprehensive tools for managing user accounts in the Pharma Contact Intelligence platform. Admins can create, edit, delete, and manage user permissions and access levels.

### Access Requirements
- **Role**: Admin role required
- **URL**: `/admin/users`
- **Permissions**: Full CRUD operations on user accounts

## User Creation

### Creating a New User

1. **Navigate** to User Management page (`/admin/users`)
2. **Click** the "Add User" button (Plus icon)
3. **Fill** the user creation form with required information
4. **Submit** the form to create the user

### Required Fields

#### Personal Information
- **Name**: Full name of the user
  - Format: Text input
  - Validation: Required, minimum 2 characters
  - Example: "John Smith"

- **Email**: User's email address
  - Format: Email input with validation
  - Validation: Required, valid email format, unique in system
  - Example: "john.smith@company.com"

- **Phone Number**: Contact phone number
  - Format: Text input
  - Validation: Required
  - Example: "+1-555-123-4567"

#### Company Information
- **Company**: User's company name
  - Format: Text input
  - Validation: Required
  - Example: "Pharma Corp Inc."

- **Country**: User's country location
  - Format: Text input or dropdown
  - Validation: Required
  - Example: "United States"

#### Account Settings
- **Password**: Initial password for the user
  - Format: Password input
  - Validation: Required, minimum security requirements
  - Security: Automatically encoded before storage

- **Role**: User's system role
  - Options: 
    - `admin`: Full administrative access
    - `user`: Standard user access
  - Default: `user`
  - Impact: Determines system permissions

- **Credits**: Initial credit allocation
  - Format: Numeric input
  - Default: 50 credits
  - Purpose: Controls user's contact reveal capacity

- **Status**: Account status
  - Options:
    - `active`: User can log in and use system
    - `inactive`: User account is disabled
  - Default: `active`

### Form Validation

#### Client-Side Validation
- Real-time field validation
- Format checking (email, phone)
- Required field indicators
- Error messages for invalid inputs

#### Server-Side Validation
- Duplicate email detection
- Data integrity checks
- Security validation
- Database constraint verification

### Success and Error Handling

#### Successful Creation
- Success toast notification
- User added to user list
- Form reset for next entry
- Automatic redirect to user list

#### Error Scenarios
- **Duplicate Email**: "Email already exists in system"
- **Validation Errors**: Field-specific error messages
- **Network Issues**: "Failed to create user. Please try again."
- **Server Errors**: Detailed error information from API

## User Editing

### Editing Existing Users

1. **Locate** the user in the user list
2. **Click** the edit icon (pencil) next to the user
3. **Modify** the desired fields in the edit form
4. **Save** changes to update the user

### Editable Fields
- All fields from user creation are editable
- Password field is optional (leave blank to keep current password)
- ID field is read-only and cannot be modified

### Edit Form Features
- **Pre-populated Fields**: Current user data loaded automatically
- **Selective Updates**: Only modified fields are updated
- **Validation**: Same validation rules as creation
- **Cancel Option**: Discard changes and return to list

## User Status Management

### Status Types

#### Active Status
- **Description**: User can log in and access system features
- **Permissions**: Full access based on user role
- **Indicator**: Green badge or checkmark
- **Default**: New users are active by default

#### Inactive Status
- **Description**: User account is disabled
- **Restrictions**: Cannot log in or access system
- **Use Cases**: Temporary suspension, employee departure
- **Indicator**: Red badge or X mark

### Changing User Status

#### Individual Status Change
1. **Navigate** to user in the list
2. **Click** the status toggle or edit user
3. **Select** new status (active/inactive)
4. **Confirm** the change
5. **Immediate Effect**: Status change takes effect immediately

#### Bulk Status Changes
1. **Select** multiple users using checkboxes
2. **Choose** bulk action from dropdown
3. **Select** "Change Status" option
4. **Choose** target status (active/inactive)
5. **Confirm** bulk operation

### Status Change Impact
- **Immediate**: Changes take effect immediately
- **Session Handling**: Active sessions may be terminated for deactivated users
- **Data Preservation**: User data is preserved regardless of status
- **Reversible**: Status changes can be reversed at any time

## Role Management

### Available Roles

#### Admin Role
- **Permissions**: Full system access
- **Capabilities**:
  - User management (create, edit, delete)
  - Contact management (full CRUD)
  - System settings access
  - Bulk operations
  - Data export/import
- **Access**: All admin routes (`/admin/*`)

#### User Role
- **Permissions**: Standard user access
- **Capabilities**:
  - Contact search and filtering
  - Contact reveal (credit-based)
  - Personal profile management
  - Saved contacts management
- **Access**: User routes (`/dashboard`, `/listing`, etc.)

### Role Assignment

#### During User Creation
- Select role from dropdown during user creation
- Default role is `user`
- Admin role should be assigned carefully

#### Changing User Roles
1. **Edit** the user account
2. **Select** new role from dropdown
3. **Save** changes
4. **Immediate Effect**: Role change takes effect on next login

### Role Change Considerations
- **Security**: Admin role grants full system access
- **Training**: Ensure users understand their new permissions
- **Monitoring**: Monitor role changes for security purposes
- **Documentation**: Document role changes for audit purposes

## User Search and Filtering

### Search Functionality

#### Global Search
- **Location**: Search box at top of user list
- **Scope**: Searches across multiple fields
- **Fields Searched**:
  - Name
  - Email
  - Company
  - Country
- **Real-time**: Results update as you type

#### Advanced Filtering
- **Role Filter**: Filter by admin/user role
- **Status Filter**: Filter by active/inactive status
- **Country Filter**: Filter by user country
- **Company Filter**: Filter by company name

### Filter Controls

#### Show/Hide Filters
- **Toggle Button**: "Show Filter" / "Hide Filter"
- **Full Screen**: Hide filters for more table space
- **Persistent**: Filter state maintained during session

#### Clear Filters
- **Reset Button**: Clear all active filters
- **Return to Default**: Show all users
- **Quick Access**: Easily reset search state

### Sorting Options
- **Sortable Columns**: Name, Email, Role, Status, Created Date
- **Sort Direction**: Ascending/Descending
- **Visual Indicators**: Arrow icons show sort direction
- **Multiple Sorts**: Primary and secondary sort options

## Bulk Operations

### Selection Methods

#### Individual Selection
- **Checkboxes**: Select specific users
- **Visual Feedback**: Selected rows highlighted
- **Count Display**: Number of selected users shown

#### Select All
- **Header Checkbox**: Select/deselect all visible users
- **Page-based**: Selects users on current page only
- **Clear Selection**: Easy deselection option

### Available Bulk Actions

#### Status Changes
- **Bulk Activate**: Set multiple users to active status
- **Bulk Deactivate**: Set multiple users to inactive status
- **Confirmation**: Requires confirmation before execution

#### Role Changes
- **Bulk Role Assignment**: Change role for multiple users
- **Security Warning**: Special confirmation for admin role assignment
- **Audit Trail**: Log bulk role changes

#### Export Selected
- **Filtered Export**: Export only selected users
- **CSV Format**: Standard CSV format for easy import elsewhere
- **All Fields**: Includes all user information

### Bulk Operation Safety
- **Confirmation Dialogs**: Prevent accidental bulk changes
- **Undo Information**: Clear instructions on reversing changes
- **Error Handling**: Detailed feedback on partial failures
- **Audit Logging**: Track all bulk operations for security

## Data Export

### Export Options

#### Full Export
- **All Users**: Export complete user database
- **CSV Format**: Standard comma-separated values
- **All Fields**: Includes all user information
- **File Naming**: Automatic timestamp in filename

#### Filtered Export
- **Current View**: Export users matching current filters
- **Search Results**: Export based on search criteria
- **Selected Users**: Export only selected users
- **Maintains Filters**: Respects all active filters

### Export Process
1. **Apply Filters** (if desired)
2. **Select Users** (if partial export)
3. **Click Export** button
4. **Download File** automatically starts
5. **File Location**: Downloads to default browser location

### Export File Details
- **Format**: CSV (Comma-Separated Values)
- **Encoding**: UTF-8 for international character support
- **Headers**: Column names included in first row
- **Filename**: `users_export_YYYY-MM-DD_HH-MM-SS.csv`

## User Deletion

### Deletion Policy
- **Soft Delete**: Users are typically deactivated rather than permanently deleted
- **Data Preservation**: User data retained for audit and compliance
- **Reversible**: Deactivated users can be reactivated

### Deletion Process
1. **Locate User**: Find user in the list
2. **Click Delete**: Click trash icon next to user
3. **Confirmation**: Confirm deletion in dialog box
4. **Immediate Effect**: User is removed from active list

### Deletion Considerations
- **Data Dependencies**: Check for user-related data before deletion
- **Audit Requirements**: Consider audit and compliance needs
- **Alternative**: Consider deactivation instead of deletion
- **Irreversible**: True deletion cannot be undone

## Troubleshooting

### Common Issues

#### User Creation Fails
- **Check Email**: Ensure email is unique and valid format
- **Verify Fields**: All required fields must be completed
- **Network Issues**: Check internet connection
- **Server Errors**: Contact system administrator

#### Cannot Edit User
- **Permissions**: Verify admin role and permissions
- **User Status**: Check if user account is locked
- **Browser Issues**: Try refreshing page or different browser
- **Session Timeout**: Re-login if session expired

#### Search Not Working
- **Clear Filters**: Reset all filters and try again
- **Check Spelling**: Verify search terms are correct
- **Browser Cache**: Clear browser cache and reload
- **Data Sync**: Allow time for data synchronization

#### Export Issues
- **File Download**: Check browser download settings
- **File Size**: Large exports may take time to process
- **Format Issues**: Ensure CSV reader supports UTF-8 encoding
- **Permissions**: Verify file download permissions

### Getting Help
- **Documentation**: Refer to this guide and API documentation
- **System Administrator**: Contact your system administrator
- **Error Messages**: Note exact error messages for troubleshooting
- **Browser Console**: Check browser console for technical errors
