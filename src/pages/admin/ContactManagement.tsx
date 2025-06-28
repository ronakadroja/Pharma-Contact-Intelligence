import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Download, Pencil, Plus, Trash2, Upload, Filter, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import {
    deleteContact,
    getContacts,
    revealContact,
    updateContactStatus,
    bulkImportContacts,
    type Contact
} from '../../api/contacts';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import ContactForm from '../../components/ContactForm';
import Table from "../../components/Table";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { useToast } from '../../context/ToastContext';
import { Button, Card, Input, Badge } from '../../components/ui/design-system';

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
    // Infinite scroll state management
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
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
    const { success, error: showError } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false);
    const [showBulkStatusConfirmation, setShowBulkStatusConfirmation] = useState(false);
    const [bulkStatusToSet, setBulkStatusToSet] = useState<'Active' | 'Inactive' | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Infinite scroll hook
    const loadMoreContacts = async () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await fetchContacts(nextPage, false, true);
    };

    const { isLoadingMore, containerRef } = useInfiniteScroll(
        loadMoreContacts,
        {
            threshold: 500, // Increased threshold to trigger earlier
            enabled: !loading && hasMoreData,
            isLoading: loading,
            hasMore: hasMoreData
        }
    );



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
                <Badge variant={row.original.status === 'Active' ? 'success' : 'error'} size="sm">
                    {row.original.status}
                </Badge>
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

    const fetchContacts = async (page: number = 1, resetFilters: boolean = false, isLoadMore: boolean = false) => {
        try {
            // Only show main loading for initial load or filter changes
            if (!isLoadMore) {
                setLoading(true);
            }
            setError(null);

            const searchParamsToSend = Object.fromEntries(
                Object.entries(resetFilters ? {} : searchParams).filter(([_, value]) => value && value.trim() !== '')
            );

            const response = await getContacts({
                ...searchParamsToSend,
                page,
                per_page: 10
            });

            // Handle cumulative data for infinite scroll
            if (isLoadMore) {
                // Append new data to existing data
                setAllContacts(prevContacts => [...prevContacts, ...response.data]);
            } else {
                // Replace data for initial load or filter changes
                setAllContacts(response.data);
                setCurrentPage(1);
            }

            // Update pagination state
            setTotalItems(response.total);
            setHasMoreData(response.current_page < response.last_page);

        } catch (error) {
            console.error('Error fetching contacts:', error);
            let errorMessage = 'Failed to fetch contacts';

            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response?: { status: number; data?: any } };
                if (responseError.response?.status === 422) {
                    errorMessage = 'Invalid search parameters. Please check your input.';
                }
            }

            showError(errorMessage, {
                title: 'Search Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
            setError(errorMessage);
            if (!isLoadMore) {
                setAllContacts([]);
                setTotalItems(0);
                setHasMoreData(false);
            }
        } finally {
            if (!isLoadMore) {
                setLoading(false);
            }
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchContacts(1, false, false);
    }, []);

    // Fetch when search params change (reset infinite scroll)
    useEffect(() => {
        const hasActiveFilters = Object.values(searchParams).some(value => value !== '');
        const isClearing = Object.values(searchParams).every(value => value === '');

        if (hasActiveFilters || isClearing) {
            // Reset infinite scroll state
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
        }
    }, [searchParams]);


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
            success('Contact deleted successfully!', {
                title: 'Deleted'
            });
            // Reset infinite scroll and reload data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Failed to delete contact', {
                title: 'Delete Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
        } finally {
            setShowDeleteConfirmation(false);
            setContactToDelete(null);
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Bulk upload triggered', e.target.files);
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            try {
                success('Bulk upload started. Processing file...', {
                    title: 'Upload Started',
                    showProgress: false
                });
                const response = await bulkImportContacts(file);

                // Handle file validation error
                if (response.file && Array.isArray(response.file) && response.file.length > 0) {
                    showError(response.file[0], {
                        title: 'File Validation Error',
                        duration: 8000 // Auto-close after 8 seconds
                    });
                    return;
                } else if (response.file && typeof response.file === 'string') {
                    showError(response.file, {
                        title: 'File Validation Error',
                        duration: 8000 // Auto-close after 8 seconds
                    });
                    return;
                }

                // Handle successful import with or without errors
                if (response.success !== undefined) {
                    if (response.failure === 0) {
                        // Complete success case
                        success(`Successfully imported all ${response.success} contacts!`, {
                            title: 'Import Complete'
                        });
                    } else {
                        // Partial success case with errors
                        showError(
                            `Imported ${response.success} contacts with ${response.failure} failures. Check error details below.`,
                            {
                                title: 'Partial Import',
                                duration: 10000 // Auto-close after 10 seconds for important info
                            }
                        );

                        // If there are specific errors, show them in separate toasts
                        if (response.erros && response.erros.length > 0) {
                            response.erros.forEach(error => {
                                const errorMessage = `Row ${error.row}: ${error.message.includes('SQLSTATE[23000]')
                                    ? `Missing required field: ${error.message.match(/Column '(.+?)' cannot/)?.[1] || 'unknown field'}`
                                    : error.message
                                    }`;
                                showError(errorMessage, {
                                    title: 'Import Error',
                                    duration: 8000 // Auto-close after 8 seconds
                                });
                            });
                        }
                    }

                    // Refresh the contacts list after import
                    setCurrentPage(1);
                    setAllContacts([]);
                    setHasMoreData(true);
                    fetchContacts(1, false, false);
                }
            } catch (error: any) {
                showError(
                    error.file[0],
                    {
                        title: 'Import Failed',
                        duration: 8000 // Auto-close after 8 seconds
                    }
                );
            } finally {
                // Reset the file input
                e.target.value = '';
            }
        }
    };

    const handleExportContacts = () => {
        // TODO: Implement API integration for export
        success('Exporting contacts...', {
            title: 'Export Started',
            showProgress: false
        });
    };

    const handleBulkUploadClick = () => {
        console.log('Bulk upload button clicked');
        fileInputRef.current?.click();
    };

    const handleFormSuccess = () => {
        setShowModal(false);
        setSelectedContact(null);
        // Reset infinite scroll and reload data
        setCurrentPage(1);
        setAllContacts([]);
        setHasMoreData(true);
        fetchContacts(1, false, false);
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
            success(`Successfully deleted ${selectedIds.length} contacts!`, {
                title: 'Bulk Delete Complete'
            });
            setSelectedRows({});
            // Reset infinite scroll and reload data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Failed to delete contacts', {
                title: 'Bulk Delete Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
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
            success(`Successfully updated status for ${selectedIds.length} contacts!`, {
                title: 'Status Updated'
            });
            setSelectedRows({});
            // Reset infinite scroll and reload data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Failed to update contact status', {
                title: 'Status Update Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
        } finally {
            setShowBulkStatusConfirmation(false);
            setBulkStatusToSet(null);
        }
    };

    const handleRevealContact = async (contact: Contact) => {
        try {
            await revealContact(contact.id);
            success('Contact information revealed successfully!', {
                title: 'Contact Revealed'
            });
            // Reset infinite scroll and reload data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
        } catch (error) {
            console.error('Error revealing contact:', error);
            showError('Failed to reveal contact information', {
                title: 'Reveal Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
        }
    };

    return (
        <div className="space-y-6" ref={containerRef}>
            {/* Header Section */}
            <Card variant="elevated" padding="lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Contact Management</h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Manage pharmaceutical industry contacts
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                        <Button
                            variant="success"
                            onClick={handleExportContacts}
                            icon={<Download size={18} />}
                        >
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleBulkUpload}
                                className="hidden"
                                title="Upload CSV or Excel file"
                            />
                            <Button
                                onClick={handleBulkUploadClick}
                                icon={<Upload size={18} />}
                                type="button"
                            >
                                <span className="hidden sm:inline">Bulk Upload</span>
                            </Button>
                        </div>
                        <Button
                            onClick={handleAddContact}
                            icon={<Plus size={18} />}
                        >
                            <span className="hidden sm:inline">Add Contact</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Search and Filter Section */}
            <Card variant="elevated" padding="none">
                <div className="p-6 border-b border-neutral-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={searchParams.company_name || ''}
                                onChange={e => setSearchParams(prev => ({
                                    ...prev,
                                    company_name: e.target.value
                                }))}
                                placeholder="Search contacts by company name..."
                                leftIcon={
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                }
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                icon={<Filter className="h-4 w-4" />}
                            >
                                Filters
                                {Object.values(searchParams).some(param => param !== '') && (
                                    <Badge variant="primary" size="sm" className="ml-2">
                                        {Object.values(searchParams).filter(param => param !== '').length}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                {isFilterOpen && (
                    <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label="Designation"
                                type="text"
                                value={searchParams.designation}
                                onChange={(e) => setSearchParams(prev => ({
                                    ...prev,
                                    designation: e.target.value
                                }))}
                                placeholder="Enter designation"
                                leftIcon={
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                }
                            />
                            <Input
                                label="Country"
                                type="text"
                                value={searchParams.person_country}
                                onChange={(e) => setSearchParams(prev => ({
                                    ...prev,
                                    person_country: e.target.value
                                }))}
                                placeholder="Enter country"
                                leftIcon={
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                                    </svg>
                                }
                            />
                            <Input
                                label="City"
                                type="text"
                                value={searchParams.city}
                                onChange={(e) => setSearchParams(prev => ({
                                    ...prev,
                                    city: e.target.value
                                }))}
                                placeholder="Enter city"
                                leftIcon={
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                }
                            />
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchParams({
                                        company_name: '',
                                        designation: '',
                                        person_country: '',
                                        city: ''
                                    });
                                    setCurrentPage(1);
                                    setAllContacts([]);
                                    setHasMoreData(true);
                                    fetchContacts(1, true, false);
                                    success('All filters have been cleared!', {
                                        title: 'Filters Cleared'
                                    });
                                }}
                            >
                                Clear Filters
                            </Button>
                            <Button
                                onClick={() => {
                                    setCurrentPage(1);
                                    setAllContacts([]);
                                    setHasMoreData(true);
                                    fetchContacts(1, false, false);
                                }}
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Desktop Selected Items Banner */}
            <div className="hidden sm:block">
                {Object.entries(selectedRows).filter(([_, selected]) => selected).length > 0 && (
                    <Card variant="elevated" padding="md" className="bg-primary-50 border-primary-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-primary-700 font-medium">
                                {Object.entries(selectedRows).filter(([_, selected]) => selected).length} contacts selected
                            </span>
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => handleBulkStatusClick(e.target.value as 'Active' | 'Inactive')}
                                    className="text-sm px-3 py-2 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
                                    value=""
                                >
                                    <option value="">Change Status</option>
                                    <option value="Active">Set Active</option>
                                    <option value="Inactive">Set Inactive</option>
                                </select>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleBulkDeleteClick}
                                >
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Contact Table Container */}
            <Card variant="elevated" padding="none" className="overflow-hidden">
                {/* Mobile Selected Items Banner */}
                <div className="block sm:hidden">
                    {Object.entries(selectedRows).filter(([_, selected]) => selected).length > 0 && (
                        <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-primary-700">
                                        {Object.entries(selectedRows).filter(([_, selected]) => selected).length} contacts selected
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <select
                                        onChange={(e) => handleBulkStatusClick(e.target.value as 'Active' | 'Inactive')}
                                        className="block w-full text-sm px-3 py-2 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
                                        value=""
                                    >
                                        <option value="">Change Status</option>
                                        <option value="Active">Set Active</option>
                                        <option value="Inactive">Set Inactive</option>
                                    </select>
                                    <Button
                                        variant="danger"
                                        onClick={handleBulkDeleteClick}
                                        className="w-full justify-center"
                                    >
                                        Delete Selected
                                    </Button>
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
                                    data={allContacts}
                                    columns={columns}
                                    isLoading={loading}
                                    sorting={sorting}
                                    onSortingChange={setSorting}
                                    enableSelection={true}
                                    selectedRows={selectedRows}
                                    onSelectionChange={setSelectedRows}
                                    enablePagination={false}
                                    emptyStateMessage="No contacts found. Try adjusting your filters or search terms."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Infinite scroll loading indicator */}
                {isLoadingMore && (
                    <div className="border-t border-gray-200 px-6 py-6">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="text-sm font-medium">Loading more contacts...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status information */}
                {!loading && allContacts.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700">
                                Showing {allContacts.length} of {totalItems} contacts
                                {!hasMoreData && allContacts.length > 10 && (
                                    <span className="ml-2 text-gray-500">(All contacts loaded)</span>
                                )}
                            </div>
                            {hasMoreData && (
                                <div className="text-sm text-gray-500">
                                    Scroll down to load more contacts
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>

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
                            <div className="absolute inset-0 bg-neutral-500 opacity-75 backdrop-blur-sm"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <ContactForm
                                contact={selectedContact}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setShowModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Scroll to top button */}
            <ScrollToTopButton threshold={300} />
        </div>
    );
};

export default ContactManagement; 