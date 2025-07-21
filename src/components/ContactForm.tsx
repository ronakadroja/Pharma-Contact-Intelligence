import { useState, useEffect } from 'react';
import { addContact, updateContact } from '../api/contacts';
import { useToast } from '../context/ToastContext';
import type { Contact, ContactPayload } from '../api/contacts';
import {
    validateEmail,
    validateRequired,
    validatePhoneNumber,
    type FormErrors
} from '../utils/validation';
import CustomizableDropdown from './ui/CustomizableDropdown';
import { fetchCountries, fetchDepartments, fetchProductTypes, fetchRegions, type CompanyOption } from '../api/combo';

interface ContactFormProps {
    contact?: Contact | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ContactForm = ({ contact, onSuccess, onCancel }: ContactFormProps) => {
    const { success, error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Combo data states
    const [countries, setCountries] = useState<CompanyOption[]>([]);
    const [departments, setDepartments] = useState<CompanyOption[]>([]);
    const [productTypes, setProductTypes] = useState<CompanyOption[]>([]);
    const [regions, setRegions] = useState<CompanyOption[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(false);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [formData, setFormData] = useState({
        company_name: contact?.company_name || '',
        person_name: contact?.person_name || '',
        department: contact?.department || '',
        designation: contact?.designation || '',
        product_type: contact?.product_type || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        city: contact?.city || '',
        person_country: contact?.person_country || '',
        company_country: contact?.company_country || '',
        region: contact?.region || '',
        reference: contact?.reference || '',
        person_linkedin_url: contact?.person_linkedin_url || '',
        company_linkedin_url: contact?.company_linkedin_url || '',
        company_website: contact?.company_website || '',
        status: contact?.status || 'Active',
        is_verified: contact?.is_verified || 0
    });

    // Load combo data on component mount
    useEffect(() => {
        const loadComboData = async () => {
            // Load countries
            setIsLoadingCountries(true);
            try {
                const countriesData = await fetchCountries();
                setCountries(countriesData);
            } catch (error) {
                console.error('Failed to load countries:', error);
            } finally {
                setIsLoadingCountries(false);
            }

            // Load departments
            setIsLoadingDepartments(true);
            try {
                const departmentsData = await fetchDepartments();
                setDepartments(departmentsData);
            } catch (error) {
                console.error('Failed to load departments:', error);
            } finally {
                setIsLoadingDepartments(false);
            }

            // Load product types
            setIsLoadingProductTypes(true);
            try {
                const productTypesData = await fetchProductTypes();
                setProductTypes(productTypesData);
            } catch (error) {
                console.error('Failed to load product types:', error);
            } finally {
                setIsLoadingProductTypes(false);
            }

            // Load regions
            setIsLoadingRegions(true);
            try {
                const regionsData = await fetchRegions();
                setRegions(regionsData);
            } catch (error) {
                console.error('Failed to load regions:', error);
            } finally {
                setIsLoadingRegions(false);
            }
        };

        loadComboData();
    }, []);

    // Reset form when contact prop changes
    useEffect(() => {
        if (contact) {
            setFormData({
                company_name: contact.company_name || '',
                person_name: contact.person_name || '',
                department: contact.department || '',
                designation: contact.designation || '',
                product_type: contact.product_type || '',
                email: contact.email || '',
                phone: contact.phone || '',
                city: contact.city || '',
                person_country: contact.person_country || '',
                company_country: contact.company_country || '',
                region: contact.region || '',
                reference: contact.reference || '',
                person_linkedin_url: contact.person_linkedin_url || '',
                company_linkedin_url: contact.company_linkedin_url || '',
                company_website: contact.company_website || '',
                status: contact.status || 'Active',
                is_verified: contact.is_verified || 0
            });
        } else {
            setFormData({
                company_name: '',
                person_name: '',
                department: '',
                designation: '',
                product_type: '',
                email: '',
                phone: '',
                city: '',
                person_country: '',
                company_country: '',
                region: '',
                reference: '',
                person_linkedin_url: '',
                company_linkedin_url: '',
                company_website: '',
                status: 'Active',
                is_verified: 0
            });
        }
        // Clear errors and touched state when contact changes
        setErrors({});
        setTouched({});
    }, [contact]);

    // URL validation function
    const validateUrl = (url: string, fieldName: string, isRequired: boolean = false): string => {
        if (!url.trim() && !isRequired) {
            return '';
        }

        if (!url.trim() && isRequired) {
            return `${fieldName} is required`;
        }

        try {
            new URL(url);
            return '';
        } catch {
            return `Please enter a valid ${fieldName.toLowerCase()}`;
        }
    };

    // Define required fields
    const requiredFields = ['company_name', 'person_name', 'person_country', 'department'];

    // Validate individual field
    const validateField = (name: string, value: string): any => {
        switch (name) {
            case 'company_name':
                return validateRequired(value, 'Company name').error || '';
            case 'person_name':
                return validateRequired(value, 'Person name').error || '';
            case 'department':
                return validateRequired(value, 'Department').error || '';
            case 'designation':
                // Not required anymore
                return '';
            case 'product_type':
                // Not required anymore
                return '';
            case 'email':
                return value ? (validateEmail(value).error || '') : '';
            case 'phone':
                return value ? (validatePhoneNumber(value).error || '') : '';
            case 'person_country':
                return validateRequired(value, 'Person country').error || null;
            case 'company_country':
                // Not required anymore
                return validateRequired(value, 'company country').error || null;
            case 'company_linkedin_url':
                return validateUrl(value, 'Company LinkedIn URL', false);
            case 'company_website':
                return validateUrl(value, 'Company website', false);
            case 'person_linkedin_url':
                return validateUrl(value, 'Personal LinkedIn URL', false);
            case 'status':
                return validateRequired(value, 'Status').error || '';
            default:
                return '';
        }
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Validate only required fields and fields with values
        Object.keys(formData).forEach(key => {
            const value = formData[key as keyof typeof formData];
            // Convert value to string for validation, handling both strings and numbers
            const stringValue = typeof value === 'string' ? value : String(value);

            // Only validate if field is required or has a value (for strings, check if trimmed value is not empty)
            const hasValue = typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined;

            if (requiredFields.includes(key) || hasValue) {
                const error = validateField(key, stringValue);
                if (error) {
                    newErrors[key] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle dropdown changes
    const handleCountryChange = (value: string, fieldName: 'person_country' | 'company_country') => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        setTouched(prev => ({ ...prev, [fieldName]: true }));

        const error = validateField(fieldName, value);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
    };

    const handleDepartmentChange = (value: string) => {
        setFormData(prev => ({ ...prev, department: value }));
        setTouched(prev => ({ ...prev, department: true }));

        const error = validateField('department', value);
        setErrors(prev => ({ ...prev, department: error }));
    };

    const handleProductTypeChange = (value: string) => {
        setFormData(prev => ({ ...prev, product_type: value }));
        setTouched(prev => ({ ...prev, product_type: true }));

        const error = validateField('product_type', value);
        setErrors(prev => ({ ...prev, product_type: error }));
    };

    const handleRegionChange = (value: string) => {
        setFormData(prev => ({ ...prev, region: value }));
        setTouched(prev => ({ ...prev, region: true }));

        const error = validateField('region', value);
        setErrors(prev => ({ ...prev, region: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: name === 'is_verified' ? Number(value) : value
        }));

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate field if it has been touched
        if (touched[name] || value) {
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate field on blur
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched to show validation errors
        const allFields = Object.keys(formData);
        setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

        // Validate form
        if (!validateForm()) {
            showError('Please fix the validation errors before submitting', {
                title: 'Validation Error',
                persistent: false
            });
            return;
        }

        setIsLoading(true);

        try {
            const contactPayload: ContactPayload = {
                ...formData
            };

            if (contact) {
                await updateContact(contact.id, contactPayload);
                success('Contact updated successfully!', {
                    title: 'Success',
                    actions: [
                        {
                            label: 'View Contacts',
                            onClick: () => console.log('Navigate to contacts'),
                            variant: 'primary'
                        }
                    ]
                });
            } else {
                await addContact(contactPayload);
                success('Contact added successfully!', {
                    title: 'Success',
                    actions: [
                        {
                            label: 'Add Another',
                            onClick: () => window.location.reload(),
                            variant: 'primary'
                        }
                    ]
                });
            }

            onSuccess?.();
        } catch (err: any) {
            console.error('Contact creation/update error:', err);

            // Extract error message and status code
            let errorMessage = `Failed to ${contact ? 'update' : 'add'} contact`;
            const statusCode = err?.response?.status;
            let isDuplicateError = false;

            if (err) {
                // Handle validation errors based on your template structure
                // Template: { "success": false, "error": { "phone": ["The phone field must be a string."], ... } }
                if (err.success === false && err.error && typeof err.error === 'object') {
                    // Handle field-specific validation errors
                    const validationErrors = err.error;
                    console.log(validationErrors);
                    const newFormErrors: FormErrors = {};

                    // Map API validation errors to form errors
                    Object.keys(validationErrors).forEach(field => {
                        const fieldErrors = validationErrors[field];
                        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                            newFormErrors[field] = fieldErrors[0]; // Use first error message
                        }
                    });

                    // Set form errors and mark fields as touched
                    setErrors(prev => ({ ...prev, ...newFormErrors }));
                    const touchedFields = Object.keys(newFormErrors).reduce((acc, field) => {
                        acc[field] = true;
                        return acc;
                    }, {} as Record<string, boolean>);
                    setTouched(prev => ({ ...prev, ...touchedFields }));

                    // Show general validation error message
                    showError('Please fix the validation errors and try again', {
                        title: 'Validation Error',
                        duration: 8000,
                        actions: [
                            {
                                label: 'Fix Errors',
                                onClick: () => {
                                    setIsLoading(false);
                                    // Focus on first error field
                                    const firstErrorField = Object.keys(newFormErrors)[0];
                                    if (firstErrorField) {
                                        const fieldElement = document.getElementById(firstErrorField) as HTMLInputElement;
                                        if (fieldElement) {
                                            fieldElement.focus();
                                        }
                                    }
                                },
                                variant: 'primary'
                            }
                        ]
                    });
                    return;
                }

                // Handle other API response structures
                if (err.response.data.error && typeof err.response.data.error === 'string') {
                    errorMessage = err.response.data.error;
                    // Check for duplicate/already exists errors
                    isDuplicateError = errorMessage.toLowerCase().includes('already exists') ||
                        errorMessage.toLowerCase().includes('duplicate') ||
                        errorMessage.toLowerCase().includes('unique constraint');
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }

            // Handle specific scenarios
            if (statusCode === 422 && isDuplicateError) {
                // Duplicate contact - provide specific guidance
                showError(errorMessage, {
                    title: 'Contact Already Exists',
                    duration: 10000, // Longer duration for important info
                    actions: [
                        {
                            label: 'Change Email',
                            onClick: () => {
                                // Focus on email field for user to change it
                                const emailInput = document.getElementById('email') as HTMLInputElement;
                                if (emailInput) {
                                    emailInput.focus();
                                    emailInput.select();
                                }
                                setIsLoading(false);
                            },
                            variant: 'primary'
                        },
                        {
                            label: 'Clear Form',
                            onClick: () => {
                                // Reset form to initial state
                                window.location.reload();
                            },
                            variant: 'secondary'
                        }
                    ]
                });
            } else if (statusCode === 422) {
                // Other validation errors
                showError(errorMessage, {
                    title: 'Validation Error',
                    duration: 8000,
                    actions: [
                        {
                            label: 'Fix & Retry',
                            onClick: () => {
                                setIsLoading(false);
                            },
                            variant: 'primary'
                        }
                    ]
                });
            } else {
                // General errors
                showError(errorMessage, {
                    title: 'Error',
                    duration: 8000,
                    actions: [
                        {
                            label: 'Try Again',
                            onClick: () => {
                                setIsLoading(false);
                            },
                            variant: 'primary'
                        }
                    ]
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white h-full flex flex-col max-h-full">
            {/* Sticky Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    {contact ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    {contact ? 'Update the contact information below.' : 'Fill in the information below to add a new contact.'}
                </p>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <form id="contact-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        placeholder="Enter company name"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.company_name && errors.company_name
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.company_name && errors.company_name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.company_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="product_type" className="block text-sm font-medium text-gray-700">
                                        Product Type
                                    </label>
                                    <CustomizableDropdown
                                        id="product_type"
                                        options={productTypes}
                                        value={formData.product_type}
                                        onChange={handleProductTypeChange}
                                        placeholder="Select or enter product type"
                                        emptyMessage="No product types found. Type a custom product type and click outside to use it."
                                        disabled={isLoading}
                                        loading={isLoadingProductTypes}
                                        allowCustomInput={true}
                                        className={`mt-1 ${touched.product_type && errors.product_type ? 'border-red-300' : ''}`}
                                    />
                                    {touched.product_type && errors.product_type && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.product_type}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="company_website" className="block text-sm font-medium text-gray-700">
                                        Company Website
                                    </label>
                                    <input
                                        type="url"
                                        id="company_website"
                                        name="company_website"
                                        value={formData.company_website}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter company website"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.company_website && errors.company_website
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.company_website && errors.company_website && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.company_website}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="company_linkedin_url" className="block text-sm font-medium text-gray-700">
                                        Company LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        id="company_linkedin_url"
                                        name="company_linkedin_url"
                                        value={formData.company_linkedin_url}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter company LinkedIn URL"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.company_linkedin_url && errors.company_linkedin_url
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.company_linkedin_url && errors.company_linkedin_url && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.company_linkedin_url}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="company_country" className="block text-sm font-medium text-gray-700">
                                        Company Country
                                    </label>
                                    <CustomizableDropdown
                                        id="company_country"
                                        options={countries}
                                        value={formData.company_country}
                                        onChange={(value) => handleCountryChange(value, 'company_country')}
                                        placeholder="Select company country"
                                        emptyMessage="No countries found"
                                        disabled={isLoading}
                                        loading={isLoadingCountries}
                                        allowCustomInput={false}
                                        className={`mt-1 ${touched.company_country && errors.company_country ? 'border-red-300' : ''}`}
                                    />
                                    {touched.company_country && errors.company_country && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.company_country}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Person Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Person Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="person_name" className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="person_name"
                                        name="person_name"
                                        value={formData.person_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        placeholder="Enter full name"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.person_name && errors.person_name
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.person_name && errors.person_name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.person_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter email address"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.email && errors.email
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.email && errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter phone number"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.phone && errors.phone
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.phone && errors.phone && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="person_linkedin_url" className="block text-sm font-medium text-gray-700">
                                        LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        id="person_linkedin_url"
                                        name="person_linkedin_url"
                                        value={formData.person_linkedin_url}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter LinkedIn URL"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.person_linkedin_url && errors.person_linkedin_url
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.person_linkedin_url && errors.person_linkedin_url && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.person_linkedin_url}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <CustomizableDropdown
                                        id="department"
                                        options={departments}
                                        value={formData.department}
                                        onChange={handleDepartmentChange}
                                        placeholder="Select or enter department"
                                        emptyMessage="No departments found. Type a custom department and click outside to use it."
                                        disabled={isLoading}
                                        loading={isLoadingDepartments}
                                        allowCustomInput={true}
                                        className={`mt-1 ${touched.department && errors.department ? 'border-red-300' : ''}`}
                                    />
                                    {touched.department && errors.department && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.department}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        id="designation"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter designation"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.designation && errors.designation
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.designation && errors.designation && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.designation}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="person_country" className="block text-sm font-medium text-gray-700">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <CustomizableDropdown
                                        id="person_country"
                                        options={countries}
                                        value={formData.person_country}
                                        onChange={(value) => handleCountryChange(value, 'person_country')}
                                        placeholder="Select person country"
                                        emptyMessage="No countries found"
                                        disabled={isLoading}
                                        loading={isLoadingCountries}
                                        allowCustomInput={false}
                                        className={`mt-1 ${touched.person_country && errors.person_country ? 'border-red-300' : ''}`}
                                    />
                                    {touched.person_country && errors.person_country && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.person_country}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                        className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                                        Region
                                    </label>
                                    <CustomizableDropdown
                                        id="region"
                                        options={regions}
                                        value={formData.region}
                                        onChange={handleRegionChange}
                                        placeholder="Select or enter region"
                                        emptyMessage="No regions found. Type a custom region and click outside to use it."
                                        disabled={isLoading}
                                        loading={isLoadingRegions}
                                        allowCustomInput={true}
                                        className={`mt-1 ${touched.region && errors.region ? 'border-red-300' : ''}`}
                                    />
                                    {touched.region && errors.region && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.region}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                                        Reference Source
                                    </label>
                                    <input
                                        type="text"
                                        id="reference"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter reference source"
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.reference && errors.reference
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {touched.reference && errors.reference && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.reference}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.status && errors.status
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    {touched.status && errors.status && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.status}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="is_verified" className="block text-sm font-medium text-gray-700">
                                        Verification Status
                                    </label>
                                    <select
                                        id="is_verified"
                                        name="is_verified"
                                        value={formData.is_verified}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={0}>Not Verified</option>
                                        <option value={1}>Verified</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                </form>
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6 shadow-lg">
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="contact-form"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {(() => {
                            if (isLoading) return 'Saving...';
                            return contact ? 'Update Contact' : 'Add Contact';
                        })()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;