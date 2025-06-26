# Contact Management Guide - Admin Documentation

## Table of Contents
1. [Overview](#overview)
2. [Contact Creation](#contact-creation)
3. [Contact Editing](#contact-editing)
4. [Contact Search and Filtering](#contact-search-and-filtering)
5. [Bulk Import](#bulk-import)
6. [Data Export](#data-export)
7. [Contact Status Management](#contact-status-management)
8. [Contact Deletion](#contact-deletion)
9. [Data Validation](#data-validation)
10. [Best Practices](#best-practices)

## Overview

The Contact Management system provides comprehensive tools for managing pharmaceutical industry contacts. Admins can perform full CRUD operations, bulk imports, exports, and advanced filtering on the contact database.

### Access Requirements
- **Role**: Admin role required
- **URL**: `/admin/contacts`
- **Permissions**: Full contact database management

### Key Features
- Individual contact creation and editing
- Bulk import from CSV files
- Advanced search and filtering
- Data export capabilities
- Status management
- Contact revelation tracking

## Contact Creation

### Adding New Contacts

1. **Navigate** to Contact Management page (`/admin/contacts`)
2. **Click** the "Add Contact" button (Plus icon)
3. **Fill** the contact form with required information
4. **Submit** the form to create the contact

### Required Fields

#### Company Information
- **Company Name**: Name of the pharmaceutical company
  - Format: Text input
  - Validation: Required, minimum 2 characters
  - Example: "Pfizer Inc."

- **Company Type**: Type/category of the company
  - Format: Text input or dropdown
  - Validation: Required
  - Example: "Pharmaceutical Manufacturer"

- **Company Country**: Country where company is located
  - Format: Text input or country dropdown
  - Validation: Required
  - Example: "United States"

- **Company LinkedIn URL**: Company's LinkedIn profile
  - Format: URL input
  - Validation: Required, valid URL format
  - Example: "https://linkedin.com/company/pfizer"

- **Company Website**: Company's official website
  - Format: URL input
  - Validation: Required, valid URL format
  - Example: "https://www.pfizer.com"

#### Personal Information
- **Person Name**: Full name of the contact person
  - Format: Text input
  - Validation: Required, minimum 2 characters
  - Example: "Dr. Sarah Johnson"

- **Email**: Contact person's email address
  - Format: Email input with validation
  - Validation: Required, valid email format
  - Example: "sarah.johnson@pfizer.com"

- **Person Country**: Country where person is located
  - Format: Text input or country dropdown
  - Validation: Required
  - Example: "United States"

#### Professional Information
- **Department**: Department or division
  - Format: Text input
  - Validation: Required
  - Example: "Research & Development"

- **Designation**: Job title or position
  - Format: Text input
  - Validation: Required
  - Example: "Senior Research Director"

#### Account Settings
- **Status**: Contact status
  - Options:
    - `Active`: Contact is available for use
    - `Inactive`: Contact is disabled
  - Default: `Active`

### Optional Fields
- **Mobile**: Contact's mobile phone number
- **City**: City location of the contact
- **Additional Notes**: Any relevant additional information

## Contact Editing

### Editing Existing Contacts

1. **Locate** the contact in the contact list
2. **Click** the edit icon (pencil) next to the contact
3. **Modify** the desired fields in the edit form
4. **Save** changes to update the contact

### Edit Form Features
- **Pre-populated Fields**: Current contact data loaded automatically
- **Field Validation**: Real-time validation during editing
- **Cancel Option**: Discard changes and return to list
- **Save Confirmation**: Success message upon successful update

### Editable Information
- All contact fields can be modified
- Company and personal information
- Professional details
- Status and availability
- Contact URLs and links

## Contact Search and Filtering

### Search Functionality

#### Global Search
- **Multi-field Search**: Searches across multiple contact fields
- **Real-time Results**: Updates as you type
- **Fields Searched**:
  - Company name
  - Person name
  - Email address
  - Department
  - Designation

#### Advanced Filtering

##### Company Name Filter
- **Purpose**: Filter by specific company names
- **Type**: Text input with autocomplete
- **Behavior**: Partial matching supported
- **Clear Option**: Easy filter reset

##### Designation Filter
- **Purpose**: Filter by job titles and positions
- **Type**: Text input with suggestions
- **Examples**: "Director", "Manager", "VP", "CEO"
- **Case Insensitive**: Matches regardless of case

##### Country Filters
- **Person Country**: Filter by contact person's country
- **Company Country**: Filter by company's country location
- **Type**: Dropdown or text input
- **Multiple Selection**: Support for multiple countries

##### City Filter
- **Purpose**: Filter by city location
- **Type**: Text input
- **Partial Matching**: Supports partial city names
- **Geographic Grouping**: Related cities grouped together

### Filter Controls

#### Show/Hide Filters
- **Toggle Button**: "Hide Filter" / "Show Filter"
- **Space Optimization**: Hide filters for full-screen table view
- **State Persistence**: Filter visibility maintained during session

#### Clear All Filters
- **Reset Button**: Clear all active filters
- **Quick Reset**: Return to unfiltered view
- **Confirmation**: Optional confirmation for complex filter sets

#### Filter Combinations
- **Multiple Filters**: Apply multiple filters simultaneously
- **AND Logic**: All filters must match (intersection)
- **Real-time Updates**: Results update immediately

## Bulk Import

### Import Process Overview

1. **Prepare CSV File**: Format data according to template
2. **Access Import**: Click "Upload" or "Import" button
3. **Select File**: Choose CSV file from computer
4. **Validate Data**: System validates imported data
5. **Review Results**: Check import summary and errors
6. **Confirm Import**: Finalize the import process

### CSV File Requirements

#### File Format
- **Format**: CSV (Comma-Separated Values)
- **Encoding**: UTF-8 recommended
- **Headers**: First row must contain column headers
- **Delimiter**: Comma (,) separator

#### Required Columns
- `company_name`: Company name
- `person_name`: Contact person name
- `department`: Department/division
- `designation`: Job title
- `company_type`: Type of company
- `email`: Email address
- `person_country`: Person's country
- `company_country`: Company's country
- `company_linkedin_url`: LinkedIn URL
- `company_website`: Website URL
- `status`: Active/Inactive

#### Optional Columns
- `mobile`: Mobile phone number
- `city`: City location
- `notes`: Additional notes

### CSV Template Download
- **Template File**: Download pre-formatted CSV template
- **Column Headers**: Correct header names included
- **Sample Data**: Example rows for reference
- **Format Guide**: Instructions within template

### Import Validation

#### Data Validation Rules
- **Email Format**: Valid email address format required
- **URL Format**: Valid URL format for LinkedIn and website
- **Required Fields**: All required fields must have values
- **Duplicate Detection**: Check for duplicate email addresses
- **Data Length**: Field length limits enforced

#### Error Handling
- **Validation Report**: Detailed report of validation errors
- **Row-by-Row**: Errors reported with specific row numbers
- **Error Types**: Clear categorization of error types
- **Partial Import**: Option to import valid rows only

#### Success Confirmation
- **Import Summary**: Number of contacts imported successfully
- **Error Summary**: Number of rows with errors
- **Detailed Log**: Complete import log for review
- **Next Steps**: Guidance on handling errors

## Data Export

### Export Options

#### Full Database Export
- **Complete Data**: Export entire contact database
- **All Fields**: Includes all contact information
- **CSV Format**: Standard format for easy import elsewhere
- **Timestamp**: Automatic timestamp in filename

#### Filtered Export
- **Current View**: Export contacts matching current filters
- **Search Results**: Export based on search criteria
- **Maintains Filters**: Respects all active search and filter criteria
- **Selective Export**: Export only what you see

#### Custom Export
- **Field Selection**: Choose specific fields to export
- **Date Range**: Export contacts from specific time periods
- **Status Filter**: Export only active or inactive contacts
- **Format Options**: Multiple export formats if available

### Export Process
1. **Apply Filters** (if desired for filtered export)
2. **Click Export** button (Download icon)
3. **Choose Export Type** (full or filtered)
4. **Confirm Export** if prompted
5. **Download File** starts automatically

### Export File Details
- **Filename**: `contacts_export_YYYY-MM-DD_HH-MM-SS.csv`
- **Location**: Browser's default download folder
- **Format**: CSV with UTF-8 encoding
- **Size**: Varies based on number of contacts

## Contact Status Management

### Status Types

#### Active Status
- **Description**: Contact is available for user searches and reveals
- **Visibility**: Appears in user search results
- **Functionality**: Can be revealed by users (credit-based)
- **Indicator**: Green badge or checkmark

#### Inactive Status
- **Description**: Contact is hidden from user searches
- **Visibility**: Not visible to regular users
- **Admin Access**: Still visible to admins for management
- **Indicator**: Red badge or X mark

### Status Management

#### Individual Status Change
1. **Locate Contact**: Find contact in the list
2. **Edit Contact**: Click edit icon or status toggle
3. **Change Status**: Select new status (Active/Inactive)
4. **Save Changes**: Confirm status change
5. **Immediate Effect**: Status change takes effect immediately

#### Bulk Status Changes
1. **Select Contacts**: Use checkboxes to select multiple contacts
2. **Bulk Actions**: Choose bulk action from dropdown
3. **Status Change**: Select "Change Status" option
4. **Choose Status**: Select target status (Active/Inactive)
5. **Confirm**: Confirm bulk status change

### Status Change Impact
- **User Searches**: Inactive contacts excluded from user search results
- **Credit Usage**: Users cannot spend credits on inactive contacts
- **Admin Visibility**: Admins can still see and manage inactive contacts
- **Reversible**: Status changes can be reversed at any time

## Contact Deletion

### Deletion Policy
- **Permanent Deletion**: Contacts are permanently removed from database
- **Data Loss**: All contact information is lost permanently
- **Irreversible**: Deletion cannot be undone
- **Alternative**: Consider status change to inactive instead

### Deletion Process
1. **Locate Contact**: Find contact in the contact list
2. **Click Delete**: Click trash icon next to contact
3. **Confirmation Dialog**: Confirm deletion in popup dialog
4. **Final Confirmation**: Type confirmation text if required
5. **Permanent Removal**: Contact is permanently deleted

### Deletion Considerations
- **Data Dependencies**: Check if contact has been revealed by users
- **Audit Trail**: Consider impact on user activity logs
- **Alternative Options**: Deactivation vs. deletion
- **Backup**: Ensure recent backup exists before deletion

## Data Validation

### Real-time Validation
- **Field-level**: Validation occurs as user types
- **Format Checking**: Email, URL, and phone format validation
- **Required Fields**: Immediate feedback for missing required fields
- **Error Messages**: Clear, specific error messages

### Server-side Validation
- **Data Integrity**: Server validates all data before saving
- **Duplicate Detection**: Check for duplicate email addresses
- **Business Rules**: Enforce business logic and constraints
- **Security Validation**: Prevent malicious data injection

### Validation Rules

#### Email Validation
- **Format**: Standard email format (user@domain.com)
- **Uniqueness**: No duplicate email addresses allowed
- **Domain Validation**: Basic domain format checking
- **Length Limits**: Maximum email length enforced

#### URL Validation
- **Format**: Valid URL format (https://domain.com)
- **Protocol**: HTTP/HTTPS protocols required
- **Accessibility**: Optional URL accessibility checking
- **Length Limits**: Maximum URL length enforced

#### Text Field Validation
- **Length Limits**: Minimum and maximum length requirements
- **Character Sets**: Allowed character validation
- **Required Fields**: Non-empty validation for required fields
- **Special Characters**: Handling of special characters

## Best Practices

### Data Quality
1. **Consistent Formatting**: Maintain consistent data formatting
2. **Regular Updates**: Keep contact information current
3. **Duplicate Prevention**: Check for duplicates before adding
4. **Data Verification**: Verify contact information accuracy

### Import Best Practices
1. **Template Usage**: Always use provided CSV template
2. **Data Preparation**: Clean and validate data before import
3. **Small Batches**: Import in smaller batches for easier error handling
4. **Backup First**: Backup existing data before large imports

### Search and Filtering
1. **Specific Searches**: Use specific search terms for better results
2. **Filter Combinations**: Combine multiple filters for precise results
3. **Regular Cleanup**: Regularly review and clean filter criteria
4. **Performance**: Be mindful of performance with large datasets

### Security and Privacy
1. **Data Protection**: Protect sensitive contact information
2. **Access Control**: Limit access to authorized personnel only
3. **Audit Trail**: Maintain logs of data access and modifications
4. **Compliance**: Ensure compliance with data protection regulations

### System Performance
1. **Efficient Searches**: Use specific search criteria to improve performance
2. **Batch Operations**: Use bulk operations for multiple changes
3. **Regular Maintenance**: Perform regular database maintenance
4. **Monitor Usage**: Monitor system usage and performance metrics
