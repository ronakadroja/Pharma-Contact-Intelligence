import type { Contact } from "../api/contacts";
import { Pencil } from "lucide-react";

interface ContactTableProps {
    data: Contact[];
    isLoading?: boolean;
    onEdit: (contact: Contact) => void;
}

const ContactTable = ({ data, isLoading = false, onEdit }: ContactTableProps) => {
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
                <p className="text-lg font-medium mb-2">No contacts found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
        );
    }

    return (
        <div className="overflow-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">#</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                                <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                                                <div className="text-sm font-medium text-gray-900">
                                                    {contact.company_name}
                                                </div>
                                                <div className="text-xs text-gray-500">{contact.company_type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{contact.person_name}</div>
                                            <div className="text-xs text-gray-500">{contact.designation}</div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contact.department}
                                    </td>
                                    <td className="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-gray-900">{contact.city}</div>
                                            <div className="text-xs text-gray-500">{contact.person_country}</div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => onEdit(contact)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline transition-colors"
                                            title="Edit contact"
                                        >
                                            <Pencil size={14} />
                                            <span className="hidden sm:inline">Edit</span>
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

export default ContactTable; 