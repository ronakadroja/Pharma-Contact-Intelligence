import Header from "../../components/Header";
import FilterPanel from "../../components/FilterPanel";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Filter, X, Plus } from "lucide-react";
import classNames from "classnames";
import { getContacts, revealContact, type Contact as APIContact, type ContactsResponse, type RevealContactResponse } from "../../api/contacts";
import type { Contact } from "../../types";
import type { ColumnDef } from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useAppContext } from "../../context/AppContext";

interface FilterState {
    company_name: string;
    designation: string;
    person_country: string;
}

const ITEMS_PER_PAGE = 10;

const ListingPage = () => {
    const [contactsData, setContactsData] = useState<ContactsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [searchParams, setSearchParams] = useState({
        company_name: '',
        designation: '',
        person_country: '',
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

    const fetchContacts = async (page: number = 1) => {
        try {
            setIsLoading(true);
            const response = await getContacts({
                ...searchParams,
                page,
                per_page: ITEMS_PER_PAGE
            });
            setContactsData(response);
            showToast('Contact data loaded successfully', 'success');
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
        if (Object.values(searchParams).some(value => value !== '')) { // Only fetch if there are search params
            setCurrentPage(1);
            fetchContacts(1);
        }
    }, [searchParams]);

    const handleFilter = (filters: FilterState) => {
        setSearchParams({
            company_name: filters.company_name,
            designation: filters.designation,
            person_country: filters.person_country,
        });
    };

    const totalItems = contactsData?.total || 0;
    const totalPages = contactsData?.last_page || 1;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Mobile Filter Button */}
            <div className="lg:hidden sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Filter size={16} />
                        <span>Show Filters</span>
                        <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {Object.values(searchParams).filter(Boolean).length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Filter Overlay */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                    <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <FilterPanel onFilter={handleFilter} isMobile={true} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[90rem] mx-auto px-4 py-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar with filters - Desktop */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-4 space-y-6">
                            <FilterPanel onFilter={handleFilter} isMobile={false} />

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

                    {/* Main content */}
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
                                        <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                            {!isLoading && contactsData &&
                                                `Showing ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}-${Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of ${totalItems}`
                                            }
                                        </span>
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