import { useState, useEffect, useRef } from "react";
import { X, Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import Multiselect from 'multiselect-react-dropdown';
import { Badge } from "./ui/design-system";
import { type CompanyOption } from "../api/combo";

interface FilterState {
    company_name: string[] | string;
    person_name: string;
    department: string[] | string;
    designation: string;
    product_type: string[] | string;
    person_country: string[] | string;
    company_country: string[] | string;
    region: string[] | string;
}

interface FilterPanelProps {
    onFilter: (filters: FilterState) => void;
    isMobile: boolean;
    isLoading?: boolean;
    dropdownData?: {
        companies: CompanyOption[];
        departments: CompanyOption[];
        productTypes: CompanyOption[];
        countries: CompanyOption[];
        regions: CompanyOption[];
        isLoaded: boolean;
        isLoading: boolean;
    };
}

const initialFilters: FilterState = {
    company_name: "",
    person_name: "",
    department: [],
    designation: "",
    product_type: [],
    person_country: [],
    company_country: [],
    region: []
};



const FilterPanel = ({ onFilter, isMobile, isLoading = false, dropdownData }: FilterPanelProps) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [localPersonName, setLocalPersonName] = useState("");
    const [localDesignation, setLocalDesignation] = useState("");
    const [localCompanyName, setLocalCompanyName] = useState("");
    const [isOpen, setIsOpen] = useState(true);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const isInitialMount = useRef(true);

    // State for selected countries (multiselect)
    const [selectedPersonCountries, setSelectedPersonCountries] = useState<CompanyOption[]>([]);
    const [selectedCompanyCountries, setSelectedCompanyCountries] = useState<CompanyOption[]>([]);

    // State for selected departments and company types (multiselect)
    const [selectedDepartments, setSelectedDepartments] = useState<CompanyOption[]>([]);
    const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<CompanyOption[]>([]);

    // State for selected regions (multiselect)
    const [selectedRegions, setSelectedRegions] = useState<CompanyOption[]>([]);

    // Use dropdown data from props or empty arrays as fallback
    const departments = dropdownData?.departments || [];
    const productTypes = dropdownData?.productTypes || [];
    const countries = dropdownData?.countries || [];
    const regions = dropdownData?.regions || [];
    const isLoadingDropdowns = dropdownData?.isLoading || false;

    // Removed debounced variables since we only search on button click



    // Set initial mount flag to false after component has mounted
    useEffect(() => {
        isInitialMount.current = false;
    }, []);

    // Removed handleChange function - now updating state directly without API calls

    useEffect(() => {
        const count = Object.values(filters).filter(value => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== "" && value !== "All";
        }).length;
        setActiveFiltersCount(count);
    }, [filters]);

    // Remove automatic API calls on debounced changes
    // API calls will only happen when Search button is clicked

    const handlePersonCountrySelect = (selectedList: CompanyOption[]) => {
        setSelectedPersonCountries(selectedList);
        const countryNames = selectedList.map(country => country.name);
        // Only update local state, don't trigger API call
        setFilters(prev => ({ ...prev, person_country: countryNames }));
    };

    const handleCompanyCountrySelect = (selectedList: CompanyOption[]) => {
        setSelectedCompanyCountries(selectedList);
        const countryNames = selectedList.map(country => country.name);
        // Only update local state, don't trigger API call
        setFilters(prev => ({ ...prev, company_country: countryNames }));
    };

    const handleDepartmentSelect = (selectedList: CompanyOption[]) => {
        setSelectedDepartments(selectedList);
        const departmentNames = selectedList.map(dept => dept.name);
        // Only update local state, don't trigger API call
        setFilters(prev => ({ ...prev, department: departmentNames }));
    };

    const handleProductTypeSelect = (selectedList: CompanyOption[]) => {
        setSelectedCompanyTypes(selectedList);
        const productTypeNames = selectedList.map(type => type.name);
        // Only update local state, don't trigger API call
        setFilters(prev => ({ ...prev, product_type: productTypeNames }));
    };

    const handleRegionSelect = (selectedList: CompanyOption[]) => {
        setSelectedRegions(selectedList);
        const regionNames = selectedList.map(region => region.name);
        // Only update local state, don't trigger API call
        setFilters(prev => ({ ...prev, region: regionNames }));
    };

    const handleReset = () => {
        setFilters(initialFilters);
        setSelectedPersonCountries([]);
        setSelectedCompanyCountries([]);
        setSelectedDepartments([]);
        setSelectedCompanyTypes([]);
        setSelectedRegions([]);
        setLocalPersonName("");
        setLocalDesignation("");
        setLocalCompanyName("");
        // Trigger API call immediately when clearing all filters
        onFilter(initialFilters);
    };

    const clearField = (field: keyof FilterState) => {
        const newFilters = { ...filters };

        switch (field) {
            case 'company_name':
                setLocalCompanyName("");
                newFilters.company_name = "";
                break;
            case 'person_name':
                setLocalPersonName("");
                newFilters.person_name = "";
                break;
            case 'department':
                setSelectedDepartments([]);
                newFilters.department = [];
                break;
            case 'designation':
                setLocalDesignation("");
                newFilters.designation = "";
                break;
            case 'product_type':
                setSelectedCompanyTypes([]);
                newFilters.product_type = [];
                break;
            case 'person_country':
                setSelectedPersonCountries([]);
                newFilters.person_country = [];
                break;
            case 'company_country':
                setSelectedCompanyCountries([]);
                newFilters.company_country = [];
                break;
            case 'region':
                setSelectedRegions([]);
                newFilters.region = [];
                break;
        }

        // Only update local state, don't trigger API call
        setFilters(newFilters);
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filter Header */}
            {!isMobile ? (
                <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                    <button
                        className="w-full flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-md p-2 -m-2"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        aria-controls="filter-content"
                    >
                        <div className="flex items-center gap-3">
                            <Filter size={18} className="text-gray-600" />
                            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                            {activeFiltersCount > 0 && (
                                <Badge variant="primary" size="sm">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center">
                            {isOpen ? (
                                <ChevronUp size={18} className="text-gray-500" />
                            ) : (
                                <ChevronDown size={18} className="text-gray-500" />
                            )}
                        </div>
                    </button>
                </div>
            ) : (
                <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Filter size={18} className="text-gray-600" />
                            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                            {activeFiltersCount > 0 && (
                                <Badge variant="primary" size="sm">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </div>
                        <button
                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                            onClick={handleReset}
                            title="Reset filters"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Content */}
            {isOpen && (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Scrollable Filter Fields */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            {/* Company Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="company-name-input" className="block text-sm font-medium text-gray-700">
                                    Company Name
                                </label>
                                <div className="relative">
                                    <input
                                        id="company-name-input"
                                        type="text"
                                        value={localCompanyName}
                                        onChange={(e) => setLocalCompanyName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 pl-9 pr-9 text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-10"
                                        placeholder="Search by company name..."
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
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
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                        {/* Company Country Multiselect */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Company Country
                            </label>
                            <div className="relative">
                                <Multiselect
                                    options={countries}
                                    selectedValues={selectedCompanyCountries}
                                    onSelect={handleCompanyCountrySelect}
                                    onRemove={handleCompanyCountrySelect}
                                    displayValue="name"
                                    placeholder="Search and select company countries..."
                                    emptyRecordMsg="No countries found. Try a different search term."
                                    showCheckbox={true}
                                    closeIcon="cancel"
                                    showArrow={true}
                                    style={{
                                        chips: {
                                            background: '#10B981',
                                            color: 'white',
                                            fontSize: '12px',
                                            borderRadius: '4px',
                                            padding: '2px 6px',
                                            margin: '1px'
                                        },
                                        searchBox: {
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            minHeight: '40px',
                                            backgroundColor: 'white'
                                        },
                                        inputField: {
                                            margin: '0px',
                                            fontSize: '14px',
                                            color: '#374151',
                                            backgroundColor: 'transparent'
                                        },
                                        option: {
                                            color: '#374151',
                                            backgroundColor: 'white',
                                            padding: '8px 10px',
                                            fontSize: '14px',
                                            borderBottom: '1px solid #F3F4F6',
                                            cursor: 'pointer'
                                        },
                                        optionContainer: {
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            maxHeight: '200px',
                                            marginTop: '2px',
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            zIndex: 1000
                                        },
                                        multiselectContainer: {
                                            color: '#374151'
                                        },
                                        highlightOption: {
                                            backgroundColor: '#ECFDF5',
                                            color: '#047857'
                                        }
                                    }}
                                    loading={isLoadingDropdowns}
                                    disable={isLoading || isLoadingDropdowns}
                                />
                                {selectedCompanyCountries.length > 0 && (
                                    <button
                                        onClick={() => clearField('company_country')}
                                        disabled={isLoading}
                                        className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={isLoading ? 'Loading...' : 'Clear company countries'}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Person Name Input */}
                        <div className="space-y-2">
                            <label htmlFor="person-name-input" className="block text-sm font-medium text-gray-700">
                                Person Name
                            </label>
                            <div className="relative">
                                <input
                                    id="person-name-input"
                                    type="text"
                                    value={localPersonName}
                                    onChange={(e) => setLocalPersonName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 pl-9 pr-9 text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-10"
                                    placeholder="Search by person name..."
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                {localPersonName && (
                                    <button
                                        onClick={() => clearField('person_name')}
                                        disabled={isLoading}
                                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isLoading
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={isLoading ? 'Loading...' : 'Clear person name'}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Person Country Multiselect */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Person Country
                            </label>
                            <div className="relative">
                                <Multiselect
                                    options={countries}
                                    selectedValues={selectedPersonCountries}
                                    onSelect={handlePersonCountrySelect}
                                    onRemove={handlePersonCountrySelect}
                                    displayValue="name"
                                    placeholder="Search and select person countries..."
                                    emptyRecordMsg="No countries found. Try a different search term."
                                    showCheckbox={true}
                                    closeIcon="cancel"
                                    showArrow={true}
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
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            minHeight: '40px',
                                            backgroundColor: 'white'
                                        },
                                        inputField: {
                                            margin: '0px',
                                            fontSize: '14px',
                                            color: '#374151',
                                            backgroundColor: 'transparent'
                                        },
                                        option: {
                                            color: '#374151',
                                            backgroundColor: 'white',
                                            padding: '8px 10px',
                                            fontSize: '14px',
                                            borderBottom: '1px solid #F3F4F6',
                                            cursor: 'pointer'
                                        },
                                        optionContainer: {
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            maxHeight: '200px',
                                            marginTop: '2px',
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            zIndex: 1000
                                        },
                                        multiselectContainer: {
                                            color: '#374151'
                                        },
                                        highlightOption: {
                                            backgroundColor: '#F3E8FF',
                                            color: '#6B21A8'
                                        }
                                    }}
                                    loading={isLoadingDropdowns}
                                    disable={isLoading || isLoadingDropdowns}
                                />
                                {selectedPersonCountries.length > 0 && (
                                    <button
                                        onClick={() => clearField('person_country')}
                                        disabled={isLoading}
                                        className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={isLoading ? 'Loading...' : 'Clear person countries'}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Region Multiselect */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Region
                            </label>
                            <div className="relative">
                                <Multiselect
                                    options={regions}
                                    selectedValues={selectedRegions}
                                    onSelect={handleRegionSelect}
                                    onRemove={handleRegionSelect}
                                    displayValue="name"
                                    placeholder="Search and select regions..."
                                    emptyRecordMsg="No regions found. Try a different search term."
                                    showCheckbox={true}
                                    closeIcon="cancel"
                                    showArrow={true}
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
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            minHeight: '40px',
                                            backgroundColor: 'white'
                                        },
                                        inputField: {
                                            margin: '0px',
                                            fontSize: '14px',
                                            color: '#374151',
                                            backgroundColor: 'transparent'
                                        },
                                        option: {
                                            color: '#374151',
                                            backgroundColor: 'white',
                                            padding: '8px 10px',
                                            fontSize: '14px',
                                            borderBottom: '1px solid #F3F4F6',
                                            cursor: 'pointer'
                                        },
                                        optionContainer: {
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            maxHeight: '200px',
                                            marginTop: '2px',
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            zIndex: 1000
                                        },
                                        multiselectContainer: {
                                            color: '#374151'
                                        },
                                        highlightOption: {
                                            backgroundColor: '#FEF3C7',
                                            color: '#92400E'
                                        }
                                    }}
                                    loading={isLoadingDropdowns}
                                    disable={isLoading || isLoadingDropdowns}
                                />
                                {selectedRegions.length > 0 && (
                                    <button
                                        onClick={() => clearField('region')}
                                        disabled={isLoading}
                                        className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={isLoading ? 'Loading...' : 'Clear regions'}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>



                        {/* Designation Input */}
                        <div className="space-y-2">
                            <label htmlFor="designation-input" className="block text-sm font-medium text-gray-700">
                                Designation
                            </label>
                            <div className="relative">
                                <input
                                    id="designation-input"
                                    type="text"
                                    value={localDesignation}
                                    onChange={(e) => setLocalDesignation(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 pl-9 pr-9 text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-10"
                                    placeholder="Search by designation..."
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
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
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Department Multiselect */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <div className="relative">
                                <Multiselect
                                    options={departments}
                                    selectedValues={selectedDepartments}
                                    onSelect={handleDepartmentSelect}
                                    onRemove={handleDepartmentSelect}
                                    displayValue="name"
                                    placeholder="Search and select departments..."
                                    emptyRecordMsg="No departments found. Try a different search term."
                                    showCheckbox={true}
                                    closeIcon="cancel"
                                    showArrow={true}
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
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            minHeight: '40px',
                                            backgroundColor: 'white'
                                        },
                                        inputField: {
                                            margin: '0px',
                                            fontSize: '14px',
                                            color: '#374151',
                                            backgroundColor: 'transparent'
                                        },
                                        option: {
                                            color: '#374151',
                                            backgroundColor: 'white',
                                            padding: '8px 10px',
                                            fontSize: '14px',
                                            borderBottom: '1px solid #F3F4F6',
                                            cursor: 'pointer'
                                        },
                                        optionContainer: {
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            maxHeight: '200px',
                                            marginTop: '2px',
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            zIndex: 1000
                                        },
                                        multiselectContainer: {
                                            color: '#374151'
                                        },
                                        highlightOption: {
                                            backgroundColor: '#FEF3C7',
                                            color: '#92400E'
                                        }
                                    }}
                                    loading={isLoadingDropdowns}
                                    disable={isLoading || isLoadingDropdowns}
                                />
                                {selectedDepartments.length > 0 && (
                                    <button
                                        onClick={() => clearField('department')}
                                        disabled={isLoading}
                                        className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={isLoading ? 'Loading...' : 'Clear departments'}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Product Type Multiselect */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Type
                            </label>
                            <div className="relative">
                                <Multiselect
                                    options={productTypes}
                                    selectedValues={selectedCompanyTypes}
                                    onSelect={handleProductTypeSelect}
                                    onRemove={handleProductTypeSelect}
                                    displayValue="name"
                                    placeholder="Search and select product types..."
                                    emptyRecordMsg="No product types found. Try a different search term."
                                    showCheckbox={true}
                                    closeIcon="cancel"
                                    showArrow={true}
                                    style={{
                                        chips: {
                                            background: '#EF4444',
                                            color: 'white',
                                            fontSize: '12px',
                                            borderRadius: '4px',
                                            padding: '2px 6px',
                                            margin: '1px'
                                        },
                                        searchBox: {
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            minHeight: '40px',
                                            backgroundColor: 'white'
                                        },
                                        inputField: {
                                            margin: '0px',
                                            fontSize: '14px',
                                            color: '#374151',
                                            backgroundColor: 'transparent'
                                        },
                                        option: {
                                            color: '#374151',
                                            backgroundColor: 'white',
                                            padding: '8px 10px',
                                            fontSize: '14px',
                                            borderBottom: '1px solid #F3F4F6',
                                            cursor: 'pointer'
                                        },
                                        optionContainer: {
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            maxHeight: '200px',
                                            marginTop: '2px',
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            zIndex: 1000
                                        },
                                        multiselectContainer: {
                                            color: '#374151'
                                        },
                                        highlightOption: {
                                            backgroundColor: '#FEE2E2',
                                            color: '#B91C1C'
                                        }
                                    }}
                                    loading={isLoadingDropdowns}
                                    disable={isLoading || isLoadingDropdowns}
                                />
                                {selectedCompanyTypes.length > 0 && (
                                    <button
                                        onClick={() => clearField('product_type')}
                                        disabled={isLoading}
                                        className={`absolute right-3 top-3 transition-colors z-10 ${isLoading
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={isLoading ? 'Loading...' : 'Clear product types'}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        </div>
                    </div>

                    {/* Sticky Search and Clear Actions */}
                    <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    // Trigger immediate search with current values
                                    const newFilters = {
                                        company_name: localCompanyName,
                                        person_name: localPersonName,
                                        department: selectedDepartments.map(dept => dept.name),
                                        designation: localDesignation,
                                        product_type: selectedCompanyTypes.map(type => type.name),
                                        person_country: selectedPersonCountries.map(country => country.name),
                                        company_country: selectedCompanyCountries.map(country => country.name),
                                        region: selectedRegions.map(region => region.name)
                                    };
                                    setFilters(newFilters);
                                    onFilter(newFilters);
                                }}
                                disabled={isLoading}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${isLoading
                                    ? 'bg-blue-400 text-white cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                <Search size={14} />
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isLoading}
                                className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${isLoading
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                                        Clearing...
                                    </>
                                ) : (
                                    <>
                                        <X size={14} />
                                        Clear All
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
