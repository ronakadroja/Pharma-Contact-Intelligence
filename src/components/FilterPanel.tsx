import { useState, useEffect } from "react";
import { X, Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import { Card, Badge } from "./ui/design-system";

interface FilterState {
    company_name: string;
    designation: string;
    person_country: string;
}

interface FilterPanelProps {
    onFilter: (filters: FilterState) => void;
    isMobile: boolean;
    isLoading?: boolean;
}

const initialFilters: FilterState = {
    company_name: "",
    designation: "",
    person_country: ""
};



const FilterPanel = ({ onFilter, isMobile, isLoading = false }: FilterPanelProps) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [localCompanyName, setLocalCompanyName] = useState("");
    const [localDesignation, setLocalDesignation] = useState("");
    const [localCountry, setLocalCountry] = useState("");
    const [isOpen, setIsOpen] = useState(true);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    const debouncedCompanyName = useDebounce(localCompanyName, 500);
    const debouncedDesignation = useDebounce(localDesignation, 500);
    const debouncedCountry = useDebounce(localCountry, 500);

    useEffect(() => {
        const count = Object.values(filters).filter(value => value !== "" && value !== "All").length;
        setActiveFiltersCount(count);
    }, [filters]);

    useEffect(() => {
        handleChange("company_name", debouncedCompanyName);
    }, [debouncedCompanyName]);

    useEffect(() => {
        handleChange("designation", debouncedDesignation);
    }, [debouncedDesignation]);

    useEffect(() => {
        handleChange("person_country", debouncedCountry);
    }, [debouncedCountry]);

    const handleChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value === "All" ? "" : value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleReset = () => {
        setFilters(initialFilters);
        setLocalCompanyName("");
        setLocalDesignation("");
        setLocalCountry("");
        // Trigger API call immediately when clearing all filters
        onFilter(initialFilters);
    };

    const clearField = (field: keyof FilterState) => {
        let newFilters = { ...filters };

        switch (field) {
            case 'company_name':
                setLocalCompanyName("");
                newFilters.company_name = "";
                break;
            case 'designation':
                setLocalDesignation("");
                newFilters.designation = "";
                break;
            case 'person_country':
                setLocalCountry("");
                newFilters.person_country = "";
                break;
        }

        // Update filters state and trigger API call immediately
        setFilters(newFilters);
        onFilter(newFilters);
    };

    return (
        <Card variant="elevated" padding="none" className="overflow-hidden">
            {/* Filter Header */}
            {!isMobile ? (
                <button
                    className="w-full p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls="filter-content"
                >
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-neutral-500" />
                        <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                        {activeFiltersCount > 0 && (
                            <Badge variant="primary" size="sm">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-200 rounded-full transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReset();
                            }}
                            title="Reset filters"
                        >
                            <X size={18} />
                        </button>
                        <span className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-200 rounded-full transition-colors">
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                    </div>
                </button>
            ) : (
                <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-neutral-500" />
                        <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                        {activeFiltersCount > 0 && (
                            <Badge variant="primary" size="sm">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </div>
                    <button
                        className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-200 rounded-full transition-colors"
                        onClick={handleReset}
                        title="Reset filters"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Filter Content */}
            <div
                id="filter-content"
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 space-y-6">
                    {/* Company Name Input */}
                    <div>
                        <label htmlFor="company-name-input" className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                        </label>
                        <div className="relative">
                            <input
                                id="company-name-input"
                                type="text"
                                value={localCompanyName}
                                onChange={(e) => setLocalCompanyName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10"
                                placeholder="Search by company name..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {localCompanyName && (
                                <button
                                    onClick={() => clearField('company_name')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear company name'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Designation Input */}
                    <div>
                        <label htmlFor="designation-input" className="block text-sm font-medium text-gray-700 mb-2">
                            Designation
                        </label>
                        <div className="relative">
                            <input
                                id="designation-input"
                                type="text"
                                value={localDesignation}
                                onChange={(e) => setLocalDesignation(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10"
                                placeholder="Search by designation..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {localDesignation && (
                                <button
                                    onClick={() => clearField('designation')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear designation'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Country Input */}
                    <div>
                        <label htmlFor="country-input" className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                        </label>
                        <div className="relative">
                            <input
                                id="country-input"
                                type="text"
                                value={localCountry}
                                onChange={(e) => setLocalCountry(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-10"
                                placeholder="Search by country..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {localCountry && (
                                <button
                                    onClick={() => clearField('person_country')}
                                    disabled={isLoading}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title={isLoading ? 'Loading...' : 'Clear country'}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search and Clear Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => {
                                // Trigger immediate search with current values
                                const newFilters = {
                                    company_name: localCompanyName,
                                    designation: localDesignation,
                                    person_country: localCountry
                                };
                                setFilters(newFilters);
                                onFilter(newFilters);
                            }}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${isLoading
                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <Search size={16} />
                            Search

                        </button>
                        <button
                            onClick={handleReset}
                            disabled={isLoading}
                            className={`px-4 py-2.5 border rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${isLoading
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                                    Clearing...
                                </>
                            ) : (
                                <>
                                    <X size={16} />
                                    Clear All
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Card >
    );
};

export default FilterPanel;
