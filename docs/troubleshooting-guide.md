# Troubleshooting Guide - Admin Documentation

## Table of Contents
1. [Overview](#overview)
2. [Common Login Issues](#common-login-issues)
3. [User Management Problems](#user-management-problems)
4. [Contact Management Issues](#contact-management-issues)
5. [API Connection Problems](#api-connection-problems)
6. [Performance Issues](#performance-issues)
7. [Browser-Specific Issues](#browser-specific-issues)
8. [Data Import/Export Problems](#data-importexport-problems)
9. [Security and Access Issues](#security-and-access-issues)
10. [Getting Additional Help](#getting-additional-help)

## Overview

This troubleshooting guide provides solutions for common issues encountered while using the Pharma Contact Intelligence admin panel. Issues are organized by category with step-by-step resolution instructions.

### Before You Start
1. **Check System Status**: Verify the system is operational
2. **Browser Requirements**: Ensure you're using a supported browser
3. **Network Connection**: Verify stable internet connection
4. **Clear Cache**: Clear browser cache and cookies if experiencing issues
5. **Try Incognito Mode**: Test in private/incognito browser mode

## Common Login Issues

### Cannot Log In - Invalid Credentials

**Symptoms**:
- "Invalid email or password" error message
- Login form rejects valid credentials
- Unable to access admin panel

**Possible Causes**:
- Incorrect username or password
- Account has been deactivated
- Caps Lock is enabled
- Browser auto-fill using old credentials

**Solutions**:
1. **Verify Credentials**:
   - Double-check username/email spelling
   - Verify password is correct
   - Check if Caps Lock is enabled
   - Try typing credentials manually

2. **Check Account Status**:
   - Verify account is active
   - Contact system administrator if account is locked
   - Confirm you have admin role assigned

3. **Browser Issues**:
   - Clear browser cache and cookies
   - Disable browser auto-fill temporarily
   - Try different browser or incognito mode

4. **Password Reset**:
   - Use password reset functionality if available
   - Contact administrator for password reset

### Session Expires Immediately

**Symptoms**:
- Logged out immediately after login
- Session timeout errors
- Constant redirect to login page

**Possible Causes**:
- Token expiration issues
- Server time synchronization problems
- Browser storage issues

**Solutions**:
1. **Clear Browser Data**:
   - Clear localStorage and sessionStorage
   - Clear all cookies for the domain
   - Restart browser

2. **Check System Time**:
   - Verify computer clock is accurate
   - Synchronize system time if needed

3. **Try Different Browser**:
   - Test with different browser
   - Use incognito/private mode

### Login Page Not Loading

**Symptoms**:
- Blank login page
- Login form not displaying
- JavaScript errors in console

**Solutions**:
1. **Check Network Connection**:
   - Verify internet connectivity
   - Test other websites

2. **Browser Console**:
   - Open browser developer tools (F12)
   - Check console for JavaScript errors
   - Look for network request failures

3. **Clear Browser Cache**:
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache completely

## User Management Problems

### Cannot Create New Users

**Symptoms**:
- User creation form fails to submit
- Validation errors on valid data
- "User creation failed" error messages

**Possible Causes**:
- Duplicate email addresses
- Missing required fields
- Network connectivity issues
- Server validation errors

**Solutions**:
1. **Check Form Data**:
   - Verify all required fields are filled
   - Ensure email address is unique
   - Check email format is valid
   - Verify phone number format

2. **Network Issues**:
   - Check internet connection
   - Try submitting again after a moment
   - Check browser console for network errors

3. **Server Errors**:
   - Note exact error message
   - Check if email already exists in system
   - Contact system administrator if persistent

### User List Not Loading

**Symptoms**:
- Empty user list
- Loading spinner never stops
- "Failed to fetch users" error

**Solutions**:
1. **Refresh Page**:
   - Hard refresh the page (Ctrl+F5)
   - Clear filters and search terms
   - Try different page size

2. **Check Permissions**:
   - Verify you have admin role
   - Confirm you're logged in properly
   - Check session hasn't expired

3. **API Issues**:
   - Check browser console for API errors
   - Verify API endpoint is accessible
   - Contact administrator if API is down

### User Search Not Working

**Symptoms**:
- Search returns no results
- Filters not applying correctly
- Search functionality unresponsive

**Solutions**:
1. **Clear Search Filters**:
   - Click "Clear Filters" button
   - Reset all search fields
   - Try simple search terms

2. **Check Search Terms**:
   - Verify spelling of search terms
   - Try partial matches instead of exact matches
   - Use different search criteria

3. **Browser Issues**:
   - Clear browser cache
   - Disable browser extensions
   - Try different browser

## Contact Management Issues

### Contact Import Fails

**Symptoms**:
- CSV import returns errors
- "Import failed" messages
- Partial import with many errors

**Possible Causes**:
- Incorrect CSV format
- Missing required fields
- Invalid data in CSV
- File encoding issues

**Solutions**:
1. **Check CSV Format**:
   - Download and use provided CSV template
   - Verify all required columns are present
   - Check column header names match exactly
   - Ensure CSV uses comma separators

2. **Data Validation**:
   - Verify email addresses are valid format
   - Check URL formats for LinkedIn and website
   - Ensure required fields are not empty
   - Remove special characters that might cause issues

3. **File Encoding**:
   - Save CSV file as UTF-8 encoding
   - Try opening CSV in text editor to check format
   - Re-export CSV from Excel with proper settings

4. **File Size**:
   - Try importing smaller batches
   - Split large files into multiple imports
   - Check file size limits

### Contact Search Returns No Results

**Symptoms**:
- Search returns empty results
- Filters show no contacts
- Known contacts not appearing

**Solutions**:
1. **Clear All Filters**:
   - Reset all search filters
   - Clear search text
   - Check "Show Filter" / "Hide Filter" toggle

2. **Check Search Terms**:
   - Try broader search terms
   - Use partial company names
   - Search by different fields (name, designation, etc.)

3. **Verify Data**:
   - Check if contacts exist in database
   - Verify contact status (active/inactive)
   - Confirm you have proper permissions

### Contact Export Not Working

**Symptoms**:
- Export button doesn't respond
- Download doesn't start
- Empty or corrupted export file

**Solutions**:
1. **Browser Settings**:
   - Check browser download settings
   - Allow downloads from the site
   - Try different browser

2. **File Permissions**:
   - Check download folder permissions
   - Try downloading to different location
   - Clear browser download history

3. **Data Issues**:
   - Try exporting smaller dataset
   - Apply filters to reduce export size
   - Check if any contacts have invalid data

## API Connection Problems

### API Endpoint Not Responding

**Symptoms**:
- "Network Error" messages
- Timeouts on API requests
- "Failed to fetch" errors

**Solutions**:
1. **Check API Configuration**:
   - Verify API base URL in configuration
   - Check if API server is running
   - Test API endpoint directly

2. **Network Issues**:
   - Check internet connectivity
   - Try accessing from different network
   - Check firewall settings

3. **Server Issues**:
   - Contact system administrator
   - Check server status
   - Verify API server is operational

### CORS Errors

**Symptoms**:
- "CORS policy" error messages
- "Access-Control-Allow-Origin" errors
- API requests blocked by browser

**Solutions**:
1. **Server Configuration**:
   - Contact administrator to configure CORS
   - Verify domain is whitelisted
   - Check API server CORS settings

2. **Development Mode**:
   - Use browser with disabled security (development only)
   - Configure development proxy
   - Use API testing tools

### Authentication Token Issues

**Symptoms**:
- "Unauthorized" errors
- "Invalid token" messages
- Automatic logout

**Solutions**:
1. **Token Refresh**:
   - Log out and log back in
   - Clear browser storage
   - Check token expiration

2. **Storage Issues**:
   - Clear localStorage
   - Check browser storage permissions
   - Verify token is being stored correctly

## Performance Issues

### Slow Page Loading

**Symptoms**:
- Pages take long time to load
- Slow response to user actions
- Timeouts on operations

**Solutions**:
1. **Network Optimization**:
   - Check internet speed
   - Try wired connection instead of WiFi
   - Close other bandwidth-intensive applications

2. **Browser Optimization**:
   - Close unnecessary browser tabs
   - Clear browser cache
   - Disable unnecessary browser extensions

3. **Data Optimization**:
   - Use filters to reduce data load
   - Reduce page size for large lists
   - Avoid loading all data at once

### Large Dataset Issues

**Symptoms**:
- Slow search and filtering
- Browser becomes unresponsive
- Memory usage warnings

**Solutions**:
1. **Use Pagination**:
   - Reduce items per page
   - Use search filters to narrow results
   - Load data in smaller chunks

2. **Browser Resources**:
   - Close other applications
   - Use browser with more memory
   - Restart browser periodically

## Browser-Specific Issues

### Internet Explorer/Edge Legacy

**Symptoms**:
- Layout issues
- JavaScript errors
- Features not working

**Solutions**:
1. **Use Modern Browser**:
   - Switch to Chrome, Firefox, or modern Edge
   - Update browser to latest version
   - Enable JavaScript and cookies

### Safari Issues

**Symptoms**:
- Cookie/storage issues
- Authentication problems
- Display issues

**Solutions**:
1. **Safari Settings**:
   - Enable cookies and local storage
   - Disable "Prevent cross-site tracking"
   - Clear website data

### Mobile Browser Issues

**Symptoms**:
- Layout problems on mobile
- Touch interaction issues
- Performance problems

**Solutions**:
1. **Use Desktop Browser**:
   - Admin panel optimized for desktop
   - Use computer for admin tasks
   - Consider tablet with larger screen

## Data Import/Export Problems

### CSV Format Issues

**Symptoms**:
- Import validation errors
- Incorrect data parsing
- Missing fields after import

**Solutions**:
1. **Use Template**:
   - Download provided CSV template
   - Match column headers exactly
   - Follow data format examples

2. **Excel Issues**:
   - Save as CSV (UTF-8) format
   - Check for hidden characters
   - Verify date and number formats

### Large File Imports

**Symptoms**:
- Import timeouts
- Browser memory errors
- Partial imports

**Solutions**:
1. **Split Files**:
   - Break large files into smaller batches
   - Import 100-500 records at a time
   - Monitor import progress

2. **File Optimization**:
   - Remove unnecessary columns
   - Clean data before import
   - Compress file if possible

## Security and Access Issues

### Permission Denied Errors

**Symptoms**:
- "Access denied" messages
- Cannot access admin features
- Redirected to user dashboard

**Solutions**:
1. **Check Role**:
   - Verify you have admin role
   - Contact administrator to check permissions
   - Log out and log back in

2. **Session Issues**:
   - Clear browser storage
   - Check if session expired
   - Try different browser

### Account Lockout

**Symptoms**:
- Cannot log in after multiple attempts
- "Account locked" messages
- Access denied errors

**Solutions**:
1. **Wait and Retry**:
   - Wait for lockout period to expire
   - Try again after specified time
   - Contact administrator if persistent

2. **Administrator Help**:
   - Contact system administrator
   - Request account unlock
   - Verify account status

## Getting Additional Help

### Information to Collect

When reporting issues, collect:
1. **Error Messages**: Exact error text
2. **Browser Information**: Browser type and version
3. **Steps to Reproduce**: Detailed steps that cause the issue
4. **Screenshots**: Visual evidence of the problem
5. **Console Logs**: Browser console errors (F12 → Console)
6. **Network Logs**: Failed network requests (F12 → Network)

### Browser Console Information

To access browser console:
1. **Chrome/Firefox**: Press F12 or right-click → "Inspect"
2. **Safari**: Enable Developer menu → Show Web Inspector
3. **Edge**: Press F12 or right-click → "Inspect Element"

Look for:
- Red error messages
- Failed network requests (red entries in Network tab)
- JavaScript errors in Console tab

### Contact Information

For additional support:
1. **System Administrator**: Contact your organization's system administrator
2. **Technical Support**: Use provided support channels
3. **Documentation**: Refer to other documentation files
4. **User Community**: Check user forums or knowledge base

### Emergency Procedures

For critical issues:
1. **Document the Issue**: Take screenshots and note error messages
2. **Try Alternative Browser**: Test with different browser
3. **Contact Administrator**: Report critical issues immediately
4. **Backup Data**: Export important data if possible
5. **Alternative Access**: Use alternative access methods if available
