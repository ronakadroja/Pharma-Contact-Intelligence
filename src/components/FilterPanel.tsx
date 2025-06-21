import { useState, useEffect } from "react";
import { X, Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import { Card, Input, Badge } from "./ui/design-system";

interface FilterState {
    company_name: string;
    designation: string;
    person_country: string;
}

interface FilterPanelProps {
    onFilter: (filters: FilterState) => void;
    isMobile: boolean;
}

const initialFilters: FilterState = {
    company_name: "",
    designation: "",
    person_country: ""
};

const COUNTRIES = ["All", "India", "USA", "UK", "Canada", "Australia"];
const DESIGNATIONS = ["All", "Developer", "Manager", "Director", "VP", "CXO"];

const FilterPanel = ({ onFilter, isMobile }: FilterPanelProps) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [localCompanyName, setLocalCompanyName] = useState("");
    const [isOpen, setIsOpen] = useState(true);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    const debouncedCompanyName = useDebounce(localCompanyName, 500);

    useEffect(() => {
        const count = Object.values(filters).filter(value => value !== "" && value !== "All").length;
        setActiveFiltersCount(count);
    }, [filters]);

    useEffect(() => {
        handleChange("company_name", debouncedCompanyName);
    }, [debouncedCompanyName]);

    const handleChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value === "All" ? "" : value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleReset = () => {
        setFilters(initialFilters);
        onFilter(initialFilters);
    };

    return (
        <Card variant="elevated" padding="none" className="overflow-hidden">
            {/* Filter Header */}
            <div
                className={`p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between ${!isMobile ? 'cursor-pointer' : ''}`}
                onClick={() => !isMobile && setIsOpen(!isOpen)}
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
                    {!isMobile && (
                        <button
                            className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-200 rounded-full transition-colors"
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
                    {/* Company Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                        </label>
                        <div className="relative">
                            <input
                                value={localCompanyName}
                                onChange={(e) => setLocalCompanyName(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow pl-10"
                                placeholder="Enter company name..."
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Filter Groups */}
                    <div className="space-y-6">
                        {/* Designation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Designation
                            </label>
                            <select
                                value={filters.designation || "All"}
                                onChange={(e) => handleChange("designation", e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                            >
                                {DESIGNATIONS.map(designation => (
                                    <option key={designation} value={designation}>{designation}</option>
                                ))}
                            </select>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                            </label>
                            <select
                                value={filters.person_country || "All"}
                                onChange={(e) => handleChange("person_country", e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                            >
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FilterPanel;
