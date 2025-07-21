import type { Contact } from "../api/contacts";
import { Linkedin, Pencil } from "lucide-react";
import { Badge } from "./ui/design-system";

interface ContactTableProps {
    data: Contact[];
    isLoading?: boolean;
    onEdit: (contact: Contact) => void;
}

const ContactTable = ({ data, isLoading = false, onEdit }: ContactTableProps) => {
    const getStatusVariant = (status: string) => {
        return status === "Active" ? "success" : "error";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-neutral-200 rounded-full mb-4"></div>
                    <div className="text-neutral-500">Loading contacts...</div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <p className="text-lg font-medium mb-2">No contacts found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
        );
    }

    return (
        <div className="overflow-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-soft ring-1 ring-neutral-200 rounded-2xl">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider sm:pl-6">#</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Contact Person</th>
                                <th scope="col" className="hidden sm:table-cell px-3 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Department</th>
                                <th scope="col" className="hidden md:table-cell px-3 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Location</th>
                                <th scope="col" className="hidden sm:table-cell px-3 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-100">
                            {data.map((contact, index) => (
                                <tr key={contact.id} className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-4 pl-4 pr-3 text-sm text-neutral-500 sm:pl-6 whitespace-nowrap font-medium">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-neutral-900">
                                                        {contact.company_name}
                                                    </span>
                                                    {contact.company_linkedin_url && (
                                                        <a
                                                            href={contact.company_linkedin_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="View Company LinkedIn"
                                                        >
                                                            <Linkedin size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="text-xs text-neutral-500">{contact.product_type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-neutral-900">{contact.person_name}</span>
                                                {contact.person_linkedin_url && (
                                                    <a
                                                        href={contact.person_linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="View LinkedIn Profile"
                                                    >
                                                        <Linkedin size={14} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-500">{contact.designation}</div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {contact.department}
                                    </td>
                                    <td className="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-neutral-900 font-medium">{contact.city}</div>
                                            <div className="text-xs text-neutral-500">{contact.person_country}</div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                                        <Badge variant={getStatusVariant(contact.status)} size="sm">
                                            {contact.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => onEdit(contact)}
                                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1 hover:bg-primary-50 px-2 py-1 rounded-lg transition-colors"
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