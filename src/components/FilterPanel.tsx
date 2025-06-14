import { useState, useEffect } from "react";
import type { Contact } from "../types";
import { MOCK_CONTACTS } from "../utils/mockData";
import { X, Filter, ChevronDown, ChevronUp, Search } from "lucide-react";

interface FilterPanelProps {
    onFilter: (filters: FilterState) => void;
    isMobile: boolean;
}

interface FilterState {
    search: string;
    country: string;
    industry: string;
    status: string;
    companySize: string;
    department: string;
}

const initialFilters: FilterState = {
    search: "",
    country: "All",
    industry: "All",
    status: "All",
    companySize: "All",
    department: "All"
};

const COMPANY_SIZES = ["All", "100-500", "500-1000", "1000+"];
const STATUSES = ["All", "Active", "Inactive"];

const FilterPanel = ({ onFilter, isMobile }: FilterPanelProps) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [isOpen, setIsOpen] = useState(true);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    useEffect(() => {
        const count = Object.values(filters).filter(value => value !== "" && value !== "All").length;
        setActiveFiltersCount(count);
    }, [filters]);

    const handleChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleReset = () => {
        setFilters(initialFilters);
        onFilter(initialFilters);
    };

    // Get unique values from mock data
    const getUniqueValues = (key: keyof Contact) => {
        const uniqueValues = new Set(MOCK_CONTACTS.map(contact => contact[key] as string));
        return ["All", ...Array.from(uniqueValues)].sort();
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Filter Header */}
            <div
                className={`p-4 bg-gray-50 border-b flex items-center justify-between ${!isMobile ? 'cursor-pointer' : ''}`}
                onClick={() => !isMobile && setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500" />
                    <h2 className="text-lg font-semibold">Filters</h2>
                    {activeFiltersCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                        }}
                        title="Reset filters"
                    >
                        <X size={18} />
                    </button>
                    {!isMobile && (
                        <button
                            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                        >
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Content */}
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 space-y-6">
                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Contacts
                        </label>
                        <div className="relative">
                            <input
                                value={filters.search}
                                onChange={(e) => handleChange("search", e.target.value)}
                                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow pl-10"
                                placeholder="Company or person name..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Filter Groups */}
                    <div className="space-y-6">
                        {/* Location Group */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
                            <select
                                value={filters.country}
                                onChange={(e) => handleChange("country", e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                            >
                                {getUniqueValues("country").map((country: string) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Company Info Group */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Company Information</h3>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Industry</label>
                                <select
                                    value={filters.industry}
                                    onChange={(e) => handleChange("industry", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                                >
                                    {getUniqueValues("industry").map((industry: string) => (
                                        <option key={industry} value={industry}>{industry}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Company Size</label>
                                <select
                                    value={filters.companySize}
                                    onChange={(e) => handleChange("companySize", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                                >
                                    {COMPANY_SIZES.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Contact Info Group */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Department</label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => handleChange("department", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                                >
                                    {getUniqueValues("department").map((department: string) => (
                                        <option key={department} value={department}>{department}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                                >
                                    {STATUSES.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
