import { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Contact {
    id: string;
    companyName: string;
    personName: string;
    email: string;
    mobile?: string;
    country: string;
    city?: string;
    department: string;
    designation: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

// Mock data - Replace with API calls in production
const initialContacts: Contact[] = [
    {
        id: '1',
        companyName: 'Pharma Corp',
        personName: 'John Smith',
        email: 'john@pharmaco.com',
        mobile: '+1234567890',
        country: 'USA',
        city: 'New York',
        department: 'Sales',
        designation: 'Sales Manager',
        status: 'active',
        createdAt: '2024-03-15'
    },
    {
        id: '2',
        companyName: 'MediTech',
        personName: 'Sarah Johnson',
        email: 'sarah@meditech.com',
        country: 'UK',
        city: 'London',
        department: 'Purchase',
        designation: 'Procurement Lead',
        status: 'active',
        createdAt: '2024-03-14'
    }
];

const departments = ['Sales', 'Purchase', 'Supply Chain', 'Marketing', 'R&D'];
const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'India'];

const ContactManagement = () => {
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [formData, setFormData] = useState({
        companyName: '',
        personName: '',
        email: '',
        mobile: '',
        country: '',
        city: '',
        department: '',
        designation: '',
    });
    const { showToast } = useToast();

    const handleAddContact = () => {
        setSelectedContact(null);
        setFormData({
            companyName: '',
            personName: '',
            email: '',
            mobile: '',
            country: '',
            city: '',
            department: '',
            designation: '',
        });
        setShowModal(true);
    };

    const handleEditContact = (contact: Contact) => {
        setSelectedContact(contact);
        setFormData({
            companyName: contact.companyName,
            personName: contact.personName,
            email: contact.email,
            mobile: contact.mobile || '',
            country: contact.country,
            city: contact.city || '',
            department: contact.department,
            designation: contact.designation,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedContact) {
            // Edit existing contact
            setContacts(contacts.map(contact =>
                contact.id === selectedContact.id
                    ? { ...contact, ...formData }
                    : contact
            ));
            showToast('Contact updated successfully', 'success');
        } else {
            // Add new contact
            const newContact: Contact = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData,
                status: 'active',
                createdAt: new Date().toISOString().split('T')[0]
            };
            setContacts([...contacts, newContact]);
            showToast('Contact added successfully', 'success');
        }
        setShowModal(false);
    };

    const handleDeleteContact = (contactId: string) => {
        if (confirm('Are you sure you want to delete this contact?')) {
            setContacts(contacts.filter(contact => contact.id !== contactId));
            showToast('Contact deleted successfully', 'success');
        }
    };

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real application, you would handle the file upload here
            // For now, we'll just show a success message
            showToast('Bulk upload started. Processing file...', 'info');
            setTimeout(() => {
                showToast('Contacts imported successfully', 'success');
            }, 2000);
        }
    };

    const handleExportContacts = () => {
        // In a real application, you would generate and download a CSV file
        // For now, we'll just show a success message
        showToast('Exporting contacts...', 'info');
        setTimeout(() => {
            showToast('Contacts exported successfully', 'success');
        }, 1000);
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Contact Management</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage pharmaceutical industry contacts
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportContacts}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        <Download size={20} />
                        Export
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                        <Upload size={20} />
                        Bulk Upload
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={handleBulkUpload}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={handleAddContact}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Contact Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact Person
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email/Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{contact.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{contact.personName}</div>
                                        <div className="text-sm text-gray-500">{contact.designation}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{contact.email}</div>
                                        {contact.mobile && (
                                            <div className="text-sm text-gray-500">{contact.mobile}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{contact.country}</div>
                                        {contact.city && (
                                            <div className="text-sm text-gray-500">{contact.city}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{contact.department}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => handleEditContact(contact)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContact(contact.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Contact Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedContact ? 'Edit Contact' : 'Add New Contact'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="personName" className="block text-sm font-medium text-gray-700">
                                        Contact Person Name
                                    </label>
                                    <input
                                        type="text"
                                        id="personName"
                                        value={formData.personName}
                                        onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                        Country
                                    </label>
                                    <select
                                        id="country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        id="designation"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    {selectedContact ? 'Update' : 'Add'} Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManagement; 