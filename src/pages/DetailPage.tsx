import { useParams, useNavigate } from "react-router-dom";
import { MOCK_CONTACTS } from "../utils/mockData";
import Header from "../components/Header";
import { useAppContext } from "../context/AppContext";
import { ArrowLeft, Plus, Building2, Mail, Phone, MapPin, Users, Briefcase, Calendar, Activity, Eye, EyeOff } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { format } from "date-fns";
import { useState } from "react";

const DetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToMyList, coins, setCoins } = useAppContext();
    const { showToast } = useToast();
    const [showEmail, setShowEmail] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    const contact = MOCK_CONTACTS.find((c) => c.id === id);

    if (!contact) {
        return (
            <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
                <Header />
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-4">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contact not found</h2>
                            <p className="text-gray-600 mb-4">The contact you're looking for doesn't exist or has been removed.</p>
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleAdd = () => {
        if (coins >= 10) {
            addToMyList(contact);
            showToast(`Added ${contact.name} to your list`, 'success');
            navigate(-1);
        } else {
            showToast('Not enough coins to add this contact', 'error');
        }
    };

    const maskEmail = (email: string) => {
        const [username, domain] = email.split('@');
        return `${username[0]}${'*'.repeat(username.length - 1)}@${domain}`;
    };

    const maskPhone = (phone: string) => {
        return `${phone.slice(0, 2)}${'*'.repeat(phone.length - 4)}${phone.slice(-2)}`;
    };

    const handleRevealEmail = () => {
        if (coins >= 5) {
            setCoins(coins - 5);
            setShowEmail(true);
            showToast('Email revealed successfully', 'success');
        } else {
            showToast('Not enough coins to reveal email', 'error');
        }
    };

    const handleRevealPhone = () => {
        if (coins >= 5) {
            setCoins(coins - 5);
            setShowPhone(true);
            showToast('Phone number revealed successfully', 'success');
        } else {
            showToast('Not enough coins to reveal phone number', 'error');
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4">
                    {/* Navigation and Actions */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            <ArrowLeft size={20} />
                            Back to Listing
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={coins < 10}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                            ${coins >= 10
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Plus size={20} />
                            Add to My List (10 coins)
                        </button>
                    </div>

                    {/* Contact Details Card */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header Section */}
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">{contact.company}</h1>
                                    <p className="text-gray-500 flex items-center gap-2">
                                        <Users size={16} />
                                        {contact.companySize} employees
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                    ${contact.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'}`}>
                                        <Activity size={14} className="mr-1" />
                                        {contact.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Primary Contact */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Primary Contact</h2>
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-2 text-gray-600">
                                            <Building2 size={16} className="text-gray-400" />
                                            <span className="font-medium">{contact.name}</span>
                                            <span className="text-gray-400">•</span>
                                            <span>{contact.designation}</span>
                                        </p>
                                        <div className="flex items-center gap-2 text-gray-600 group">
                                            <Mail size={16} className="text-gray-400" />
                                            {showEmail ? (
                                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                                    {contact.email}
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="font-mono">{maskEmail(contact.email)}</span>
                                                    <button
                                                        onClick={handleRevealEmail}
                                                        className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                                        title={coins >= 5 ? "Reveal email" : "Not enough coins"}
                                                    >
                                                        <Eye size={12} />
                                                        Reveal (5 coins)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {contact.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone size={16} className="text-gray-400" />
                                                {showPhone ? (
                                                    <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                                                        {contact.phone}
                                                    </a>
                                                ) : (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="font-mono">{maskPhone(contact.phone)}</span>
                                                        <button
                                                            onClick={handleRevealPhone}
                                                            className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                                            title={coins >= 5 ? "Reveal phone number" : "Not enough coins"}
                                                        >
                                                            <Eye size={12} />
                                                            Reveal (5 coins)
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Company Information */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-2 text-gray-600">
                                            <MapPin size={16} className="text-gray-400" />
                                            {contact.city}, {contact.country}
                                        </p>
                                        <p className="flex items-center gap-2 text-gray-600">
                                            <Briefcase size={16} className="text-gray-400" />
                                            {contact.industry}
                                        </p>
                                        <p className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={16} className="text-gray-400" />
                                            Last Contact: {format(new Date(contact.lastContact), "MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;
