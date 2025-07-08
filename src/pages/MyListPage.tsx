import { CheckCircle, Download, Mail, Phone, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSavedContacts } from '../api/contacts';
import Header from '../components/Header';
import { Badge, Button, Card, CardContent, CardHeader } from '../components/ui/design-system';
import { useToast } from '../context/ToastContext';
import { exportContacts } from '../utils/csvExport';
import {
    validateCredits,
    validateEmail,
    validateRequired,
    type FormErrors,
    type ValidationResult
} from '../utils/validation';

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

    // Computed values
    const selectedContacts = useMemo(() => {
        return savedContacts.filter(contact => selectedContactIds.has(contact.id || ''));
    }, [savedContacts, selectedContactIds]);

    const hasSelectedContacts = selectedContacts.length > 0;

    // Validation functions
    const validateContactData = (contact: SavedContact): ValidationResult => {
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
    };

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
            const contactValidation = validateContactData(contact);
            if (!contactValidation.isValid) {
                return {
                    isValid: false,
                    error: `Invalid contact data for ${contact.person_name}: ${contactValidation.error}`
                };
            }
        }

        return { isValid: true };
    }, [availableCredit, selectedContacts]);

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
    }, []);

    // Data fetching with validation - runs only once on mount
    useEffect(() => {
        const fetchSavedContacts = async () => {
            try {
                setIsLoading(true);
                const response = await getSavedContacts();

                if (response) {
                    // Validate credit information
                    const newValidationErrors: FormErrors = {};
                    const creditValidation = validateCredits(response.available_credit);
                    if (!creditValidation.isValid) {
                        newValidationErrors.credits = creditValidation.error || '';
                        showError('Invalid credit information received from server', {
                            title: 'Data Validation Error',
                            duration: 6000
                        });
                    }

                    setAvailableCredit(response.available_credit);

                    // Format and validate contact data
                    const formattedContacts = response.my_list.map((contact, index) => {
                        const formattedContact = {
                            ...contact,
                            id: index.toString(),
                            is_verified: contact.is_verified || 0
                        };

                        // Validate each contact's data integrity
                        const contactValidation = validateContactData(formattedContact);
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
                } else {
                    showError('Failed to load saved contacts', {
                        title: 'Error',
                        duration: 6000
                    });
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
    }, [showError]); // Only depends on showError which is stable

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
            const validation = validateContactData(contact);
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
    }, [selectedContacts, savedContacts, selectedContactIds, validateExportOperation, validateContactSelection, success, showError]);

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
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-4">
                <Card variant="elevated" padding="lg">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">My Contact List</h1>
                                <p className="text-sm text-gray-600 mt-1">Available Credits: {availableCredit}</p>
                                {parseInt(availableCredit) <= 50 && (
                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md">
                                        <XCircle size={16} className="text-red-500" />
                                        <span className="text-sm text-red-700 font-medium">
                                            Low Credits: {availableCredit} remaining. Need more than 50 to reveal new contacts.
                                        </span>
                                    </div>
                                )}
                                {/* Validation Summary */}
                                {(() => {
                                    const invalidContacts = savedContacts.filter(contact => !validateContactData(contact).isValid);
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
                    </CardHeader>
                    <CardContent>
                        {savedContacts.length === 0 ? (
                            <div className="text-center py-12">
                                <Download size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">Your contact list is empty</p>
                                <p className="text-gray-500">Add contacts from the main listing page</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={savedContacts.length > 0 && selectedContactIds.size === savedContacts.length}
                                                        ref={(el) => {
                                                            if (el) {
                                                                el.indeterminate = selectedContactIds.size > 0 && selectedContactIds.size < savedContacts.length;
                                                            }
                                                        }}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedContactIds(new Set(savedContacts.map(contact => contact.id || '')));
                                                            } else {
                                                                setSelectedContactIds(new Set());
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2">Select</span>
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact Info
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {savedContacts.map((contact, index) => {
                                            const isSelected = selectedContactIds.has(contact.id || '');
                                            return (
                                                <tr
                                                    key={contact.id || index}
                                                    className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                const newSet = new Set(selectedContactIds);
                                                                if (isSelected) {
                                                                    newSet.delete(contact.id || '');
                                                                } else {
                                                                    newSet.add(contact.id || '');
                                                                }
                                                                setSelectedContactIds(newSet);
                                                            }}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-900">{contact.person_name}</span>
                                                                <Badge
                                                                    variant={contact.status === 'Active' ? 'success' : 'error'}
                                                                    size="sm"
                                                                >
                                                                    {contact.status}
                                                                </Badge>
                                                                {/* Validation status indicator */}
                                                                {(() => {
                                                                    const validation = validateContactData(contact);
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
                                                                {contact.designation} | {contact.department}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">{contact.company_name}</span>
                                                            {contact.company_website && (
                                                                <a
                                                                    href={contact.company_website}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 hover:underline mt-1"
                                                                >
                                                                    {contact.company_website}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <a
                                                                href={`mailto:${contact.email}`}
                                                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                            >
                                                                <Mail size={14} />
                                                                {contact.email}
                                                            </a>
                                                            {contact.phone_number && (
                                                                <a
                                                                    href={`tel:${contact.phone_number}`}
                                                                    className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                                                                >
                                                                    <Phone size={14} />
                                                                    {contact.phone_number}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {contact.city}, {contact.person_country}
                                                            {contact.company_country && contact.company_country !== contact.person_country && (
                                                                <div className="text-xs text-gray-500">Company: {contact.company_country}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className={`flex items-center gap-1 text-xs ${contact.is_verified === 1 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            {contact.is_verified === 1 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                            {contact.is_verified === 1 ? 'Verified' : 'Not Verified'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {(contact.person_linkedin_url || contact.company_linkedin_url) && (
                                                                <div className="flex flex-col gap-1">
                                                                    {contact.person_linkedin_url && (
                                                                        <a
                                                                            href={contact.person_linkedin_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xs text-blue-600 hover:underline"
                                                                        >
                                                                            Personal LinkedIn
                                                                        </a>
                                                                    )}
                                                                    {contact.company_linkedin_url && (
                                                                        <a
                                                                            href={contact.company_linkedin_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xs text-blue-600 hover:underline"
                                                                        >
                                                                            Company LinkedIn
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {/* <button
                                                                onClick={() => handleRemove(contact)}
                                                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                                title="Remove contact"
                                                                disabled={isExporting}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button> */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
};

export default MyListPage;