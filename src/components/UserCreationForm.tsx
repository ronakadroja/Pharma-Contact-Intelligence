import { Building, Globe, Mail, Phone, User as UserIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createUser, updateUser } from '../api/auth';
import { useToast } from '../context/ToastContext';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types/auth';
import { encodePassword } from '../utils/auth';
import {
    validateCompany,
    validateCredits,
    validateDate,
    validateDateRange,
    validateEmail,
    validateName,
    validatePassword,
    validatePhoneNumber,
    validateRequired,
    type FormErrors
} from '../utils/validation';
import { Button, Input } from './ui/design-system';


interface UserCreationFormProps {
    user?: User | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Japan'];
const ROLES = ['User', 'Admin'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

const DEFAULT_FORM_STATE: CreateUserPayload = {
    name: '',
    email: '',
    password: '',
    phone_number: '',
    company: '',
    country: '',
    credits: '',
    role: 'User',
    status: 'Active',
    subscription_start_date: '',
    subscription_end_date: ''
};

const UserCreationForm = ({ user, onSuccess, onCancel }: UserCreationFormProps) => {
    const { success, error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateUserPayload>(DEFAULT_FORM_STATE);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Reset form when user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Always empty in edit mode
                phone_number: user.phone_number,
                company: user.company,
                country: user.country,
                credits: user.credits.toString(),
                role: user.role,
                status: user.status,
                subscription_start_date: user.subscription_start_date ?? '',
                subscription_end_date: user.subscription_end_date ?? ''
            });
        } else {
            setFormData(DEFAULT_FORM_STATE);
        }
        // Clear errors and touched state when user changes
        setErrors({});
        setTouched({});
    }, [user]);

    // Validate individual field
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'name':
                return validateName(value).error || '';
            case 'email':
                return validateEmail(value).error || '';
            case 'password':
                return validatePassword(value, !user).error || '';
            case 'phone_number':
                return validatePhoneNumber(value).error || '';
            case 'company':
                return validateCompany(value).error || '';
            case 'country':
                return validateRequired(value, 'Country').error || '';
            case 'credits':
                return validateCredits(value).error || '';
            case 'subscription_start_date':
                return validateDate(value, 'Subscription start date').error || '';
            case 'subscription_end_date':
                return validateDate(value, 'Subscription end date').error || '';
            default:
                return '';
        }
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Validate all fields
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof CreateUserPayload] as string);
            if (error) {
                newErrors[key] = error;
            }
        });

        // Special validation for date range
        if (formData.subscription_start_date && formData.subscription_end_date) {
            const dateRangeValidation = validateDateRange(
                formData.subscription_start_date,
                formData.subscription_end_date
            );
            if (!dateRangeValidation.isValid) {
                newErrors.subscription_end_date = dateRangeValidation.error || '';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: value
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

            // Special handling for date range validation
            if (name === 'subscription_start_date' || name === 'subscription_end_date') {
                const startDate = name === 'subscription_start_date' ? value : formData.subscription_start_date;
                const endDate = name === 'subscription_end_date' ? value : formData.subscription_end_date;

                if (startDate && endDate) {
                    const dateRangeValidation = validateDateRange(startDate, endDate);
                    if (!dateRangeValidation.isValid) {
                        setErrors(prev => ({
                            ...prev,
                            subscription_end_date: dateRangeValidation.error || ''
                        }));
                    } else {
                        // Clear date range error if validation passes
                        setErrors(prev => {
                            const newErrors = { ...prev };
                            if (newErrors.subscription_end_date === 'Subscription start date must be before end date') {
                                delete newErrors.subscription_end_date;
                            }
                            return newErrors;
                        });
                    }
                }
            }
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

    const handleCancel = () => {
        setFormData(DEFAULT_FORM_STATE);
        setErrors({});
        setTouched({});
        onCancel?.();
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
            if (user) {
                // Edit mode - only send changed fields
                const updateData: UpdateUserPayload = {};

                // Compare each field with original user data
                if (formData.name !== user.name) updateData.name = formData.name;
                if (formData.email !== user.email) updateData.email = formData.email;
                if (formData.phone_number !== user.phone_number) updateData.phone_number = formData.phone_number;
                if (formData.company !== user.company) updateData.company = formData.company;
                if (formData.country !== user.country) updateData.country = formData.country;
                if (formData.role !== user.role) updateData.role = formData.role;
                if (formData.credits !== user.credits.toString()) updateData.credits = formData.credits;
                if (formData.status !== user.status) updateData.status = formData.status;
                if (formData.subscription_start_date !== (user.subscription_start_date ?? '')) updateData.subscription_start_date = formData.subscription_start_date;
                if (formData.subscription_end_date !== (user.subscription_end_date ?? '')) updateData.subscription_end_date = formData.subscription_end_date;

                // Only include password if it was changed
                if (formData.password) {
                    updateData.password = encodePassword(formData.password);
                }

                await updateUser(user.id, updateData);
                success('User updated successfully!', {
                    title: 'Success',
                    actions: [
                        {
                            label: 'View Users',
                            onClick: () => console.log('Navigate to users list'),
                            variant: 'primary'
                        }
                    ]
                });
            } else {
                // Create mode - send all required fields
                const createData: CreateUserPayload = {
                    ...formData,
                    password: encodePassword(formData.password)
                };

                await createUser(createData);
                success('User created successfully!', {
                    title: 'Success',
                    actions: [
                        {
                            label: 'Create Another',
                            onClick: () => {
                                setFormData(DEFAULT_FORM_STATE);
                                setErrors({});
                                setTouched({});
                            },
                            variant: 'primary'
                        }
                    ]
                });
                setFormData(DEFAULT_FORM_STATE);
                setErrors({});
                setTouched({});
            }

            onSuccess?.();
        } catch (err: any) {
            const errorMessage = err ? err.error : `Failed to ${user ? 'update' : 'create'} user`;
            showError(errorMessage, {
                title: 'Error',
                persistent: false,
                // actions: [
                //     {
                //         label: 'Try Again',
                //         onClick: () => {
                //             const form = document.querySelector('form');
                //             if (form) {
                //                 const event = new Event('submit', { bubbles: true, cancelable: true });
                //                 form.dispatchEvent(event);
                //             }
                //         },
                //         variant: 'primary'
                //     }
                // ]
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-900">{user ? 'Edit User' : 'Create New User'}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        {user ? 'Update the user information below.' : 'Fill in the information below to create a new user account.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-2 text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h3 className="text-sm font-medium text-neutral-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            label="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            placeholder="Enter full name"
                            leftIcon={<UserIcon size={18} />}
                            error={touched.name ? errors.name : undefined}
                        />

                        <Input
                            type="email"
                            id="email"
                            name="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            placeholder="Enter email address"
                            leftIcon={<Mail size={18} />}
                            error={touched.email ? errors.email : undefined}
                        />

                        <Input
                            type="password"
                            id="password"
                            name="password"
                            label={`Password ${!user ? '*' : ''}`}
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required={!user}
                            placeholder={user ? "Enter new password (optional)" : "Enter password"}
                            hint={user ? "Leave blank to keep current password" : undefined}
                            error={touched.password ? errors.password : undefined}
                        />

                        <Input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            label="Phone Number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            placeholder="Enter phone number"
                            leftIcon={<Phone size={18} />}
                            error={touched.phone_number ? errors.phone_number : undefined}
                        />
                    </div>
                </div>

                {/* Company Information */}
                <div>
                    <h3 className="text-sm font-medium text-neutral-900 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <Input
                            type="text"
                            id="company"
                            name="company"
                            label="Company Name"
                            value={formData.company}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            placeholder="Enter company name"
                            leftIcon={<Building size={18} />}
                            error={touched.company ? errors.company : undefined}
                        />

                        <div className="space-y-2">
                            <label htmlFor="country" className="block text-sm font-medium text-neutral-700">
                                Country <span className="text-error-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                                    <Globe size={18} />
                                </div>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`w-full text-sm pl-10 pr-4 py-3 border rounded-xl bg-white hover:border-neutral-400 focus:ring-2 focus:outline-none transition-all duration-200 ${touched.country && errors.country
                                        ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                                        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                        }`}
                                >
                                    <option value="">Select a country</option>
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            {touched.country && errors.country && (
                                <p className="text-sm text-error-600 flex items-center gap-1">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.country}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div>
                    <h3 className="text-sm font-medium text-neutral-900 mb-4">Account Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div className="space-y-2">
                            <label htmlFor="role" className="block text-sm font-medium text-neutral-700">
                                Role <span className="text-error-500 ml-1">*</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full text-sm px-4 py-3 border rounded-xl bg-white hover:border-neutral-400 focus:ring-2 focus:outline-none transition-all duration-200 ${touched.role && errors.role
                                    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                                    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                    }`}
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            {touched.role && errors.role && (
                                <p className="text-sm text-error-600 flex items-center gap-1">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        <Input
                            type="number"
                            id="credits"
                            name="credits"
                            label="Credits"
                            placeholder="Enter credits"
                            value={formData.credits}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            min="0"
                            error={touched.credits ? errors.credits : undefined}
                        />

                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-medium text-neutral-700">
                                Status <span className="text-error-500 ml-1">*</span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full text-sm px-4 py-3 border rounded-xl bg-white hover:border-neutral-400 focus:ring-2 focus:outline-none transition-all duration-200 ${touched.status && errors.status
                                    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                                    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                    }`}
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            {touched.status && errors.status && (
                                <p className="text-sm text-error-600 flex items-center gap-1">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.status}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subscription Information */}
                <div>
                    <h3 className="text-sm font-medium text-neutral-900 mb-4">Subscription Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <Input
                            type="date"
                            id="subscription_start_date"
                            name="subscription_start_date"
                            label="Subscription Start Date"
                            value={formData.subscription_start_date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Select start date"
                            error={touched.subscription_start_date ? errors.subscription_start_date : undefined}
                        />

                        <Input
                            type="date"
                            id="subscription_end_date"
                            name="subscription_end_date"
                            label="Subscription End Date"
                            value={formData.subscription_end_date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Select end date"
                            error={touched.subscription_end_date ? errors.subscription_end_date : undefined}
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (user ? 'Update User' : 'Create User')}
                    </Button>
                </div>
            </form>
        </>
    );
};

export default UserCreationForm; 