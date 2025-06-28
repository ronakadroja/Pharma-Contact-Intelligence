import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Filter, Plus, X, Loader2, Check, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getContacts, revealContact, type Contact as APIContact } from "../../api/contacts";
import FilterPanel from "../../components/FilterPanel";
import Header from "../../components/Header";
import Table from "../../components/Table";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { useAppContext } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";

interface FilterState {
    company_name: string[];
    designation: string;
    person_country: string[];
}

const ITEMS_PER_PAGE = 10;

const ListingPage = () => {
    // Infinite scroll state management
    const [allContacts, setAllContacts] = useState<APIContact[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilters, setShowFilters] = useState(true); // true = visible by default
    const [searchParams, setSearchParams] = useState({
        company_name: [] as string[],
        designation: '',
        person_country: [] as string[],
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const { showToast } = useToast();
    const { setCoins, coins } = useAppContext();

    // Infinite scroll hook
    const loadMoreContacts = async () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await fetchContacts(nextPage, true);
    };

    const { isLoadingMore, containerRef } = useInfiniteScroll(
        loadMoreContacts,
        {
            threshold: 500, // Increased threshold to trigger earlier
            enabled: !isLoading && hasMoreData,
            isLoading: isLoading,
            hasMore: hasMoreData
        }
    );



    const handleRevealContact = async (contact: APIContact) => {
        try {
            // Check if user has sufficient credits (more than 50)
            if (coins <= 50) {
                showToast('Insufficient credits! You need more than 50 credits to reveal contact information. Please purchase more credits to continue.', 'error');
                return;
            }

            const available_credit = await revealContact(contact.id);
            setCoins(available_credit);
            showToast(`Added ${contact.person_name} to your list`, 'success');
            // Refresh the contacts list - reset to first page and reload all data
            setCurrentPage(1);
            setAllContacts([]);
            setHasMoreData(true);
            fetchContacts(1, false);
        } catch (error) {
            console.error('Error revealing contact:', error);
            showToast('Failed to reveal contact information', 'error');
        }
    };

    const columns: ColumnDef<APIContact>[] = [
        {
            accessorKey: 'company_name',
            header: 'Company',
            cell: ({ row }) => (
                <div className="group cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-medium text-gray-900">{row.original.company_name}</div>
                    {row.original.company_website && (
                        <div className="text-sm text-gray-500 group-hover:text-blue-600">
                            {row.original.company_website}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'person_name',
            header: 'Contact Person',
            cell: ({ row }) => (
                <div className="group cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-semibold text-gray-900">{row.original.person_name}</div>
                    <div className="text-sm text-gray-500">{row.original.designation}</div>
                </div>
            ),
        },
        {
            accessorKey: 'location',
            header: 'Location',
            cell: ({ row }) => (
                <div className="text-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="inline-flex items-center">
                        {row.original.city}, {row.original.person_country}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <div className="text-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer">
                    {row.original.email ? (
                        <span className="text-gray-900">{row.original.email}</span>
                    ) : (
                        <span className="text-gray-400 italic">-</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'department',
            header: 'Department',
            cell: ({ row }) => (
                <div className="group cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-medium text-gray-900">{row.original.department}</div>
                    <div className="text-sm text-gray-500">{row.original.company_type}</div>
                </div>
            ),
        },
        {
            accessorKey: 'is_verified',
            header: 'Verify',
            cell: ({ row }) => {
                const isVerified = row.original.is_verified === 1;
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${isVerified
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}>
                        {isVerified ? (
                            <CheckCircle size={12} className="mr-1.5" />
                        ) : (
                            <XCircle size={12} className="mr-1.5" />
                        )}
                        {isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Add',
            cell: ({ row }) => {
                const hasEmail = row.original.email && row.original.email.trim() !== '';

                if (hasEmail) {
                    // Show "Added" state when email exists
                    return (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md cursor-not-allowed" title="Already added to your list">
                            <Check size={16} />
                            <span>Added</span>
                        </div>
                    );
                } else {
                    // Check if user has sufficient credits
                    const hasInsufficientCredits = coins <= 50;

                    // Show "Add" button when email doesn't exist
                    return (
                        <button
                            onClick={() => handleRevealContact(row.original)}
                            disabled={hasInsufficientCredits}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${hasInsufficientCredits
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-60'
                                : 'text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 transform hover:scale-105 focus:ring-blue-500'
                                }`}
                            title={hasInsufficientCredits ? 'Insufficient credits (need more than 50)' : 'Add to your list'}
                        >
                            <Plus size={16} className={hasInsufficientCredits ? '' : 'transition-transform group-hover:rotate-90'} />
                            <span>{hasInsufficientCredits ? 'Need Credits' : 'Add'}</span>
                        </button>
                    );
                }
            },
        },
    ];

    const fetchContacts = async (page: number = 1, isLoadMore: boolean = false, showSuccessToast: boolean = false) => {
        try {
            // Only show main loading for initial load or filter changes
            if (!isLoadMore) {
                setIsLoading(true);
            }

            // Convert arrays to comma-separated strings for API
            const apiParams = {
                ...searchParams,
                company_name: Array.isArray(searchParams.company_name)
                    ? searchParams.company_name.join(',')
                    : searchParams.company_name,
                person_country: Array.isArray(searchParams.person_country)
                    ? searchParams.person_country.join(',')
                    : searchParams.person_country,
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
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchContacts(1, false);
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
            fetchContacts(1, false);

            // Show appropriate feedback
            if (isClearing) {
                showToast('Filters cleared - showing all contacts', 'success');
            }
        }
    }, [searchParams]);

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

    const handleFilter = (filters: FilterState) => {
        const previousFilters = { ...searchParams };
        const newFilters = {
            company_name: filters.company_name,
            designation: filters.designation,
            person_country: filters.person_country,
        };

        // Check if filters are being cleared
        const isClearing = Object.values(newFilters).every(value => {
            if (Array.isArray(value)) {
                return value.length === 0;
            }
            return value === '';
        });
        const wasFiltered = Object.values(previousFilters).some(value => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== '';
        });

        setSearchParams(newFilters);

        // Show feedback for specific actions
        if (isClearing && wasFiltered) {
            // This will be handled by the useEffect above
        } else if (!isClearing) {
            // Filters are being applied
            const activeFilterCount = Object.values(newFilters).filter(value => {
                if (Array.isArray(value)) {
                    return value.length > 0;
                }
                return value !== '';
            }).length;
            showToast(`Applied ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`, 'success');
        }
    };

    // Calculate display values for infinite scroll

    return (
        <div className="min-h-screen bg-gray-50" ref={containerRef}>
            <Header />

            {/* Mobile Filter Button - Only visible on mobile */}
            <div className="lg:hidden sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Filter size={16} />
                        <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                        <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {Object.values(searchParams).filter(Boolean).length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Filter Panel - Inline, not overlay */}
            <div className={`lg:hidden transition-all duration-300 ${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
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
                    <FilterPanel onFilter={handleFilter} isMobile={true} isLoading={isLoading} />
                </div>
            </div>

            <div className="max-w-[90rem] mx-auto px-4 py-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar with filters - Visible based on showFilters state */}
                    {showFilters && (
                        <div className={`${showFilters ? 'w-full lg:w-72' : '0'} flex-shrink-0 transition-all duration-300`}>
                            <div className="sticky top-4 space-y-6">
                                <FilterPanel onFilter={handleFilter} isMobile={false} isLoading={isLoading} />

                                {/* Filter Stats */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm border border-blue-200">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">Current Selection</h3>
                                    <div className="text-sm text-blue-700">
                                        <p className="flex items-center gap-2">
                                            <span>Total Results:</span>
                                            <span className="font-medium">{totalItems}</span>
                                        </p>
                                        <p className="flex items-center gap-2 mt-1">
                                            <span>Loaded:</span>
                                            <span className="font-medium">{allContacts.length}</span>
                                            {hasMoreData && (
                                                <span className="text-xs text-blue-600">(scroll for more)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main content - Responsive for both desktop and mobile */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
                                        <p className="text-sm text-gray-500 mt-1">
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
                                            {Object.values(searchParams).filter(Boolean).length > 0 && (
                                                <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {Object.values(searchParams).filter(Boolean).length}
                                                </span>
                                            )}
                                        </button>

                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden">
                                        <Table
                                            data={allContacts}
                                            columns={columns}
                                            isLoading={isLoading}
                                            sorting={sorting}
                                            onSortingChange={setSorting}
                                            enableSorting={true}
                                            enablePagination={false}
                                            emptyStateMessage="No contacts found. Try adjusting your filters or search terms."
                                        />
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
                            {!isLoading && allContacts.length > 0 && (
                                <div className="border-t border-gray-200 px-6 py-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing {allContacts.length} of {totalItems} contacts
                                            {!hasMoreData && allContacts.length > ITEMS_PER_PAGE && (
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to top button */}
            <ScrollToTopButton threshold={300} />
        </div>
    );
};

export default ListingPage;




