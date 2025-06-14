import type { Contact } from "../types";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { Plus, ExternalLink, Search } from "lucide-react";
import { format } from "date-fns";

interface TableProps {
    data: Contact[];
    isLoading?: boolean;
}

const Table = ({ data, isLoading = false }: TableProps) => {
    const { coins, setCoins, addToMyList } = useAppContext();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleAdd = (contact: Contact) => {
        if (coins >= 10) {
            setCoins(coins - 10);
            addToMyList(contact);
            showToast(`Added ${contact.name} to your list`, 'success');
        } else {
            showToast('Not enough coins to add this contact', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        return status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                    <div className="text-gray-500">Loading contacts...</div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Search size={48} className="mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No contacts found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">#</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                                <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                                <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((contact, index) => (
                                <tr key={contact.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 whitespace-nowrap">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 group"
                                                    onClick={() => navigate(`/detail/${contact.id}`)}>
                                                    {contact.company}
                                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="text-xs text-gray-500">{contact.companySize} employees</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                            <div className="text-xs text-gray-500">{contact.designation}</div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contact.industry}
                                    </td>
                                    <td className="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-gray-900">{contact.city}</div>
                                            <div className="text-xs text-gray-500">{contact.country}</div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="hidden lg:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(contact.lastContact), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleAdd(contact)}
                                            className={`text-green-600 hover:text-green-800 flex items-center gap-1 hover:underline transition-colors ${coins < 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={coins < 10}
                                            title={coins < 10 ? "Not enough coins" : "Add to your list"}
                                        >
                                            <Plus size={14} />
                                            <span className="hidden sm:inline">Add (10 coins)</span>
                                            <span className="sm:hidden">Add</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Table;
