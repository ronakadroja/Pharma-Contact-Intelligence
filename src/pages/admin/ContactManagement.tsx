import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Download, Pencil, Plus, Trash2, Upload, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    deleteContact,
    getContacts,
    revealContact,
    updateContactStatus,
    bulkImportContacts,
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    const fetchContacts = async (page: number = 1, resetFilters: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const searchParamsToSend = Object.fromEntries(
                Object.entries(resetFilters ? {} : searchParams).filter(([_, value]) => value && value.trim() !== '')
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

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                showToast('Bulk upload started. Processing file...', 'info');
                const response = await bulkImportContacts(file);

                // Handle file validation error
                if (response.file) {
                    showToast(response.file[0], 'error');
                    return;
                }

                // Handle successful import with or without errors
                if (response.success !== undefined) {
                    if (response.failure === 0) {
                        // Complete success case
                        showToast(`Successfully imported all ${response.success} contacts`, 'success');
                    } else {
                        // Partial success case with errors
                        showToast(
                            `Imported ${response.success} contacts with ${response.failure} failures. Check error details below.`,
                            'warning'
                        );

                        // If there are specific errors, show them in separate toasts
                        if (response.erros && response.erros.length > 0) {
                            response.erros.forEach(error => {
                                const errorMessage = `Row ${error.row}: ${error.message.includes('SQLSTATE[23000]')
                                    ? `Missing required field: ${error.message.match(/Column '(.+?)' cannot/)?.[1] || 'unknown field'}`
                                    : error.message
                                    }`;
                                showToast(errorMessage, 'error');
                            });
                        }
                    }

                    // Refresh the contacts list after import
                    fetchContacts(currentPage);
                }
            } catch (error) {
                showToast(
                    error instanceof Error ? error.message : 'Failed to import contacts',
                    'error'
                );
            } finally {
                // Reset the file input
                e.target.value = '';
            }
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

            {/* Filter Toggle Button */}
            <div className="mb-4">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                    <Filter className={`h-4 w-4 mr-2 ${isFilterOpen ? 'text-blue-600' : 'text-gray-500'}`} />
                    Filters
                    {isFilterOpen ? (
                        <ChevronUp className="ml-2 h-4 w-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                    )}
                    {Object.values(searchParams).some(param => param !== '') && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {Object.values(searchParams).filter(param => param !== '').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search Form */}
            <div className={`mb-6 transition-all duration-300 ease-in-out ${isFilterOpen ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">Filter Contacts</h3>
                        <p className="mt-1 text-sm text-gray-500">Use the filters below to find specific contacts</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                                    Company Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="company_name"
                                        placeholder="Enter company name"
                                        className="block w-full pl-10 py-3 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
                                        value={searchParams.company_name}
                                        onChange={(e) => setSearchParams(prev => ({
                                            ...prev,
                                            company_name: e.target.value.trim()
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                    Designation
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="designation"
                                        placeholder="Enter designation"
                                        className="block w-full pl-10 py-3 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
                                        value={searchParams.designation}
                                        onChange={(e) => setSearchParams(prev => ({
                                            ...prev,
                                            designation: e.target.value.trim()
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                    Country
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="country"
                                        placeholder="Enter country"
                                        className="block w-full pl-10 py-3 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
                                        value={searchParams.person_country}
                                        onChange={(e) => setSearchParams(prev => ({
                                            ...prev,
                                            person_country: e.target.value.trim()
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="city"
                                        placeholder="Enter city"
                                        className="block w-full pl-10 py-3 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
                                        value={searchParams.city}
                                        onChange={(e) => setSearchParams(prev => ({
                                            ...prev,
                                            city: e.target.value.trim()
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setSearchParams({
                                        company_name: '',
                                        designation: '',
                                        person_country: '',
                                        city: ''
                                    });
                                    fetchContacts(1, true);
                                    showToast('All filters have been cleared', 'success');
                                }}
                                className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentPage(1);
                                    fetchContacts(1);
                                    setIsFilterOpen(false);
                                }}
                                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Selected Items Banner */}
            <div className="hidden sm:block mb-4">
                {Object.entries(selectedRows).filter(([_, selected]) => selected).length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
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
            </div>

            {/* Contact Table Container */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Mobile Selected Items Banner */}
                <div className="block sm:hidden">
                    {Object.entries(selectedRows).filter(([_, selected]) => selected).length > 0 && (
                        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-700">
                                        {Object.entries(selectedRows).filter(([_, selected]) => selected).length} contacts selected
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <select
                                        onChange={(e) => handleBulkStatusClick(e.target.value as 'Active' | 'Inactive')}
                                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value=""
                                    >
                                        <option value="">Change Status</option>
                                        <option value="Active">Set Active</option>
                                        <option value="Inactive">Set Inactive</option>
                                    </select>
                                    <button
                                        onClick={handleBulkDeleteClick}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
                                    >
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Wrapper */}
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden">
                            <div className="min-w-full divide-y divide-gray-200">
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Responsive Pagination */}
                {contactsData && contactsData.last_page > 1 && (
                    <div className="border-t border-gray-200">
                        <div className="px-4 py-3 sm:px-6">
                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                                <div className="text-sm text-gray-700 text-center sm:text-left">
                                    Showing page {currentPage} of {contactsData.last_page}
                                </div>
                                <div className="w-full sm:w-auto flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={contactsData.last_page}
                                        onPageChange={setCurrentPage}
                                        totalItems={contactsData.total}
                                        pageSize={10}
                                        showTotalItems={true}
                                    />
                                </div>
                            </div>
                        </div>
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