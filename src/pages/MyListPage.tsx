import Header from "../components/Header";
import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2, Search, Mail, Phone } from "lucide-react";
import type { Contact } from "../types";

const MyListPage = () => {
    const { myList, setMyList } = useAppContext();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [filteredList, setFilteredList] = useState<Contact[]>(myList);

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const filtered = myList.filter(
            contact =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredList(filtered);
    }, [searchTerm, myList]);

    const handleRemove = (contact: Contact) => {
        setMyList(prev => prev.filter(c => c.id !== contact.id));
        showToast(`Removed ${contact.name} from your list`, 'info');
    };

    if (isLoading) {
        return (
            <div>
                <Header />
                <div className="max-w-7xl mx-auto p-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">My Contact List</h1>
                        <div className="relative w-72">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="Search contacts..."
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    {filteredList.length === 0 ? (
                        <div className="text-center py-12">
                            <Search size={48} className="mx-auto text-gray-400 mb-4" />
                            {searchTerm ? (
                                <>
                                    <p className="text-lg font-medium text-gray-900 mb-2">No matching contacts found</p>
                                    <p className="text-gray-500">Try adjusting your search terms</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-medium text-gray-900 mb-2">Your contact list is empty</p>
                                    <p className="text-gray-500">Add contacts from the main listing page</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredList.map(contact => (
                                <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center mb-1">
                                            <h3 className="text-lg font-medium text-gray-900 truncate mr-2">
                                                {contact.name}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs rounded-full ${contact.status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {contact.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{contact.company}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                            >
                                                <Mail size={16} />
                                                {contact.email}
                                            </a>
                                            {contact.phone && (
                                                <a
                                                    href={`tel:${contact.phone}`}
                                                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                                >
                                                    <Phone size={16} />
                                                    {contact.phone}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="text-sm text-gray-500">
                                            Last contact: {format(new Date(contact.lastContact), "MMM d, yyyy")}
                                        </div>
                                        <button
                                            onClick={() => handleRemove(contact)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                            title="Remove contact"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
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

