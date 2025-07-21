import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { CheckCircle, Filter, Linkedin, Pencil, Plus, Search, Trash2, Upload, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import {
    bulkImportContacts,
    deleteContact,
    getContacts,
    updateContactStatus,
    type Contact
} from '../../api/contacts';
import { fetchCompanies, fetchCountries, fetchDepartments, type CompanyOption } from '../../api/combo';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import ContactForm from '../../components/ContactForm';
import Table from "../../components/Table";
import { Button } from '../../components/ui/design-system';
import { useToast } from '../../context/ToastContext';
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const ITEMS_PER_PAGE = 10;

const ContactManagement = () => {
    // Infinite scroll state management
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false);
    const [showBulkStatusConfirmation, setShowBulkStatusConfirmation] = useState(false);
    const [bulkStatusToSet, setBulkStatusToSet] = useState<'Active' | 'Inactive' | null>(null);

    // Filter state - Updated for multiselect
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        company_name: [] as string[], // This will store company names
        department: [] as string[],
        person_country: [] as string[]
    });
    // Combo data state
    const [dropdownData, setDropdownData] = useState<{
        companies: CompanyOption[];
        departments: CompanyOption[];
        countries: CompanyOption[];
        isLoaded: boolean;
        isLoading: boolean;
    }>({
        companies: [],
        departments: [],
        countries: [],
        isLoaded: false,
        isLoading: false
    });
    // Track sidebar state from localStorage to sync with AdminLayout
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Ref to track if combo data loading has been initiated
    const comboLoadingInitiated = useRef(false);

    // Listen for sidebar state changes from AdminLayout
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('adminSidebarCollapsed');
            const newState = saved ? JSON.parse(saved) : false;
            setSidebarCollapsed(prevState => prevState !== newState ? newState : prevState);
        };

        // Listen for storage changes (when AdminLayout updates the state)
        window.addEventListener('storage', handleStorageChange);

        // Check for changes more efficiently - only when needed
        const interval = setInterval(handleStorageChange, 200);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);





    const columns: ColumnDef<Contact>[] = useMemo(() => [
        {
            accessorKey: 'company_name',
            header: 'Company',
            size: 200,
            cell: ({ row }) => (
                <div className="min-w-0 max-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                            {row.original.company_name}
                        </span>
                        {row.original.company_linkedin_url && (
                            <a
                                href={row.original.company_linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                                title="View Company LinkedIn"
                            >
                                <Linkedin size={14} />
                            </a>
                        )}
                    </div>
                    {row.original.company_website && (
                        <div className="text-xs text-blue-600 hover:text-blue-800 transition-colors truncate">
                            {row.original.company_website}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'person_name',
            header: 'Contact Person',
            size: 180,
            cell: ({ row }) => (
                <div className="min-w-0 max-w-[180px]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                            {row.original.person_name}
                        </span>
                        {row.original.person_linkedin_url && (
                            <a
                                href={row.original.person_linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                                title="View LinkedIn Profile"
                            >
                                <Linkedin size={14} />
                            </a>
                        )}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                        {row.original.designation}
                    </div>
                </div>
            ),
        },

        {
            accessorKey: 'is_verified',
            header: 'Status',
            size: 100,
            cell: ({ row }) => {
                const isVerified = row.original.is_verified === 1;
                return (
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${isVerified
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {isVerified ? (
                                <CheckCircle size={10} className="mr-1" />
                            ) : (
                                <XCircle size={10} className="mr-1" />
                            )}
                            {isVerified ? 'Verified' : 'Unverified'}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'location',
            header: 'Location',
            size: 150,
            cell: ({ row }) => (
                <div className="min-w-0 max-w-[150px]">
                    <div className="text-sm text-gray-900 truncate" title={`${row.original.city}, ${row.original.person_country}`}>
                        <span className="font-medium">{row.original.city}</span>
                        {row.original.city && row.original.person_country && ', '}
                        <span className="text-gray-600">{row.original.person_country}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'department',
            header: 'Department',
            size: 160,
            cell: ({ row }) => (
                <div className="min-w-0 max-w-[160px]">
                    <div className="text-sm font-semibold text-gray-900 truncate mb-1" title={row.original.department}>
                        {row.original.department}
                    </div>
                    <div className="text-xs text-gray-600 truncate" title={row.original.product_type}>
                        {row.original.product_type}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'product_type',
            header: 'Product Type',
            size: 140,
            cell: ({ row }) => (
                <div className="min-w-0 max-w-[140px]">
                    <div className="text-sm text-gray-900 truncate" title={row.original.product_type}>
                        {row.original.product_type}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'company_country',
            header: 'Company Country',
            size: 150,
            cell: ({ row }) => (
                <div className="min-w-0 max-w-[150px]">
                    <div className="text-sm text-gray-900 truncate" title={row.original.company_country}>
                        {row.original.company_country}
                    </div>
                </div>
            ),
        },

        {
            id: 'actions',
            header: 'Actions',
            size: 120,
            cell: ({ row }) => (
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => handleEditContact(row.original)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit contact"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.original)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete contact"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ], []);

    const fetchContacts = useCallback(async (page: number = 1, isLoadMore: boolean = false, showSuccessToast: boolean = false) => {
        try {
            // Only show main loading for initial load or filter changes
            if (!isLoadMore) {
                setIsLoading(true);
            }

            // Send arrays directly to API - axios will handle proper serialization
            const response = await getContacts({
                page,
                per_page: ITEMS_PER_PAGE,
                company_name: filters.company_name,
                department: filters.department,
                person_country: filters.person_country
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

            if (showSuccessToast) {
                showToast('Contact data loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast('Failed to fetch contacts', 'error');
            if (!isLoadMore) {
                setAllContacts([]);
                setTotalItems(0);
                setHasMoreData(false);
            }
        } finally {
            if (!isLoadMore) {
                setIsLoading(false);
            }
        }
    }, [showToast, filters.company_name, filters.department, filters.person_country]);

    // Load combo data for dropdowns
    const loadComboData = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (comboLoadingInitiated.current) {
            return;
        }

        comboLoadingInitiated.current = true;
        console.log('Loading combo data...');
        setDropdownData(prev => ({ ...prev, isLoading: true }));

        try {
            const [companiesResponse, departmentsResponse, countriesResponse] = await Promise.all([
                fetchCompanies(),
                fetchDepartments(),
                fetchCountries()
            ]);

            setDropdownData({
                companies: companiesResponse || [],
                departments: departmentsResponse || [],
                countries: countriesResponse || [],
                isLoaded: true,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to load combo data:', error);
            showToast('Failed to load filter options. Please try again.', 'error');
            setDropdownData(prev => ({ ...prev, isLoading: false }));
            // Reset the flag on error so it can be retried
            comboLoadingInitiated.current = false;
        }
    }, [showToast]);



    // Infinite scroll hook
    const loadMoreContacts = useCallback(async () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await fetchContacts(nextPage, true);
    }, [currentPage, fetchContacts]);

    const { isLoadingMore, containerRef, tableScrollRef } = useInfiniteScroll(
        loadMoreContacts,
        {
            threshold: 500, // Increased threshold to trigger earlier
            enabled: !isLoading && hasMoreData,
            isLoading: isLoading,
            hasMore: hasMoreData,
            useTableScroll: true
        }
    );

    // Load combo data only when filters are shown
    useEffect(() => {
        console.log('Filter visibility changed:', {
            showFilters,
            comboLoadingInitiated: comboLoadingInitiated.current
        });

        if (showFilters && !comboLoadingInitiated.current) {
            console.log('Triggering combo data load...');
            loadComboData();
        }
    }, [showFilters, loadComboData]);

    // Initial fetch on mount
    useEffect(() => {
        fetchContacts(1, false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter handling functions for multiselect
    const handleCompanySelect = useCallback((selectedList: CompanyOption[]) => {
        const companyNames = selectedList.map(item => item.name);
        setFilters(prev => ({ ...prev, company_name: companyNames }));
    }, []);

    const handleDepartmentSelect = useCallback((selectedList: CompanyOption[]) => {
        const departmentNames = selectedList.map(item => item.name);
        setFilters(prev => ({ ...prev, department: departmentNames }));
    }, []);

    const handleCountrySelect = useCallback((selectedList: CompanyOption[]) => {
        const countryNames = selectedList.map(item => item.name);
        setFilters(prev => ({ ...prev, person_country: countryNames }));
    }, []);



    // Search function to apply filters
    const handleSearchWithFilters = useCallback(async () => {
        // Reset pagination and data
        setCurrentPage(1);
        setAllContacts([]);
        setHasMoreData(true);

        // Use fetchContacts which now includes filter logic
        await fetchContacts(1, false, false);

        // Close filters panel after successful search
        setShowFilters(false);

        // Show success message
        const activeFilterCount = filters.company_name.length + filters.department.length + filters.person_country.length;
        if (activeFilterCount > 0) {
            showToast(`Applied ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`, 'success');
        } else {
            showToast('Search completed', 'success');
        }
    }, [filters, showToast, fetchContacts]);

    const clearFilters = useCallback(() => {
        setFilters({
            company_name: [], // Clear company names
            department: [],
            person_country: []
        });
        // Close filters panel after clearing
        setShowFilters(false);
        showToast('Filters cleared', 'success');
    }, [showToast]);




    const handleAddContact = () => {
        setSelectedContact(null);
        setShowModal(true);
    };

    const handleEditContact = (contact: Contact) => {
        setSelectedContact(contact);
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
            showToast('Contact deleted successfully!', 'success');
            // Reset infinite scroll and reload data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete contact', 'error');
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
                showToast('Bulk upload started. Processing file...', 'success');
                const response = await bulkImportContacts(file);

                // Handle file validation error
                if (response.file && Array.isArray(response.file) && response.file.length > 0) {
                    showToast(response.file[0], 'error');
                    return;
                } else if (response.file && typeof response.file === 'string') {
                    showToast(response.file, 'error');
                    return;
                }

                // Handle successful import with or without errors
                if (response.success !== undefined) {
                    if (response.failure === 0) {
                        // Complete success case
                        showToast(`Successfully imported all ${response.success} contacts!`, 'success');
                    } else {
                        // Partial success case with errors
                        showToast(
                            `Imported ${response.success} contacts with ${response.failure} failures. Check error details below.`,
                            'error'
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
                    setCurrentPage(1);
                    setAllContacts([]);
                    setHasMoreData(true);
                    fetchContacts(1, false, false);
                }
            } catch (error: any) {
                showToast(
                    error.file[0],
                    'error'
                );
            } finally {
                // Reset the file input
                e.target.value = '';
            }
        }
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
            showToast(`Successfully deleted ${selectedIds.length} contacts!`, 'success');
            setSelectedRows({});
            // Reset infinite scroll and reload data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
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
            showToast(`Successfully updated status for ${selectedIds.length} contacts!`, 'success');
            setSelectedRows({});
            // Reset infinite scroll and reload data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false, false);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to update contact status', 'error');
        } finally {
            setShowBulkStatusConfirmation(false);
            setBulkStatusToSet(null);
        }
    };

    // const handleRevealContact = async (contact: Contact) => {
    //     try {
    //         await revealContact(contact.id);
    //         success('Contact information revealed successfully!', {
    //             title: 'Contact Revealed'
    //         });
    //         // Reset infinite scroll and reload data
    //         setCurrentPage(1);
    //         setAllContacts([]);
    //         setHasMoreData(true);
    //         fetchContacts(1, false, false);
    //     } catch (error) {
    //         console.error('Error revealing contact:', error);
    //         showError('Failed to reveal contact information', {
    //             title: 'Reveal Failed',
    //             duration: 6000 // Auto-close after 6 seconds
    //         });
    //     }
    // };

    return (
        <div className="fixed inset-0 top-16 bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ left: `${sidebarCollapsed ? '64px' : '256px'}` }}
            ref={containerRef}>
            <div className="h-full p-6">
                <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                    {/* Header Section - Fixed at top */}
                    <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Contact Management</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage pharmaceutical industry contacts ({totalItems.toLocaleString()} total contacts)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleBulkUpload}
                                    className="hidden"
                                    title="Upload CSV or Excel file"
                                />
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    icon={<Filter size={18} />}
                                    type="button"
                                    size="sm"
                                    variant={showFilters ? "primary" : "outline"}
                                >
                                    <span className="hidden sm:inline">Filters</span>
                                    <span className="sm:hidden">Filter</span>
                                </Button>
                                <Button
                                    onClick={handleBulkUploadClick}
                                    icon={<Upload size={18} />}
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                >
                                    <span className="hidden sm:inline">Bulk Upload</span>
                                    <span className="sm:hidden">Upload</span>
                                </Button>
                                <Button
                                    onClick={handleAddContact}
                                    icon={<Plus size={18} />}
                                    size="sm"
                                >
                                    <span className="hidden sm:inline">Add Contact</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel - Collapsible */}
                    {showFilters && (
                        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Company Name Multiselect */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Company Name
                                    </label>
                                    <Multiselect
                                        options={dropdownData.companies}
                                        selectedValues={dropdownData.companies.filter(company =>
                                            filters.company_name.includes(company.name)
                                        )}
                                        onSelect={handleCompanySelect}
                                        onRemove={handleCompanySelect}
                                        displayValue="name"
                                        placeholder={dropdownData.isLoading ? "Loading companies..." : "Search and select company names..."}
                                        emptyRecordMsg={dropdownData.isLoading ? "Loading companies..." : "No companies found. Try a different search term."}
                                        showCheckbox={true}
                                        closeIcon="cancel"
                                        showArrow={true}
                                        disable={dropdownData.isLoading}
                                        style={{
                                            chips: {
                                                background: '#3B82F6',
                                                color: 'white',
                                                fontSize: '12px',
                                                borderRadius: '4px',
                                                padding: '2px 6px',
                                                margin: '1px'
                                            },
                                            searchBox: {
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                padding: '8px',
                                                fontSize: '14px',
                                                backgroundColor: 'white',
                                                width: '100%'
                                            },
                                            multiselectContainer: {
                                                backgroundColor: 'white',
                                                zIndex: 9999,
                                                width: '100%'
                                            },
                                            option: {
                                                color: '#374151',
                                                backgroundColor: 'white',
                                                padding: '8px 12px',
                                                width: '100%'
                                            },
                                            optionContainer: {
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                maxHeight: '200px',
                                                zIndex: 9999,
                                                position: 'absolute',
                                                backgroundColor: 'white',
                                                width: '100%'
                                            }
                                        }}
                                    />
                                </div>

                                {/* Department Multiselect */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Department
                                    </label>
                                    <Multiselect
                                        options={dropdownData.departments}
                                        selectedValues={dropdownData.departments.filter(dept =>
                                            filters.department.includes(dept.name)
                                        )}
                                        onSelect={handleDepartmentSelect}
                                        onRemove={handleDepartmentSelect}
                                        displayValue="name"
                                        placeholder={dropdownData.isLoading ? "Loading departments..." : "Search and select departments..."}
                                        emptyRecordMsg={dropdownData.isLoading ? "Loading departments..." : "No departments found. Try a different search term."}
                                        showCheckbox={true}
                                        closeIcon="cancel"
                                        showArrow={true}
                                        disable={dropdownData.isLoading}
                                        style={{
                                            chips: {
                                                background: '#F59E0B',
                                                color: 'white',
                                                fontSize: '12px',
                                                borderRadius: '4px',
                                                padding: '2px 6px',
                                                margin: '1px'
                                            },
                                            searchBox: {
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                padding: '8px',
                                                fontSize: '14px',
                                                backgroundColor: 'white',
                                                width: '100%'
                                            },
                                            multiselectContainer: {
                                                backgroundColor: 'white',
                                                zIndex: 9999,
                                                width: '100%'
                                            },
                                            option: {
                                                color: '#374151',
                                                backgroundColor: 'white',
                                                padding: '8px 12px',
                                                width: '100%'
                                            },
                                            optionContainer: {
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                maxHeight: '200px',
                                                zIndex: 9999,
                                                position: 'absolute',
                                                backgroundColor: 'white',
                                                width: '100%'
                                            }
                                        }}
                                    />
                                </div>

                                {/* Person Country Multiselect */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Person Country
                                    </label>
                                    <Multiselect
                                        options={dropdownData.countries}
                                        selectedValues={dropdownData.countries.filter(country =>
                                            filters.person_country.includes(country.name)
                                        )}
                                        onSelect={handleCountrySelect}
                                        onRemove={handleCountrySelect}
                                        displayValue="name"
                                        placeholder={dropdownData.isLoading ? "Loading countries..." : "Search and select person countries..."}
                                        emptyRecordMsg={dropdownData.isLoading ? "Loading countries..." : "No countries found. Try a different search term."}
                                        showCheckbox={true}
                                        closeIcon="cancel"
                                        showArrow={true}
                                        disable={dropdownData.isLoading}
                                        style={{
                                            chips: {
                                                background: '#8B5CF6',
                                                color: 'white',
                                                fontSize: '12px',
                                                borderRadius: '4px',
                                                padding: '2px 6px',
                                                margin: '1px'
                                            },
                                            searchBox: {
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                padding: '8px',
                                                fontSize: '14px',
                                                backgroundColor: 'white',
                                                width: '100%'
                                            },
                                            multiselectContainer: {
                                                backgroundColor: 'white',
                                                zIndex: 9999,
                                                width: '100%'
                                            },
                                            option: {
                                                color: '#374151',
                                                backgroundColor: 'white',
                                                padding: '8px 12px',
                                                width: '100%'
                                            },
                                            optionContainer: {
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                maxHeight: '200px',
                                                zIndex: 9999,
                                                position: 'absolute',
                                                backgroundColor: 'white',
                                                width: '100%'
                                            }
                                        }}
                                    />
                                </div>


                            </div>

                            {/* Filter Actions */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    {(() => {
                                        const totalFilters = filters.company_name.length + filters.department.length + filters.person_country.length;
                                        return totalFilters > 0 ? (
                                            <span className="text-blue-600 font-medium">
                                                {totalFilters} filter(s) selected
                                            </span>
                                        ) : (
                                            <span>No filters selected</span>
                                        );
                                    })()}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={clearFilters}
                                        variant="outline"
                                        size="sm"
                                        icon={<X size={16} />}
                                        disabled={filters.company_name.length === 0 && filters.department.length === 0 && filters.person_country.length === 0}
                                    >
                                        Clear All
                                    </Button>
                                    <Button
                                        onClick={handleSearchWithFilters}
                                        size="sm"
                                        icon={<Search size={16} />}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Searching...' : 'Search'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected Items Banner - Fixed position when items are selected */}
                    {Object.entries(selectedRows).filter(([, selected]) => selected).length > 0 && (
                        <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-6 py-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <span className="text-sm font-medium text-blue-700">
                                    {Object.entries(selectedRows).filter(([, selected]) => selected).length} contacts selected
                                </span>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <select
                                        onChange={(e) => handleBulkStatusClick(e.target.value as 'Active' | 'Inactive')}
                                        className="text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
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
                                        className="sm:w-auto w-full justify-center"
                                    >
                                        Delete Selected
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table Section - Scrollable content */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <Table
                            data={allContacts}
                            columns={columns}
                            isLoading={isLoading}
                            sorting={sorting}
                            onSortingChange={setSorting}
                            enableSorting={true}
                            enablePagination={false}
                            enableTableScroll={true}
                            tableHeight="100%"
                            scrollContainerRef={tableScrollRef}
                            isLoadingMore={isLoadingMore}
                            showScrollToTop={true}
                            enableSelection={true}
                            selectedRows={selectedRows}
                            onSelectionChange={setSelectedRows}
                            emptyStateMessage="No contacts found. Try adjusting your filters or search terms."
                        />
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
                        message={`Are you sure you want to delete ${Object.entries(selectedRows).filter(([, selected]) => selected).length} contacts? This action cannot be undone.`}
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
                        message={`Are you sure you want to set ${Object.entries(selectedRows).filter(([, selected]) => selected).length} contacts to ${bulkStatusToSet} status?`}
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-neutral-500/75 backdrop-blur-sm" aria-hidden="true" onClick={() => setShowModal(false)}></div>

                            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden">
                                <ContactForm
                                    contact={selectedContact}
                                    onSuccess={handleFormSuccess}
                                    onCancel={() => setShowModal(false)}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ContactManagement;