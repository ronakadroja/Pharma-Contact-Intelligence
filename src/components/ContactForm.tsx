import { useState } from 'react';
import { addContact, updateContact } from '../api/contacts';
import { useToast } from '../context/ToastContext';
import type { Contact, ContactPayload } from '../api/contacts';

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
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
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
        person_linked_url: contact?.person_linked_url || '',
        company_linkedin_url: contact?.company_linked_url || '',
        company_website: contact?.company_website || '',
        status: contact?.status || 'Active'
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
            const contactPayload: ContactPayload = {
                ...formData
            };

            if (contact) {
                await updateContact(contact.id, contactPayload);
                showToast('Contact updated successfully', 'success');
            } else {
                await addContact(contactPayload);
                showToast('Contact added successfully', 'success');
            }

            onSuccess?.();
        } catch (error) {
            showToast(error instanceof Error ? error.message : `Failed to ${contact ? 'update' : 'add'} contact`, 'error');
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
                                    required
                                    placeholder="Enter company name"
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
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
                                    required
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select company type</option>
                                    {COMPANY_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
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
                                    placeholder="Enter company website"
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
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
                                    placeholder="Enter company LinkedIn URL"
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
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
                                    required
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
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
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter phone number"
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="person_linked_url" className="block text-sm font-medium text-gray-700">
                                    LinkedIn URL
                                </label>
                                <input
                                    type="url"
                                    id="person_linked_url"
                                    name="person_linked_url"
                                    value={formData.person_linked_url}
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
                                    required
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
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
                                    required
                                    placeholder="Enter designation"
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
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
                                    required
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
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
                                    Reference Source <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="reference"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleChange}
                                    required
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
                                    required
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
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
                        {isLoading ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm; 