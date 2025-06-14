import { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
    Users,
    Contact2,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    BarChart2,
    Upload
} from 'lucide-react';
import classNames from 'classnames';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart2 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Contact Database', href: '/admin/contacts', icon: Contact2 },
    { name: 'Credit Management', href: '/admin/credits', icon: CreditCard },
    { name: 'Bulk Upload', href: '/admin/upload', icon: Upload },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            <div className={classNames(
                'fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity duration-300 ease-in-out lg:hidden',
                sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}>
                {/* Mobile sidebar */}
                <div className="fixed inset-0 z-40 flex">
                    <div className={classNames(
                        'relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ease-in-out duration-300',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}>
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <span className="text-2xl font-bold text-blue-600">Admin Panel</span>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={classNames(
                                                isActive
                                                    ? 'bg-gray-100 text-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600',
                                                'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                                    'mr-4 flex-shrink-0 h-6 w-6'
                                                )}
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                    <div className="flex-shrink-0 w-14" aria-hidden="true">
                        {/* Force sidebar to shrink to fit close icon */}
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <span className="text-2xl font-bold text-blue-600">Admin Panel</span>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={classNames(
                                            isActive
                                                ? 'bg-gray-100 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                                'mr-3 flex-shrink-0 h-6 w-6'
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex items-center">
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>
                        <div className="ml-4 flex items-center gap-2 sm:gap-4">
                            <span className="hidden sm:inline text-gray-700">Welcome, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 