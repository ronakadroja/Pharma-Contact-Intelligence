import { useAppContext } from '../context/AppContext';
import { Search, List, CreditCard, LogOut, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge } from '../components/ui/design-system';

const UserDashboard = () => {
    const { user, coins, logout, isLoggingOut } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 bg-white shadow-soft border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">User Dashboard</h1>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <Badge variant="primary" size="md" className="flex items-center gap-2">
                                <CreditCard size={16} />
                                <span>{coins} credits remaining</span>
                            </Badge>
                            <span className="text-neutral-700">Welcome, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:text-error-800 hover:bg-error-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingOut ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <LogOut size={18} />
                                )}
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                        {/* Mobile Menu Button */}
                        <div className="sm:hidden flex items-center gap-2">
                            <Badge variant="primary" size="sm" className="flex items-center gap-1">
                                <CreditCard size={14} />
                                <span className="text-xs">{coins}</span>
                            </Badge>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center gap-1 px-2 py-1.5 text-sm text-error-600 hover:text-error-800 hover:bg-error-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingOut ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <LogOut size={16} />
                                )}
                                <span className="hidden">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Search Contacts Card */}
                            <Card
                                variant="elevated"
                                hover={true}
                                className="cursor-pointer group"
                                onClick={() => navigate('/listing')}
                            >
                                <CardContent>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                                <Search className="h-6 w-6 text-primary-600" />
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-neutral-500 truncate">
                                                    Search Contacts
                                                </dt>
                                                <dd className="flex items-baseline">
                                                    <div className="text-lg text-neutral-900 font-medium">
                                                        Browse and filter the contact database
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-neutral-100">
                                        <div className="text-sm flex items-center justify-between">
                                            <span className="font-medium text-primary-600 group-hover:text-primary-700">
                                                Search now
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* My List Card */}
                            <Card
                                variant="elevated"
                                hover={true}
                                className="cursor-pointer group"
                                onClick={() => navigate('/my-list')}
                            >
                                <CardContent>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center group-hover:bg-success-200 transition-colors">
                                                <List className="h-6 w-6 text-success-600" />
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-neutral-500 truncate">
                                                    My Contact List
                                                </dt>
                                                <dd className="flex items-baseline">
                                                    <div className="text-lg text-neutral-900 font-medium">
                                                        View and manage your saved contacts
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-neutral-100">
                                        <div className="text-sm flex items-center justify-between">
                                            <span className="font-medium text-success-600 group-hover:text-success-700">
                                                View list
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-success-600 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard; 