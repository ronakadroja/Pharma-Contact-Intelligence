import Header from "../../components/Header";
import FilterPanel from "../../components/FilterPanel";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Filter, X } from "lucide-react";
import classNames from "classnames";
import { getContacts, type Contact as APIContact, type ContactsResponse } from "../../api/contacts";
import type { Contact, FilterState } from "../../types";

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
        city: ''
    });
    const { showToast } = useToast();

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
    }, []); // Empty dependency array for initial mount only

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
        // Map FilterState to API search params
        setSearchParams({
            company_name: filters.search, // Use search field for company name
            designation: '', // Not directly mapped in FilterState
            person_country: filters.country === 'All' ? '' : filters.country,
            city: '' // Not directly mapped in FilterState
        });
    };

    // Transform API contacts to match the UI contact type
    const transformContacts = (apiContacts: APIContact[]): Contact[] => {
        return apiContacts.map(contact => ({
            id: Math.random().toString(), // Add proper ID when available from API
            company: contact.company_name,
            name: contact.person_name,
            email: '', // Add when available in API
            phone: '', // Add when available in API
            country: contact.person_country,
            city: contact.city,
            department: contact.department,
            designation: contact.designation,
            industry: contact.company_type || '',
            companySize: '', // Add when available in API
            lastContact: new Date().toISOString(), // Add when available in API
            status: contact.status
        }));
    };

    const totalItems = contactsData?.total || 0;
    const totalPages = contactsData?.last_page || 1;
    const paginatedData = contactsData ? transformContacts(contactsData.data) : [];

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
            {showMobileFilters && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileFilters(false)} />
                    <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <FilterPanel onFilter={handleFilter} isMobile={true} />
                    </div>
                </div>
            )}

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
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Browse and manage your contact database
                                    </p>
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
                                    {!isLoading && contactsData && `Showing ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}-${Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of ${totalItems}`}
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