import { useAppContext } from '../context/AppContext';
import { Search, List, CreditCard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, coins, logout } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Dashboard</h1>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <CreditCard size={18} />
                                <span>{coins} credits remaining</span>
                            </div>
                            <span className="text-gray-700">Welcome, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                        {/* Mobile Menu Button */}
                        <div className="sm:hidden flex items-center gap-2">
                            <div className="flex items-center gap-1 text-gray-700">
                                <CreditCard size={18} />
                                <span className="text-sm">{coins}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 px-2 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Search Contacts Card */}
                        <div
                            onClick={() => navigate('/listing')}
                            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Search className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Search Contacts
                                            </dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-lg text-gray-900">
                                                    Browse and filter the contact database
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm">
                                    <a className="font-medium text-blue-600 hover:text-blue-900">
                                        Search now <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* My List Card */}
                        <div
                            onClick={() => navigate('/my-list')}
                            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <List className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                My Contact List
                                            </dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-lg text-gray-900">
                                                    View and manage your saved contacts
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm">
                                    <a className="font-medium text-blue-600 hover:text-blue-900">
                                        View list <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard; 