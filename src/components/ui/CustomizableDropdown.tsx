import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface DropdownOption {
  id: string;
  name: string;
}

interface CustomizableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  onClear?: () => void;
  label?: string;
  id?: string;
  className?: string;
  allowCustomInput?: boolean;
}

const CustomizableDropdown: React.FC<CustomizableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No options found",
  disabled = false,
  loading = false,
  onClear,
  label,
  id,
  className = "",
  allowCustomInput = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [customValue, setCustomValue] = useState('');
  const [isSelectingOption, setIsSelectingOption] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current value exists in options
  const selectedOption = options.find(option => option.name === value);
  const isCustomValue = !selectedOption && value;
  const displayValue = selectedOption ? selectedOption.name : (isCustomValue ? value : '');

  // Handle blur - preserve custom input automatically
  const handleBlur = useCallback(() => {
    console.log('handleBlur called', { searchTerm, allowCustomInput, isSelectingOption });

    // Only use custom input if user typed something and it's not selecting an option
    if (allowCustomInput && searchTerm.trim() && !isSelectingOption) {
      console.log('Applying custom input:', searchTerm.trim());
      // Always use the typed value as custom input when clicking outside
      onChange(searchTerm.trim());
      setCustomValue(searchTerm.trim());
    }
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    setIsSelectingOption(false);
  }, [searchTerm, allowCustomInput, isSelectingOption, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleBlur]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        } else if (allowCustomInput && searchTerm.trim()) {
          // Allow custom input on Enter
          onChange(searchTerm.trim());
          setCustomValue(searchTerm.trim());
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        // Handle tab - preserve custom input automatically
        if (allowCustomInput && searchTerm.trim()) {
          onChange(searchTerm.trim());
          setCustomValue(searchTerm.trim());
        }
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelect = (option: DropdownOption) => {
    setIsSelectingOption(true);
    onChange(option.name);
    setCustomValue('');
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    // Reset the selecting flag after a short delay
    setTimeout(() => setIsSelectingOption(false), 100);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setCustomValue('');
    if (onClear) onClear();
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Input changed:', newValue);
    setSearchTerm(newValue);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={`w-full border border-neutral-300 rounded-xl px-4 py-2.5 pr-10 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all bg-white cursor-pointer ${disabled || loading ? 'bg-neutral-50 cursor-not-allowed' : ''
            }`}
          onClick={toggleDropdown}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={allowCustomInput ? "Search or type custom value..." : "Search..."}
              className="w-full outline-none bg-transparent text-sm"
              disabled={disabled || loading}
            />
          ) : (
            <span className={`text-sm ${displayValue ? 'text-neutral-900' : 'text-neutral-400'}`}>
              {loading ? 'Loading...' : displayValue || placeholder}
              {isCustomValue && allowCustomInput && (
                <span className="text-xs text-neutral-500 ml-2">(custom)</span>
              )}
            </span>
          )}
        </div>

        {/* Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && !loading && (
            <button
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            size={18}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-neutral-500">Loading...</div>
            ) : (
              <>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.id}
                      className={`px-4 py-3 text-sm cursor-pointer transition-colors ${index === highlightedIndex
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-50'
                        } ${value === option.name ? 'bg-primary-100 text-primary-800 font-medium' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsSelectingOption(true);
                      }}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {option.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-neutral-500">
                    {allowCustomInput && searchTerm ? (
                      <div>
                        <div className="text-neutral-500 mb-2">{emptyMessage}</div>
                        <div className="text-primary-600 font-medium">
                          Click outside to use "{searchTerm}" as custom value
                        </div>
                      </div>
                    ) : (
                      emptyMessage
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizableDropdown;
