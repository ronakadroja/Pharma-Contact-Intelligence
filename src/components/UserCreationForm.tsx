import { useState, useEffect } from 'react';
import { createUser, updateUser } from '../api/auth';
import { useToast } from '../context/ToastContext';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types/auth';
import { encodePassword } from '../utils/auth';
import { X, User as UserIcon, Mail, Phone, Building, Globe } from 'lucide-react';
import { Button, Card, Input } from './ui/design-system';

interface UserWithStatus extends User {
    status: 'Active' | 'Inactive';
}

interface UserCreationFormProps {
    user?: UserWithStatus | null;
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
    status: 'Active'
};

const UserCreationForm = ({ user, onSuccess, onCancel }: UserCreationFormProps) => {
    const { success, error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateUserPayload>(DEFAULT_FORM_STATE);

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
                status: user.status
            });
        } else {
            setFormData(DEFAULT_FORM_STATE);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        setFormData(DEFAULT_FORM_STATE);
        onCancel?.();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                            onClick: () => setFormData(DEFAULT_FORM_STATE),
                            variant: 'primary'
                        }
                    ]
                });
                setFormData(DEFAULT_FORM_STATE);
            }

            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : `Failed to ${user ? 'update' : 'create'} user`;
            showError(errorMessage, {
                title: 'Error',
                persistent: true,
                actions: [
                    {
                        label: 'Try Again',
                        onClick: () => {
                            const form = document.querySelector('form');
                            if (form) {
                                const event = new Event('submit', { bubbles: true, cancelable: true });
                                form.dispatchEvent(event);
                            }
                        },
                        variant: 'primary'
                    }
                ]
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
                            required
                            placeholder="Enter full name"
                            leftIcon={<UserIcon size={18} />}
                        />

                        <Input
                            type="email"
                            id="email"
                            name="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter email address"
                            leftIcon={<Mail size={18} />}
                        />

                        <Input
                            type="password"
                            id="password"
                            name="password"
                            label={`Password ${!user ? '*' : ''}`}
                            value={formData.password}
                            onChange={handleChange}
                            required={!user}
                            placeholder={user ? "Enter new password (optional)" : "Enter password"}
                            hint={user ? "Leave blank to keep current password" : undefined}
                        />

                        <Input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            label="Phone Number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                            placeholder="Enter phone number"
                            leftIcon={<Phone size={18} />}
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
                            required
                            placeholder="Enter company name"
                            leftIcon={<Building size={18} />}
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
                                    required
                                    className="w-full text-sm pl-10 pr-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
                                >
                                    <option value="">Select a country</option>
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
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
                                required
                                className="w-full text-sm px-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            type="number"
                            id="credits"
                            name="credits"
                            label="Credits"
                            placeholder="Enter credits"
                            value={formData.credits}
                            onChange={handleChange}
                            required
                            min="0"
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
                                required
                                className="w-full text-sm px-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
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