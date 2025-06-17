import { useState, useEffect } from 'react';
import { createUser, updateUser } from '../api/auth';
import { useToast } from '../context/ToastContext';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types/auth';
import { encodePassword } from '../utils/auth';
import { X } from 'lucide-react';

interface UserWithStatus extends User {
    status: 'Active' | 'Deactive';
}

interface UserCreationFormProps {
    user?: UserWithStatus | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Japan'];
const ROLES = ['User', 'Admin'];
const STATUS_OPTIONS = ['Active', 'Deactive'];

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
    const { showToast } = useToast();
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
                showToast('User updated successfully', 'success');
            } else {
                // Create mode - send all required fields
                const createData: CreateUserPayload = {
                    ...formData,
                    password: encodePassword(formData.password)
                };

                await createUser(createData);
                showToast('User created successfully', 'success');
                setFormData(DEFAULT_FORM_STATE);
            }

            onSuccess?.();
        } catch (error) {
            showToast(error instanceof Error ? error.message : `Failed to ${user ? 'update' : 'create'} user`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user ? 'Edit User' : 'Create New User'}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {user ? 'Update the user information below.' : 'Fill in the information below to create a new user account.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-2 text-gray-400 hover:text-gray-500"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter full name"
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
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
                                required
                                placeholder="Enter email address"
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password {!user && <span className="text-red-500">*</span>}
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!user}
                                    placeholder={user ? "Enter new password (optional)" : "Enter password"}
                                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                />
                                {user && (
                                    <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                placeholder="Enter phone number"
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Company Information */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                required
                                placeholder="Enter company name"
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="">Select a country</option>
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Account Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                                Credits <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="credits"
                                name="credits"
                                placeholder="Enter credits"
                                value={formData.credits}
                                onChange={handleChange}
                                required
                                min="0"
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
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
                                required
                                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            user ? 'Update User' : 'Create User'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserCreationForm; 