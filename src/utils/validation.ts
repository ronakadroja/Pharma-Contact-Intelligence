/**
 * Validation Utilities
 * 
 * Comprehensive validation functions for form fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

/**
 * Email validation
 */
export const validateEmail = (email: string | null | undefined): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
};

/**
 * Password validation
 */
export const validatePassword = (password: string | null | undefined, isRequired: boolean = true): ValidationResult => {
  if ((!password || !password.trim()) && isRequired) {
    return { isValid: false, error: 'Password is required' };
  }

  if ((!password || !password.trim()) && !isRequired) {
    return { isValid: true }; // Optional password (edit mode)
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain at least one letter and one number' };
  }

  return { isValid: true };
};

/**
 * Phone number validation
 */
export const validatePhoneNumber = (phone: string | null | undefined): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  // Basic phone format validation (allows various formats)
  const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
};

/**
 * Name validation
 */
export const validateName = (name: string | null | undefined): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Company name validation
 */
export const validateCompany = (company: string | null | undefined): ValidationResult => {
  if (!company || !company.trim()) {
    return { isValid: false, error: 'Company name is required' };
  }

  if (company.trim().length < 2) {
    return { isValid: false, error: 'Company name must be at least 2 characters long' };
  }

  if (company.length > 200) {
    return { isValid: false, error: 'Company name is too long (max 200 characters)' };
  }

  return { isValid: true };
};

/**
 * Credits validation
 */
export const validateCredits = (credits: string | null | undefined): ValidationResult => {
  if (!credits || !credits.trim()) {
    return { isValid: false, error: 'Credits are required' };
  }

  const creditsNum = parseInt(credits, 10);

  if (isNaN(creditsNum)) {
    return { isValid: false, error: 'Credits must be a valid number' };
  }

  if (creditsNum < 0) {
    return { isValid: false, error: 'Credits cannot be negative' };
  }

  if (creditsNum > 999999) {
    return { isValid: false, error: 'Credits value is too large' };
  }

  return { isValid: true };
};

/**
 * Date validation
 */
export const validateDate = (date: string | null | undefined, fieldName: string): ValidationResult => {
  if (!date || !date.trim()) {
    return { isValid: true }; // Optional field
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` };
  }

  // Check if date is not too far in the past or future
  const currentYear = new Date().getFullYear();
  const dateYear = dateObj.getFullYear();

  if (dateYear < 1900 || dateYear > currentYear + 50) {
    return { isValid: false, error: `${fieldName} year must be between 1900 and ${currentYear + 50}` };
  }

  return { isValid: true };
};

/**
 * Date range validation (start date should be before end date)
 */
export const validateDateRange = (startDate: string | null | undefined, endDate: string | null | undefined): ValidationResult => {
  if (!startDate || !startDate.trim() || !endDate || !endDate.trim()) {
    return { isValid: true }; // Skip validation if either date is empty
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: true }; // Individual date validation will handle invalid dates
  }

  if (start >= end) {
    return { isValid: false, error: 'Subscription start date must be before end date' };
  }

  return { isValid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value: string | null | undefined, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};
