import { CheckCircle, Download, Linkedin, Mail, Phone, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSavedContacts } from '../api/contacts';
import Header from '../components/Header';
import Table from '../components/Table';
import { Button, Card } from '../components/ui/design-system';
import { useToast } from '../context/ToastContext';
import { exportContacts } from '../utils/csvExport';
import {
    validateCredits,
    validateEmail,
    validateRequired,
    type FormErrors,
    type ValidationResult
} from '../utils/validation';
import type { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';

interface SavedContact {
    id?: string;
    company_name: string;
    person_name: string;
    department: string;
    designation: string;
    company_type: string | null;
    email: string;
    phone_number: string;
    city: string;
    person_country: string;
    company_country: string;
    person_linkedin_url: string | null;
    company_linkedin_url: string | null;
    company_website: string | null;
    status: 'Active' | 'Inactive';
    is_verified: number;
}



const MyListPage = () => {
    const { success, error: showError } = useToast();

    // Core state
    const [isLoading, setIsLoading] = useState(true);
    const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
    const [availableCredit, setAvailableCredit] = useState<string>('');
    const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
    const [isExporting, setIsExporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<FormErrors>({});

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
    const tableScrollRef = useRef<HTMLDivElement>(null);

    // Computed values
    const selectedContacts = useMemo(() => {
        return savedContacts.filter(contact => selectedContactIds.has(contact.id || ''));
    }, [savedContacts, selectedContactIds]);

    const hasSelectedContacts = selectedContacts.length > 0;

    // Validation functions
    const validateSavedContactData = useCallback((contact: SavedContact): ValidationResult => {
        // Validate required fields
        if (!validateRequired(contact.company_name, 'Company name').isValid) {
            return { isValid: false, error: 'Company name is required' };
        }

        if (!validateRequired(contact.person_name, 'Person name').isValid) {
            return { isValid: false, error: 'Person name is required' };
        }

        if (!validateEmail(contact.email).isValid) {
            return { isValid: false, error: 'Valid email is required' };
        }

        if (!validateRequired(contact.department, 'Department').isValid) {
            return { isValid: false, error: 'Department is required' };
        }

        if (!validateRequired(contact.designation, 'Designation').isValid) {
            return { isValid: false, error: 'Designation is required' };
        }

        if (!validateRequired(contact.person_country, 'Person country').isValid) {
            return { isValid: false, error: 'Person country is required' };
        }

        if (!validateRequired(contact.company_country, 'Company country').isValid) {
            return { isValid: false, error: 'Company country is required' };
        }

        return { isValid: true };
    }, []);

    // Table columns definition
    const columns: ColumnDef<SavedContact>[] = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                    aria-label="Select all contacts"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    aria-label={`Select contact ${row.original.person_name}`}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'person_name',
            header: 'Contact Name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{row.original.person_name}</span>
                        {row.original.person_linkedin_url && (
                            <a
                                href={row.original.person_linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="View LinkedIn Profile"
                            >
                                <Linkedin size={16} />
                            </a>
                        )}
                        {/* Validation status indicator */}
                        {(() => {
                            const validation = validateSavedContactData(row.original);
                            if (!validation.isValid) {
                                return (
                                    <div
                                        className="flex items-center gap-1 text-xs text-red-600"
                                        title={`Validation Error: ${validation.error}`}
                                    >
                                        <XCircle size={12} />
                                        <span>Invalid</span>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {row.original.designation} | {row.original.department}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'company_name',
            header: 'Company',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{row.original.company_name}</span>
                        {row.original.company_linkedin_url && (
                            <a
                                href={row.original.company_linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="View Company LinkedIn"
                            >
                                <Linkedin size={16} />
                            </a>
                        )}
                    </div>
                    {row.original.company_website && (
                        <a
                            href={row.original.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1"
                        >
                            {row.original.company_website}
                        </a>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'contact_info',
            header: 'Contact Info',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <a
                        href={`mailto:${row.original.email}`}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                        <Mail size={14} />
                        {row.original.email}
                    </a>
                    {row.original.phone_number && (
                        <a
                            href={`tel:${row.original.phone_number}`}
                            className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                        >
                            <Phone size={14} />
                            {row.original.phone_number}
                        </a>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'location',
            header: 'Location',
            cell: ({ row }) => (
                <div className="text-sm text-gray-900">
                    {row.original.city}, {row.original.person_country}
                    {row.original.company_country && row.original.company_country !== row.original.person_country && (
                        <div className="text-xs text-gray-500">Company: {row.original.company_country}</div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className={`flex items-center gap-1 text-xs ${row.original.is_verified === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.original.is_verified === 1 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {row.original.is_verified === 1 ? 'Verified' : 'Not Verified'}
                </div>
            ),
        },
        // {
        //     accessorKey: 'actions',
        //     header: 'Actions',
        //     cell: ({ row }) => (
        //         <div className="flex items-center gap-2">
        //             {(row.original.person_linkedin_url || row.original.company_linkedin_url) && (
        //                 <div className="flex flex-col gap-1">
        //                     {row.original.person_linkedin_url && (
        //                         <a
        //                             href={row.original.person_linkedin_url}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="text-xs text-blue-600 hover:underline"
        //                         >
        //                             Personal LinkedIn
        //                         </a>
        //                     )}
        //                     {row.original.company_linkedin_url && (
        //                         <a
        //                             href={row.original.company_linkedin_url}
        //                             target="_blank"
        //                             rel="noopener noreferrer"
        //                             className="text-xs text-blue-600 hover:underline"
        //                         >
        //                             Company LinkedIn
        //                         </a>
        //                     )}
        //                 </div>
        //             )}
        //         </div>
        //     ),
        // },
    ], [validateSavedContactData]);

    const validateExportOperation = useCallback((): ValidationResult => {
        // Check if user has sufficient credits
        const creditValidation = validateCredits(availableCredit);
        if (!creditValidation.isValid) {
            return { isValid: false, error: 'Invalid credit information' };
        }

        // Check if any contacts are selected
        if (selectedContacts.length === 0) {
            return { isValid: false, error: 'Please select at least one contact to export' };
        }

        // Validate selected contacts data integrity
        for (const contact of selectedContacts) {
            const contactValidation = validateSavedContactData(contact);
            if (!contactValidation.isValid) {
                return {
                    isValid: false,
                    error: `Invalid contact data for ${contact.person_name}: ${contactValidation.error}`
                };
            }
        }

        return { isValid: true };
    }, [availableCredit, selectedContacts, validateSavedContactData]);

    const validateContactSelection = useCallback((contactIds: Set<string>): ValidationResult => {
        if (contactIds.size === 0) {
            return { isValid: false, error: 'No contacts selected' };
        }

        // Check if all selected contact IDs exist in the saved contacts
        const existingIds = new Set(savedContacts.map(contact => contact.id || ''));
        for (const id of contactIds) {
            if (!existingIds.has(id)) {
                return { isValid: false, error: 'Selected contact no longer exists' };
            }
        }

        return { isValid: true };
    }, [savedContacts]);

    const handleClearSelection = useCallback(() => {
        setSelectedContactIds(new Set());
        setSelectedRows({});
    }, []);

    // Sync selectedRows with selectedContactIds
    useEffect(() => {
        const newSelectedRows: RowSelectionState = {};
        savedContacts.forEach((contact, index) => {
            if (selectedContactIds.has(contact.id || '')) {
                newSelectedRows[index] = true;
            }
        });
        setSelectedRows(newSelectedRows);
    }, [selectedContactIds, savedContacts]);

    // Handle table row selection changes
    const handleRowSelectionChange = useCallback((updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
        const newSelectedRows = typeof updater === 'function' ? updater(selectedRows) : updater;
        setSelectedRows(newSelectedRows);

        // Update selectedContactIds based on table selection
        const newSelectedIds = new Set<string>();
        Object.keys(newSelectedRows).forEach(indexStr => {
            const index = parseInt(indexStr);
            if (newSelectedRows[index] && savedContacts[index]) {
                newSelectedIds.add(savedContacts[index].id || '');
            }
        });
        setSelectedContactIds(newSelectedIds);
    }, [selectedRows, savedContacts]);

    // Data fetching with validation - runs only once on mount
    useEffect(() => {
        const fetchSavedContacts = async () => {
            try {
                setIsLoading(true);
                const response = await getSavedContacts();

                // Handle successful response (including empty responses)
                if (response && typeof response === 'object') {
                    // Validate credit information
                    const newValidationErrors: FormErrors = {};

                    // Set available credit (default to '0' if not provided)
                    const availableCredit = response.available_credit || '0';
                    const creditValidation = validateCredits(availableCredit);
                    if (!creditValidation.isValid) {
                        newValidationErrors.credits = creditValidation.error || '';
                        showError('Invalid credit information received from server', {
                            title: 'Data Validation Error',
                            duration: 6000
                        });
                    }

                    setAvailableCredit(availableCredit);

                    // Handle contact list (may be empty array or undefined)
                    const contactList = response.my_list || [];

                    // Format and validate contact data
                    const formattedContacts = contactList.map((contact, index) => {
                        const formattedContact = {
                            ...contact,
                            id: index.toString(),
                            is_verified: contact.is_verified || 0
                        };

                        // Validate each contact's data integrity
                        const contactValidation = validateSavedContactData(formattedContact);
                        if (!contactValidation.isValid) {
                            console.warn(`Contact validation failed for ${contact.person_name}:`, contactValidation.error);
                            newValidationErrors[`contact_${index}`] = contactValidation.error || '';
                        }

                        return formattedContact;
                    });

                    setSavedContacts(formattedContacts);
                    setValidationErrors(newValidationErrors);

                    // Show validation summary if there are errors
                    const errorCount = Object.keys(newValidationErrors).length;
                    if (errorCount > 0) {
                        showError(`${errorCount} contact(s) have data validation issues. Please review the contact information.`, {
                            title: 'Data Validation Warning',
                            duration: 8000
                        });
                    }

                    // Show success message for empty list (optional)
                    if (contactList.length === 0) {
                        console.log('No saved contacts found - this is normal for new users or users who haven\'t saved any contacts yet.');
                    }
                } else {
                    // Only show error if response is truly invalid (null, undefined, or not an object)
                    console.error('Invalid response format from getSavedContacts:', response);
                    showError('Invalid response format from server', {
                        title: 'Error',
                        duration: 6000
                    });
                    // Set default values for empty state
                    setAvailableCredit('0');
                    setSavedContacts([]);
                }
            } catch (error) {
                console.error('Error fetching saved contacts:', error);
                showError('Failed to load saved contacts', {
                    title: 'Error',
                    duration: 6000
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSavedContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally empty - only run on mount to prevent re-runs on export button clicks

    // Manual refresh function for when needed
    // const refreshContacts = useCallback(async () => {
    //     try {
    //         setIsLoading(true);
    //         const response = await getSavedContacts();

    //         if (response) {
    //             // Validate credit information
    //             const newValidationErrors: FormErrors = {};
    //             const creditValidation = validateCredits(response.available_credit);
    //             if (!creditValidation.isValid) {
    //                 newValidationErrors.credits = creditValidation.error || '';
    //                 showError('Invalid credit information received from server', {
    //                     title: 'Data Validation Error',
    //                     duration: 6000
    //                 });
    //             }

    //             setAvailableCredit(response.available_credit);

    //             // Format and validate contact data
    //             const formattedContacts = response.my_list.map((contact, index) => {
    //                 const formattedContact = {
    //                     ...contact,
    //                     id: index.toString(),
    //                     is_verified: contact.is_verified || 0
    //                 };

    //                 // Validate each contact's data integrity
    //                 const contactValidation = validateContactData(formattedContact);
    //                 if (!contactValidation.isValid) {
    //                     console.warn(`Contact validation failed for ${contact.person_name}:`, contactValidation.error);
    //                     newValidationErrors[`contact_${index}`] = contactValidation.error || '';
    //                 }

    //                 return formattedContact;
    //             });

    //             setSavedContacts(formattedContacts);
    //             setValidationErrors(newValidationErrors);

    //             success('Contacts refreshed successfully!', {
    //                 title: 'Success',
    //                 duration: 3000
    //             });
    //         } else {
    //             showError('Failed to refresh contacts', {
    //                 title: 'Error',
    //                 duration: 6000
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error refreshing contacts:', error);
    //         showError('Failed to refresh contacts', {
    //             title: 'Error',
    //             duration: 6000
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [showError, success]);

    // Contact actions with validation
    // const handleRemove = useCallback((contact: SavedContact) => {
    //     // Validate contact data before removal
    //     if (!contact.id) {
    //         showError('Cannot remove contact: Invalid contact ID', {
    //             title: 'Removal Error',
    //             duration: 5000
    //         });
    //         return;
    //     }

    //     if (!contact.person_name) {
    //         showError('Cannot remove contact: Missing contact name', {
    //             title: 'Removal Error',
    //             duration: 5000
    //         });
    //         return;
    //     }

    //     // Check if contact exists in the list
    //     const contactExists = savedContacts.some(c => c.id === contact.id);
    //     if (!contactExists) {
    //         showError('Contact no longer exists in your list', {
    //             title: 'Removal Error',
    //             duration: 5000
    //         });
    //         return;
    //     }

    //     setSavedContacts(prev => prev.filter(c => c.id !== contact.id));
    //     setSelectedContactIds(prev => {
    //         const newSet = new Set(prev);
    //         newSet.delete(contact.id || '');
    //         return newSet;
    //     });
    //     success(`Removed ${contact.person_name} from your list`, {
    //         title: 'Contact Removed'
    //     });
    // }, [savedContacts, success, showError]);

    const handleExport = useCallback((exportType: 'selected' | 'all') => {
        // Validate export operation before starting
        if (exportType === 'selected') {
            const exportValidation = validateExportOperation();
            if (!exportValidation.isValid) {
                showError(exportValidation.error || 'Export validation failed', {
                    title: 'Export Validation Error',
                    duration: 6000
                });
                return;
            }

            const selectionValidation = validateContactSelection(selectedContactIds);
            if (!selectionValidation.isValid) {
                showError(selectionValidation.error || 'Invalid contact selection', {
                    title: 'Selection Error',
                    duration: 5000
                });
                return;
            }
        }

        setIsExporting(true);

        const contactsToExport = exportType === 'selected' ? selectedContacts : savedContacts;

        // Validate contacts before export
        const invalidContacts: string[] = [];
        contactsToExport.forEach(contact => {
            const validation = validateSavedContactData(contact);
            if (!validation.isValid) {
                invalidContacts.push(`${contact.person_name}: ${validation.error}`);
            }
        });

        if (invalidContacts.length > 0) {
            showError(`Cannot export contacts with validation errors:\n${invalidContacts.slice(0, 3).join('\n')}${invalidContacts.length > 3 ? `\n...and ${invalidContacts.length - 3} more` : ''}`, {
                title: 'Contact Validation Error',
                duration: 10000
            });
            setIsExporting(false);
            return;
        }

        exportContacts(
            contactsToExport,
            exportType,
            (count) => {
                success(`${count} contacts exported successfully!`, {
                    title: 'Export Complete',
                    duration: 4000
                });

                if (exportType === 'selected') {
                    setSelectedContactIds(new Set());
                }
                setIsExporting(false);
            },
            (error) => {
                showError(error, {
                    title: 'Export Failed',
                    duration: 6000
                });
                setIsExporting(false);
            }
        );
    }, [selectedContacts, savedContacts, selectedContactIds, validateExportOperation, validateContactSelection, success, showError, validateSavedContactData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto p-4">
                    <Card variant="elevated" padding="lg">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-12 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 min-h-0 p-5">
                <Card variant="elevated" padding="none" className="h-full overflow-hidden">
                    <div className="h-full flex flex-col">
                        {/* Header Section - Fixed */}
                        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900">My Contact List</h1>
                                    <p className="text-sm text-gray-600 mt-1">Available Credits: {availableCredit}</p>
                                    {/* Validation Summary */}
                                    {(() => {
                                        const invalidContacts = savedContacts.filter(contact => !validateSavedContactData(contact).isValid);
                                        if (invalidContacts.length > 0) {
                                            return (
                                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-md">
                                                    <XCircle size={16} className="text-yellow-600" />
                                                    <span className="text-sm text-yellow-700 font-medium">
                                                        {invalidContacts.length} contact(s) have validation issues. Check contact details.
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <div className="flex items-center gap-3 mt-2">
                                        {hasSelectedContacts ? (
                                            <>
                                                <p className="text-sm text-blue-600">
                                                    {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                                                </p>
                                                <button
                                                    onClick={handleClearSelection}
                                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Clear selection"
                                                >
                                                    <X size={12} />
                                                    Clear
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Use checkboxes to select contacts for export
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    {hasSelectedContacts && (
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => handleExport('selected')}
                                            disabled={isExporting}
                                            loading={isExporting}
                                            icon={<Download size={16} />}
                                        >
                                            Export Selected ({selectedContacts.length}) Excel
                                        </Button>
                                    )}
                                    <Button
                                        variant={hasSelectedContacts ? "outline" : "primary"}
                                        size="md"
                                        onClick={() => handleExport('all')}
                                        disabled={savedContacts.length === 0 || isExporting}
                                        loading={isExporting}
                                        icon={<Download size={16} />}
                                    >
                                        Export All ({savedContacts.length}) Excel
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table Section with Scroll - Only table content scrolls */}
                        <div className="flex-1 min-h-0">
                            <Table
                                data={savedContacts}
                                columns={columns}
                                isLoading={isLoading}
                                sorting={sorting}
                                onSortingChange={setSorting}
                                enableSorting={true}
                                enableSelection={true}
                                selectedRows={selectedRows}
                                onSelectionChange={handleRowSelectionChange}
                                enablePagination={false}
                                enableTableScroll={true}
                                tableHeight="100%"
                                scrollContainerRef={tableScrollRef}
                                showScrollToTop={true}
                                emptyStateMessage="Your contact list is empty. Add contacts from the main listing page."
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div >
    );
};

export default MyListPage;