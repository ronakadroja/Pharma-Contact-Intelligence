import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Check, CheckCircle, Filter, Linkedin, Mail, Phone, Plus, X, XCircle } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { getContacts, revealContact, type Contact as APIContact } from "../../api/contacts";
import { fetchCompanies, fetchCountries, fetchDepartments, fetchCompanyTypes, type CompanyOption } from "../../api/combo";
import FilterPanel from "../../components/FilterPanel";
import Header from "../../components/Header";
import Table from "../../components/Table";

import { useAppContext } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

interface FilterState {
    company_name: string;
    person_name: string;
    department: string;
    designation: string;
    company_type: string;
    person_country: string;
    company_country: string;
    city: string;
}

const ITEMS_PER_PAGE = 10;

const ListingPage = () => {
    // Infinite scroll state management
    const [allContacts, setAllContacts] = useState<APIContact[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [showFilters, setShowFilters] = useState(true); // true = visible by default
    const [searchParams, setSearchParams] = useState({
        company_name: '',
        person_name: '',
        department: '',
        designation: '',
        company_type: '',
        person_country: '',
        company_country: '',
        city: '',
    });
    const [sorting, setSorting] = useState<SortingState>([]);

    // Cached dropdown data - loaded once and reused
    const [dropdownData, setDropdownData] = useState<{
        companies: CompanyOption[];
        departments: CompanyOption[];
        companyTypes: CompanyOption[];
        countries: CompanyOption[];
        isLoaded: boolean;
        isLoading: boolean;
    }>({
        companies: [],
        departments: [],
        companyTypes: [],
        countries: [],
        isLoaded: false,
        isLoading: false,
    });

    const { showToast } = useToast();
    const { setCoins, coins } = useAppContext();

    const handleRevealContact = useCallback(async (contact: APIContact) => {
        try {
            // Check if user has sufficient credits (more than 50)
            if (coins <= 50) {
                showToast('Insufficient credits! You need more than 50 credits to reveal contact information. Please purchase more credits to continue.', 'error');
                return;
            }

            const response = await revealContact(contact.id);
            setCoins(response.available_credit);
            showToast(`Added ${contact.person_name} to your list`, 'success');

            // Update only the specific contact in the current list with actual revealed data
            setAllContacts(prevContacts =>
                prevContacts.map(c =>
                    c.id === contact.id
                        ? { ...c, ...response.contact } // Update with actual revealed contact data
                        : c
                )
            );
        } catch (error) {
            console.error('Error revealing contact:', error);
            showToast('Failed to reveal contact information', 'error');
        }
    }, [coins, showToast, setCoins]);

    const columns: ColumnDef<APIContact>[] = useMemo(() => [
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
            accessorKey: 'contact_info',
            header: 'Contact Info',
            size: 200,
            cell: ({ row }) => {
                const hasEmail = row.original.email && row.original.email.trim() !== '';
                const hasPhone = row.original.phone && row.original.phone.trim() !== '';

                // If neither email nor phone is present, show masked dummy data
                if (!hasEmail && !hasPhone) {
                    return (
                        <div className="min-w-0 max-w-[200px]">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-xs font-mono text-gray-400 truncate">****@*****.com</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-xs font-mono text-gray-400 truncate">+1-***-***-****</span>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="min-w-0 max-w-[200px]">
                        <div className="space-y-1">
                            {/* Email */}
                            {hasEmail && (
                                <a
                                    href={`mailto:${row.original.email}`}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline group"
                                    title={row.original.email}
                                >
                                    <Mail size={12} className="text-blue-500 flex-shrink-0" />
                                    <span className="truncate">{row.original.email}</span>
                                </a>
                            )}
                            {/* Phone */}
                            {hasPhone && (
                                <a
                                    href={`tel:${row.original.phone}`}
                                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 hover:underline group"
                                    title={row.original.phone}
                                >
                                    <Phone size={12} className="text-green-500 flex-shrink-0" />
                                    <span className="truncate">{row.original.phone}</span>
                                </a>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Add',
            size: 120,
            cell: ({ row }) => {
                const hasEmail = row.original.email && row.original.email.trim() !== '';

                if (hasEmail) {
                    // Show "Added" state when email exists
                    return (
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-1 px-1 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-md border border-green-200" title="Already added to your list">
                                <Check size={12} />
                                <span>Added</span>
                            </div>
                        </div>
                    );
                } else {
                    // Check if user has sufficient credits
                    const hasInsufficientCredits = coins <= 50;

                    // Show "Add" button when email doesn't exist
                    return (
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleRevealContact(row.original)}
                                disabled={hasInsufficientCredits}
                                className={`inline-flex items-center gap-1 px-1 py-1 text-xs font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 ${hasInsufficientCredits
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-60 border border-gray-200'
                                    : 'text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 focus:ring-blue-500'
                                    }`}
                                title={hasInsufficientCredits ? 'Insufficient credits (need more than 50)' : 'Add to your list'}
                            >
                                <Plus size={12} />
                                <span>{hasInsufficientCredits ? 'Credits' : 'Add'}</span>
                            </button>
                        </div>
                    );
                }
            },
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
                    <div className="text-xs text-gray-600 truncate" title={row.original.company_type}>
                        {row.original.company_type}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'company_type',
            header: 'Country Type',
            size: 140,
            cell: ({ row }) => (
                <div className="min-w-0 max-w-[140px]">
                    <div className="text-sm text-gray-900 truncate" title={row.original.company_type}>
                        {row.original.company_type}
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

    ], [handleRevealContact, coins]);

    const fetchContacts = useCallback(async (page: number = 1, isLoadMore: boolean = false, showSuccessToast: boolean = false) => {
        try {
            // Only show main loading for initial load or filter changes
            if (!isLoadMore) {
                setIsLoading(true);
            }

            // API params - company_name is already a comma-separated string from FilterPanel
            const apiParams = {
                ...searchParams,
                page,
                per_page: ITEMS_PER_PAGE
            };



            const response = await getContacts(apiParams);

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
            setHasMoreData(response.current_page < response.last_page);

            if (showSuccessToast) {
                showToast('Contact data loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast('Failed to fetch contacts', 'error');
            if (!isLoadMore) {
                setAllContacts([]);
                setHasMoreData(false);
            }
        } finally {
            if (!isLoadMore) {
                setIsLoading(false);
            }
        }
    }, [searchParams, showToast]);

    // Load dropdown data once when filters are first shown
    const loadDropdownData = useCallback(async () => {
        if (dropdownData.isLoaded || dropdownData.isLoading) {
            return; // Already loaded or loading
        }

        setDropdownData(prev => ({ ...prev, isLoading: true }));

        try {
            const [companies, departments, companyTypes, countries] = await Promise.all([
                fetchCompanies(),
                fetchDepartments(),
                fetchCompanyTypes(),
                fetchCountries()
            ]);

            setDropdownData({
                companies,
                departments,
                companyTypes,
                countries,
                isLoaded: true,
                isLoading: false,
            });
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
            setDropdownData(prev => ({
                ...prev,
                isLoading: false,
                // Keep previous data if any, or set empty arrays
                companies: prev.companies,
                departments: prev.departments,
                companyTypes: prev.companyTypes,
                countries: prev.countries,
            }));
        }
    }, [dropdownData.isLoaded, dropdownData.isLoading]);

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

    // Initial fetch on mount
    useEffect(() => {
        fetchContacts(1, false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch when search params change (reset infinite scroll)
    useEffect(() => {
        // Reset infinite scroll state and fetch with new filters
        setCurrentPage(1);
        setAllContacts([]);
        setHasMoreData(true);
        fetchContacts(1, false);
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load filter visibility state from localStorage on component mount
    useEffect(() => {
        const savedFilterVisibility = localStorage.getItem('contactsFilterVisibility');
        if (savedFilterVisibility !== null) {
            setShowFilters(savedFilterVisibility === 'true');
        }
    }, []);

    // Save filter visibility state to localStorage
    useEffect(() => {
        localStorage.setItem('contactsFilterVisibility', showFilters.toString());
    }, [showFilters]);

    // Load dropdown data when filters are shown for the first time
    useEffect(() => {
        if (showFilters && !dropdownData.isLoaded && !dropdownData.isLoading) {
            loadDropdownData();
        }
    }, [showFilters, dropdownData.isLoaded, dropdownData.isLoading, loadDropdownData]);

    const handleFilter = useCallback((filters: FilterState) => {
        const previousFilters = { ...searchParams };
        const newFilters = {
            company_name: filters.company_name,
            person_name: filters.person_name,
            department: filters.department,
            designation: filters.designation,
            company_type: filters.company_type,
            person_country: filters.person_country,
            company_country: filters.company_country,
            city: filters.city,
        };


        // Check if filters are being cleared
        const isClearing = Object.values(newFilters).every(value => value === '');
        const wasFiltered = Object.values(previousFilters).some(value => value !== '');

        setSearchParams(newFilters);

        // Show feedback for specific actions
        if (isClearing && wasFiltered) {
            // This will be handled by the useEffect above
        } else if (!isClearing) {
            // Filters are being applied
            const activeFilterCount = Object.values(newFilters).filter(value => value !== '').length;
            showToast(`Applied ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`, 'success');
        }
    }, [searchParams, showToast]);

    // Calculate display values for infinite scroll

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden" ref={containerRef}>
            <Header />

            {/* Mobile Filter Button - Only visible on mobile */}
            <div className="lg:hidden flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 py-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Filter size={16} />
                        <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                        {Object.values(searchParams).filter(value => value !== '').length > 0 && (
                            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {Object.values(searchParams).filter(value => value !== '').length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Filter Panel - Inline, not overlay */}
            <div className={`lg:hidden flex-shrink-0 transition-all duration-300 ${showFilters ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="bg-white border-b border-gray-200 px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <FilterPanel onFilter={handleFilter} isMobile={true} isLoading={isLoading} dropdownData={dropdownData} />
                </div>
            </div>

            {/* Main Content Area - Full Height */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full flex flex-col lg:flex-row">
                    {/* Sidebar with filters - Only visible on desktop when showFilters is true */}
                    {showFilters && (
                        <div className="hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden" style={{ width: '20%', minWidth: '250px', maxWidth: '300px' }}>
                            <div className="flex-1 overflow-y-auto p-4">
                                <FilterPanel onFilter={handleFilter} isMobile={false} isLoading={isLoading} dropdownData={dropdownData} />
                            </div>
                        </div>
                    )}

                    {/* Main content - Responsive for both desktop and mobile */}
                    <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                        {/* Listing Section Container - Same styling as FilterPanel */}
                        <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 m-4">
                            {/* Header Section */}
                            <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 rounded-t-lg px-4 lg:px-6 py-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
                                        <p className="text-sm text-gray-500">
                                            Browse and manage your contact database
                                        </p>
                                        {coins <= 50 && (
                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md">
                                                <XCircle size={16} className="text-red-500" />
                                                <span className="text-sm text-red-700 font-medium">
                                                    Low Credits: {coins} remaining. Need more than 50 to reveal contacts.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Desktop Filter Toggle Button */}
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            <Filter size={16} />
                                            <span>{showFilters ? 'Hide Filter' : 'Show Filter'}</span>
                                            {Object.values(searchParams).filter(value => value !== '').length > 0 && (
                                                <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {Object.values(searchParams).filter(value => value !== '').length}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Table Section - Full Height */}
                            <div className="flex-1 min-h-0 relative bg-white rounded-b-lg overflow-hidden">
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
                                    emptyStateMessage="No contacts found. Try adjusting your filters or search terms."
                                />
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingPage;




