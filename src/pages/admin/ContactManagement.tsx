import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Download, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    deleteContact,
    getContacts,
    revealContact,
    updateContactStatus,
    type Contact,
    type ContactsResponse
} from '../../api/contacts';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import ContactForm from '../../components/ContactForm';
import Pagination from "../../components/Pagination";
import Table from "../../components/Table";
import { useToast } from '../../context/ToastContext';

interface ContactFormData {
    companyName: string;
    personName: string;
    email: string;
    mobile?: string;
    country: string;
    city?: string;
    department: string;
    designation: string;
}

const departments = ['Sales', 'Purchase', 'Supply Chain', 'Marketing', 'R&D'];
const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'India'];

const ContactManagement = () => {
    const [contactsData, setContactsData] = useState<ContactsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useState({
        company_name: '',
        designation: '',
        person_country: '',
        city: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [formData, setFormData] = useState<ContactFormData>({
        companyName: '',
        personName: '',
        email: '',
        mobile: '',
        country: '',
        city: '',
        department: '',
        designation: '',
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const { showToast } = useToast();
    const [error, setError] = useState<string | null>(null);
    const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false);
    const [showBulkStatusConfirmation, setShowBulkStatusConfirmation] = useState(false);
    const [bulkStatusToSet, setBulkStatusToSet] = useState<'Active' | 'Inactive' | null>(null);

    const columns: ColumnDef<Contact>[] = [
        {
            accessorKey: 'company_name',
            header: 'Company',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{row.original.company_name}</div>
                    {row.original.company_website && (
                        <div className="text-sm text-gray-500">{row.original.company_website}</div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'person_name',
            header: 'Contact Person',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm text-gray-900">{row.original.person_name}</div>
                    <div className="text-sm text-gray-500">{row.original.designation}</div>
                </div>
            ),
        },
        {
            accessorKey: 'location',
            header: 'Location',
            cell: ({ row }) => (
                <div className="text-sm text-gray-900">
                    {row.original.city}, {row.original.person_country}
                </div>
            ),
        },
        {
            accessorKey: 'department',
            header: 'Department',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm text-gray-900">{row.original.department}</div>
                    <div className="text-sm text-gray-500">{row.original.company_type}</div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.original.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {row.original.status}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEditContact(row.original)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.original)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const fetchContacts = async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            // Only include search params that have values
            const searchParamsToSend = Object.fromEntries(
                Object.entries(searchParams).filter(([_, value]) => value.trim() !== '')
            );

            const response = await getContacts({
                ...searchParamsToSend,
                page,
                per_page: 10
            });
            setContactsData(response);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            let errorMessage = 'Failed to fetch contacts';

            // Handle validation errors
            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response?: { status: number; data?: any } };
                if (responseError.response?.status === 422) {
                    errorMessage = 'Invalid search parameters. Please check your input.';
                }
            }

            showToast(errorMessage, 'error');
            setError(errorMessage);
            setContactsData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts(currentPage);
    }, [currentPage]);

    const handleSearch = async () => {
        setCurrentPage(1);
        await fetchContacts(1);
    };

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
            companyName: contact.company_name,
            personName: contact.person_name,
            email: '', // Add these fields when available in the API
            mobile: '',
            country: contact.person_country,
            city: contact.city,
            department: contact.department,
            designation: contact.designation,
        });
        setShowModal(true);
    };

    const handleDeleteClick = (contact: Contact) => {
        setContactToDelete(contact);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        if (!contactToDelete) return;

        try {
            await deleteContact(contactToDelete.id);
            showToast('Contact deleted successfully', 'success');
            fetchContacts(currentPage);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete contact', 'error');
        } finally {
            setShowDeleteConfirmation(false);
            setContactToDelete(null);
        }
    };

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // TODO: Implement API integration for bulk upload
            showToast('Bulk upload started. Processing file...', 'info');
        }
    };

    const handleExportContacts = () => {
        // TODO: Implement API integration for export
        showToast('Exporting contacts...', 'info');
    };

    const handleFormSuccess = () => {
        setShowModal(false);
        setSelectedContact(null);
        fetchContacts(currentPage);
    };

    const handleBulkDeleteClick = () => {
        setShowBulkDeleteConfirmation(true);
    };

    const handleBulkDeleteConfirm = async () => {
        try {
            const selectedIds = Object.entries(selectedRows)
                .filter(([_, selected]) => selected)
                .map(([id]) => id);
            await Promise.all(selectedIds.map(id => deleteContact(id)));
            showToast(`Successfully deleted ${selectedIds.length} contacts`, 'success');
            setSelectedRows({});
            fetchContacts(currentPage);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete contacts', 'error');
        } finally {
            setShowBulkDeleteConfirmation(false);
        }
    };

    const handleBulkStatusClick = (status: 'Active' | 'Inactive') => {
        setBulkStatusToSet(status);
        setShowBulkStatusConfirmation(true);
    };

    const handleBulkStatusConfirm = async () => {
        if (!bulkStatusToSet) return;
        try {
            const selectedIds = Object.entries(selectedRows)
                .filter(([_, selected]) => selected)
                .map(([id]) => id);
            await Promise.all(selectedIds.map(id => updateContactStatus(id, bulkStatusToSet)));
            showToast(`Successfully updated status for ${selectedIds.length} contacts`, 'success');
            setSelectedRows({});
            fetchContacts(currentPage);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to update contact status', 'error');
        } finally {
            setShowBulkStatusConfirmation(false);
            setBulkStatusToSet(null);
        }
    };

    const handleRevealContact = async (contact: Contact) => {
        try {
            await revealContact(contact.id);
            showToast('Contact information revealed successfully', 'success');
            fetchContacts(currentPage); // Refresh the contacts list
        } catch (error) {
            console.error('Error revealing contact:', error);
            showToast('Failed to reveal contact information', 'error');
        }
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

            {/* Search Form */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Company Name"
                        className="border rounded px-3 py-2"
                        value={searchParams.company_name}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            company_name: e.target.value.trim()
                        }))}
                    />
                    <input
                        type="text"
                        placeholder="Designation"
                        className="border rounded px-3 py-2"
                        value={searchParams.designation}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            designation: e.target.value.trim()
                        }))}
                    />
                    <input
                        type="text"
                        placeholder="Country"
                        className="border rounded px-3 py-2"
                        value={searchParams.person_country}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            person_country: e.target.value.trim()
                        }))}
                    />
                    <input
                        type="text"
                        placeholder="City"
                        className="border rounded px-3 py-2"
                        value={searchParams.city}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            city: e.target.value.trim()
                        }))}
                    />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setSearchParams({
                                company_name: '',
                                designation: '',
                                person_country: '',
                                city: ''
                            });
                            fetchContacts(1);
                        }}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => {
                            setCurrentPage(1);
                            fetchContacts(1);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>
            </div>

            {Object.entries(selectedRows).filter(([_, selected]) => selected).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between mb-4">
                    <span className="text-sm text-blue-700">
                        {Object.entries(selectedRows).filter(([_, selected]) => selected).length} contacts selected
                    </span>
                    <div className="flex gap-2">
                        <select
                            onChange={(e) => handleBulkStatusClick(e.target.value as 'Active' | 'Inactive')}
                            className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value=""
                        >
                            <option value="">Change Status</option>
                            <option value="Active">Set Active</option>
                            <option value="Inactive">Set Inactive</option>
                        </select>
                        <button
                            onClick={handleBulkDeleteClick}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Contact Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <Table
                    data={contactsData?.data || []}
                    columns={columns}
                    isLoading={loading}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    enableSelection={true}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    emptyStateMessage="No contacts found. Try adjusting your filters or search terms."
                />

                {contactsData && contactsData.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 px-4 py-3">
                        <div className="text-sm text-gray-500">
                            Showing page {currentPage} of {contactsData.last_page}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={contactsData.last_page}
                            onPageChange={setCurrentPage}
                            totalItems={contactsData.total}
                            pageSize={10}
                            showTotalItems={true}
                        />
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirmation}
                title="Delete Contact"
                message={`Are you sure you want to delete ${contactToDelete?.person_name}'s contact information? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmVariant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setShowDeleteConfirmation(false);
                    setContactToDelete(null);
                }}
            />

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showBulkDeleteConfirmation}
                title="Delete Multiple Contacts"
                message={`Are you sure you want to delete ${Object.entries(selectedRows).filter(([_, selected]) => selected).length} contacts? This action cannot be undone.`}
                confirmLabel="Delete All"
                cancelLabel="Cancel"
                confirmVariant="danger"
                onConfirm={handleBulkDeleteConfirm}
                onCancel={() => setShowBulkDeleteConfirmation(false)}
            />

            {/* Bulk Status Change Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showBulkStatusConfirmation}
                title="Update Contact Status"
                message={`Are you sure you want to set ${Object.entries(selectedRows).filter(([_, selected]) => selected).length} contacts to ${bulkStatusToSet} status?`}
                confirmLabel="Update All"
                cancelLabel="Cancel"
                confirmVariant="warning"
                onConfirm={handleBulkStatusConfirm}
                onCancel={() => {
                    setShowBulkStatusConfirmation(false);
                    setBulkStatusToSet(null);
                }}
            />

            {/* Add/Edit Contact Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <ContactForm
                                contact={selectedContact}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setShowModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManagement; 