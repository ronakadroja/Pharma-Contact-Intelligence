import Header from "../components/Header";
import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { useState, useEffect } from "react";
import { Trash2, Download, Mail, Phone, Building2, MapPin, Briefcase } from "lucide-react";
import { getSavedContacts, type SavedContactsResponse } from "../api/contacts";

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
}

const MyListPage = () => {
    const { success, error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
    const [availableCredit, setAvailableCredit] = useState<string>("");

    const fetchSavedContacts = async () => {
        try {
            const response = await getSavedContacts();
            const formattedContacts = response.my_list.map((contact, index) => ({
                ...contact,
                id: index.toString() // Adding temporary id for list rendering
            }));
            setSavedContacts(formattedContacts);
            setAvailableCredit(response.available_credit);
            setIsLoading(false);
        } catch (err: any) {
            console.error('Error fetching saved contacts:', err);

            // Extract error message from different possible response structures
            let errorMessage = 'Failed to fetch saved contacts';

            if (err?.response?.data) {
                if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }

            showError(errorMessage, {
                title: 'Failed to Load Contacts',
                duration: 8000,
                actions: [
                    {
                        label: 'Retry',
                        onClick: () => fetchSavedContacts(),
                        variant: 'primary'
                    }
                ]
            });
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedContacts();
    }, []);

    const handleRemove = (contact: SavedContact) => {
        setSavedContacts(prev => prev.filter(c => c.id !== contact.id));
        success(`Removed ${contact.person_name} from your list`, {
            title: 'Contact Removed'
        });
    };

    const handleExport = () => {
        try {
            // Convert contacts to CSV format
            const headers = [
                'Company Name',
                'Contact Person',
                'Department',
                'Designation',
                'Company Type',
                'Email',
                'Phone Number',
                'City',
                'Person Country',
                'Company Country',
                'LinkedIn URL',
                'Company LinkedIn',
                'Company Website',
                'Status'
            ];

            const csvData = savedContacts.map(contact => [
                contact.company_name,
                contact.person_name,
                contact.department,
                contact.designation,
                contact.company_type || '',
                contact.email,
                contact.phone_number,
                contact.city,
                contact.person_country,
                contact.company_country,
                contact.person_linkedin_url || '',
                contact.company_linkedin_url || '',
                contact.company_website || '',
                contact.status
            ]);

            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Create and download the file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `saved-contacts-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            success('Contacts exported successfully!', {
                title: 'Export Complete'
            });
        } catch (error) {
            console.error('Error exporting contacts:', error);
            showError('Failed to export contacts', {
                title: 'Export Failed',
                duration: 6000
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">My Contact List</h1>
                            <p className="text-sm text-gray-600 mt-1">Available Credits: {availableCredit}</p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            disabled={savedContacts.length === 0}
                        >
                            <Download size={20} />
                            Export Contacts
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-12 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ) : savedContacts.length === 0 ? (
                        <div className="text-center py-12">
                            <Download size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">Your contact list is empty</p>
                            <p className="text-gray-500">Add contacts from the main listing page</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {savedContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    className="flex flex-col p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {contact.person_name}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${contact.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {contact.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Briefcase size={16} />
                                                <span>{contact.designation}</span>
                                                <span className="text-gray-400">|</span>
                                                <span>{contact.department}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(contact)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                            title="Remove contact"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{contact.company_name}</span>
                                            </div>
                                            {contact.company_website && (
                                                <a
                                                    href={contact.company_website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline ml-6"
                                                >
                                                    {contact.company_website}
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {contact.city}, {contact.person_country}
                                                {contact.company_country && contact.company_country !== contact.person_country &&
                                                    ` (Company: ${contact.company_country})`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-col sm:flex-row gap-3">
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <Mail size={16} />
                                            <span className="text-sm">{contact.email}</span>
                                        </a>
                                        {contact.phone_number && (
                                            <a
                                                href={`tel:${contact.phone_number}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                                            >
                                                <Phone size={16} />
                                                <span className="text-sm">{contact.phone_number}</span>
                                            </a>
                                        )}
                                    </div>

                                    {(contact.person_linkedin_url || contact.company_linkedin_url) && (
                                        <div className="mt-2 ml-1 space-y-1">
                                            {contact.person_linkedin_url && (
                                                <a
                                                    href={contact.person_linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline block"
                                                >
                                                    Personal LinkedIn Profile
                                                </a>
                                            )}
                                            {contact.company_linkedin_url && (
                                                <a
                                                    href={contact.company_linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline block"
                                                >
                                                    Company LinkedIn Profile
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyListPage;

