import Header from "../components/Header";
import FilterPanel from "../components/FilterPanel";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { useState, useEffect } from "react";
import { MOCK_CONTACTS } from "../utils/mockData";
import type { FilterState } from "../types";
import { useToast } from "../context/ToastContext";
import { Filter, X } from "lucide-react";
import classNames from "classnames";

const ITEMS_PER_PAGE = 6;

const ListingPage = () => {
    const [filteredData, setFilteredData] = useState(MOCK_CONTACTS);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setIsLoading(false);
            showToast('Contact data loaded successfully', 'success');
        }, 1000);

        return () => clearTimeout(timer);
    }, [showToast]);

    const handleFilter = (filters: FilterState) => {
        // setIsLoading(true);
        setShowMobileFilters(false); // Close mobile filters after applying

        // Simulate filter delay
        setTimeout(() => {
            const filtered = MOCK_CONTACTS.filter(contact => {
                const matchesSearch = filters.search === "" ||
                    contact.company.toLowerCase().includes(filters.search.toLowerCase()) ||
                    contact.name.toLowerCase().includes(filters.search.toLowerCase());

                const matchesCountry = filters.country === "All" || contact.country === filters.country;
                const matchesIndustry = filters.industry === "All" || contact.industry === filters.industry;
                const matchesStatus = filters.status === "All" || contact.status === filters.status;
                const matchesCompanySize = filters.companySize === "All" || contact.companySize === filters.companySize;
                const matchesDepartment = filters.department === "All" || contact.department === filters.department;

                return matchesSearch && matchesCountry && matchesIndustry &&
                    matchesStatus && matchesCompanySize && matchesDepartment;
            });

            setFilteredData(filtered);
            setCurrentPage(1); // Reset to first page when filtering
            setIsLoading(false);

            const activeFilters = Object.entries(filters).filter(([key, value]) =>
                key === 'search' ? value !== '' : value !== 'All'
            ).length;

            if (activeFilters > 0) {
                showToast(`Found ${filtered.length} contacts matching your filters`, 'info');
            }
        }, 500);
    };

    // Calculate pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Mobile Filter Button */}
            <div className="lg:hidden sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        <Filter size={16} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Mobile Filter Overlay */}
            <div className={classNames(
                'fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity duration-300 ease-in-out lg:hidden',
                showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}>
                <div className={classNames(
                    'fixed inset-0 z-40 flex',
                    showMobileFilters ? 'opacity-100' : 'opacity-0'
                )}>
                    <div className={classNames(
                        'relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ease-in-out duration-300',
                        showMobileFilters ? 'translate-x-0' : '-translate-x-full'
                    )}>
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 overflow-y-auto p-4">
                            <FilterPanel onFilter={handleFilter} isMobile={true} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar with filters - Desktop */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-4 space-y-4">
                            <FilterPanel onFilter={handleFilter} isMobile={false} />

                            {/* Filter Stats */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">Current Selection</h3>
                                <div className="text-sm text-blue-600">
                                    <p>Total Results: {totalItems}</p>
                                    <p>Page {currentPage} of {totalPages}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Browse and manage your contact database
                                    </p>
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
                                    {!isLoading && `Showing ${Math.min(startIndex + 1, totalItems)}-${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of ${totalItems}`}
                                </span>
                            </div>

                            <Table data={paginatedData} isLoading={isLoading} />

                            {totalPages > 1 && !isLoading && (
                                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                                    <div className="text-sm text-gray-500">
                                        Showing page {currentPage} of {totalPages}
                                    </div>
                                    <Pagination
                                        total={totalItems}
                                        perPage={ITEMS_PER_PAGE}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                    />
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
