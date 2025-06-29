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

interface ContactFormProps {
    contact?: Contact | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const DEPARTMENTS = ['Sales', 'Purchase', 'Supply Chain', 'Marketing', 'R&D'];
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
const COMPANY_TYPES = ['Medical', 'Pharmaceutical', 'Healthcare', 'Research', 'Other'];
const REFERENCES = ['LinkedIn', 'Website', 'Referral', 'Conference', 'Other'];

const ContactForm = ({ contact, onSuccess, onCancel }: ContactFormProps) => {
    const { success, error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [formData, setFormData] = useState({
        company_name: contact?.company_name || '',
        person_name: contact?.person_name || '',
        department: contact?.department || '',
        designation: contact?.designation || '',
        company_type: contact?.company_type || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        city: contact?.city || '',
        person_country: contact?.person_country || '',
        company_country: contact?.company_country || '',
        reference: contact?.reference || '',
        person_linkedin_url: contact?.person_linkedin_url || '',
        company_linkedin_url: contact?.company_linkedin_url || '',
        company_website: contact?.company_website || '',
        status: contact?.status || 'Active',
        is_verified: contact?.is_verified || 0
    });

    // Reset form when contact prop changes
    useEffect(() => {
        if (contact) {
            setFormData({
                company_name: contact.company_name || '',
                person_name: contact.person_name || '',
                department: contact.department || '',
                designation: contact.designation || '',
                company_type: contact.company_type || '',
                email: contact.email || '',
                phone: contact.phone || '',
                city: contact.city || '',
                person_country: contact.person_country || '',
                company_country: contact.company_country || '',
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
                company_type: '',
                email: '',
                phone: '',
                city: '',
                person_country: '',
                company_country: '',
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

    // Validate individual field
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'company_name':
                return validateRequired(value, 'Company name').error || '';
            case 'person_name':
                return validateRequired(value, 'Person name').error || '';
            case 'department':
                return validateRequired(value, 'Department').error || '';
            case 'designation':
                return validateRequired(value, 'Designation').error || '';
            case 'company_type':
                return validateRequired(value, 'Company type').error || '';
            case 'email':
                return validateEmail(value).error || '';
            case 'phone':
                return value ? (validatePhoneNumber(value).error || '') : '';
            case 'person_country':
                return validateRequired(value, 'Person country').error || '';
            case 'company_country':
                return validateRequired(value, 'Company country').error || '';
            case 'company_linkedin_url':
                return validateUrl(value, 'Company LinkedIn URL', true);
            case 'company_website':
                return validateUrl(value, 'Company website', true);
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

        // Validate all fields
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof typeof formData] as string);
            if (error) {
                newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
            let statusCode = err?.response?.status;
            let isDuplicateError = false;

            if (err?.response?.data) {
                // Handle different API response structures
                if (err.response.data.error) {
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
        <div className="bg-white">
            <div className="p-6 pb-0">
                <h2 className="text-xl font-semibold text-gray-900">
                    {contact ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    {contact ? 'Update the contact information below.' : 'Fill in the information below to add a new contact.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                                <label htmlFor="company_type" className="block text-sm font-medium text-gray-700">
                                    Company Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="company_type"
                                    name="company_type"
                                    value={formData.company_type}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.company_type && errors.company_type
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select company type</option>
                                    {COMPANY_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                {touched.company_type && errors.company_type && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.company_type}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="company_website" className="block text-sm font-medium text-gray-700">
                                    Company Website <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="company_website"
                                    name="company_website"
                                    value={formData.company_website}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
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
                                    Company LinkedIn URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="company_linkedin_url"
                                    name="company_linkedin_url"
                                    value={formData.company_linkedin_url}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
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
                                    Company Country <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="company_country"
                                    name="company_country"
                                    value={formData.company_country}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.company_country && errors.company_country
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
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
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
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
                                    placeholder="Enter phone number"
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
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
                                    placeholder="Enter LinkedIn URL"
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.department && errors.department
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
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
                                    Designation <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
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
                                <select
                                    id="person_country"
                                    name="person_country"
                                    value={formData.person_country}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`mt-1 block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touched.person_country && errors.person_country
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
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
                                <select
                                    id="reference"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select reference source</option>
                                    {REFERENCES.map(ref => (
                                        <option key={ref} value={ref}>{ref}</option>
                                    ))}
                                </select>
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

                <div className="flex justify-end gap-3 pt-4 border-t">
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
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {(() => {
                            if (isLoading) return 'Saving...';
                            return contact ? 'Update Contact' : 'Add Contact';
                        })()}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm; 