import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Filter, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getContacts, revealContact, type Contact as APIContact, type ContactsResponse } from "../../api/contacts";
import FilterPanel from "../../components/FilterPanel";
import Header from "../../components/Header";
import Pagination from "../../components/Pagination";
import Table from "../../components/Table";
import { useAppContext } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";

interface FilterState {
    company_name: string[];
    designation: string;
    person_country: string[];
}

const ITEMS_PER_PAGE = 10;

const ListingPage = () => {
    const [contactsData, setContactsData] = useState<ContactsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(true); // true = visible by default
    const [searchParams, setSearchParams] = useState({
        company_name: [] as string[],
        designation: '',
        person_country: [] as string[],
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const { showToast } = useToast();
    const { setCoins } = useAppContext();

    const handleRevealContact = async (contact: APIContact) => {
        try {
            let available_credit = await revealContact(contact.id);
            setCoins(available_credit);
            showToast(`Added ${contact.person_name} to your list`, 'success'); fetchContacts(currentPage); // Refresh the contacts list
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
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${row.original.status === 'Active'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.original.status === 'Active' ? 'bg-green-600' : 'bg-red-600'
                        }`}></span>
                    {row.original.status}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Add',
            cell: ({ row }) => (
                <button
                    onClick={() => handleRevealContact(row.original)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" title="Add to your list"
                >
                    <Plus size={16} className="transition-transform group-hover:rotate-90" />
                    <span>Add</span>
                </button>
            ),
        },
    ];

    const fetchContacts = async (page: number = 1, showSuccessToast: boolean = false) => {
        try {
            setIsLoading(true);

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
            setContactsData(response);
            if (showSuccessToast) {
                showToast('Contact data loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast('Failed to fetch contacts', 'error');
            setContactsData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchContacts(1);
    }, []);

    // Fetch when page changes
    useEffect(() => {
        if (currentPage > 1) { // Only fetch if not the first page (already handled by mount effect)
            fetchContacts(currentPage);
        }
    }, [currentPage]);

    // Fetch when search params change
    useEffect(() => {
        const hasActiveFilters = Object.values(searchParams).some(value => value !== '');
        const isClearing = Object.values(searchParams).every(value => value === '');

        if (hasActiveFilters || isClearing) {
            setCurrentPage(1);
            fetchContacts(1);

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

    const totalItems = contactsData?.total || 0;
    const totalPages = contactsData?.last_page || 1;

    return (
        <div className="min-h-screen bg-gray-50">
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
                                            <span>Page</span>
                                            <span className="font-medium">{currentPage}</span>
                                            <span>of</span>
                                            <span className="font-medium">{totalPages}</span>
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
                                            data={contactsData?.data || []}
                                            columns={columns}
                                            isLoading={isLoading}
                                            sorting={sorting}
                                            onSortingChange={setSorting}
                                            enableSorting={true}
                                            emptyStateMessage="No contacts found. Try adjusting your filters or search terms."
                                        />
                                    </div>
                                </div>
                            </div>

                            {totalPages > 1 && !isLoading && (
                                <div className="border-t border-gray-200 px-6 py-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing page {currentPage} of {totalPages}
                                        </div>
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            totalItems={totalItems}
                                            pageSize={ITEMS_PER_PAGE}
                                            showTotalItems={true}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingPage;




