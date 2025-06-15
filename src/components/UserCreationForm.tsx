import { useState } from 'react';
import { createUser, updateUser } from '../api/auth';
import { useToast } from '../context/ToastContext';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types/auth';
import { encodePassword } from '../utils/auth';

interface UserCreationFormProps {
    user?: User | null;  // Allow null value
    onSuccess?: () => void;
    onCancel?: () => void;
}

const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Japan'];
const ROLES = ['User', 'Admin'];

const UserCreationForm = ({ user, onSuccess, onCancel }: UserCreationFormProps) => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateUserPayload>({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        phone_number: user?.phone_number || '',
        company: user?.company || '',
        country: user?.country || '',
        credits: user?.credits.toString() || '0',
        role: user?.role || 'User'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (user) {
                // Edit mode
                const updateData: UpdateUserPayload = {
                    name: formData.name,
                    email: formData.email,
                    phone_number: formData.phone_number,
                    company: formData.company,
                    country: formData.country,
                    role: formData.role,
                    credits: formData.credits
                };

                // Only include password if it was changed
                if (formData.password) {
                    updateData.password = encodePassword(formData.password);
                }

                await updateUser(user.id, updateData);
                showToast('User updated successfully', 'success');
            } else {
                // Create mode
                const userData = {
                    ...formData,
                    password: encodePassword(formData.password)
                };
                await createUser(userData);
                showToast('User created successfully', 'success');
            }

            if (!user) {
                // Only reset form in create mode
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone_number: '',
                    company: '',
                    country: '',
                    credits: '0',
                    role: 'User'
                });
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
            <div className="p-6 pb-0">
                <h2 className="text-xl font-semibold text-gray-900">{user ? 'Edit User' : 'Create New User'}</h2>
                <p className="mt-1 text-sm text-gray-600">
                    {user ? 'Update the user information below.' : 'Fill in the information below to create a new user account.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
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
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password {!user && <span className="text-red-500">*</span>}
                            {user && <span className="text-sm text-gray-500">(leave blank to keep current)</span>}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!user}
                            placeholder={user ? "Enter new password (optional)" : "Enter password"}
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
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
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

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
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a country</option>
                            {COUNTRIES.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

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
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                            {user ? 'Credits' : 'Initial Credits'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="credits"
                            name="credits"
                            value={formData.credits}
                            onChange={handleChange}
                            required
                            min="0"
                            placeholder="Enter credits"
                            className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {user ? 'Updating User...' : 'Creating User...'}
                            </>
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