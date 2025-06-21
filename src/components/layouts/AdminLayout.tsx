import { useState, useRef, useEffect } from 'react';
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
    Upload,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import classNames from 'classnames';
import { Badge } from '../ui/design-system';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart2 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Contact Database', href: '/admin/contacts', icon: Contact2 },
    { name: 'Credit Management', href: '/admin/credits', icon: CreditCard },
    { name: 'Bulk Upload', href: '/admin/upload', icon: Upload },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

// Animation variants for menu items
const menuItemVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.2 }
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: easeInOut
        }
    }
};

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Spring animation for the sidebar
    const [{ x }, api] = useSpring(() => ({ x: -320 }));

    // Gesture binding for swipe
    const bind = useDrag(
        ({ down, movement: [mx], direction: [dx], cancel }) => {
            // If sidebar is closed and swiping right, or sidebar is open and swiping left
            if ((!sidebarOpen && mx > 50 && dx > 0) || (sidebarOpen && mx < -50 && dx < 0)) {
                cancel();
                setSidebarOpen(!sidebarOpen);
            } else {
                // Update spring animation
                api.start({
                    x: sidebarOpen ? Math.max(-320, mx) : Math.min(0, -320 + mx),
                    immediate: down
                });
            }
        },
        {
            axis: 'x',
            bounds: { left: -320, right: 0 },
            rubberband: true,
            from: () => [x.get(), 0],
            filterTaps: true,
            preventScroll: true
        }
    );

    // Handle click outside to close sidebar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setSidebarOpen(false);
            }
        };

        if (sidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarOpen]);

    // Update spring animation when sidebar state changes
    useEffect(() => {
        api.start({ x: sidebarOpen ? 0 : -320 });
    }, [sidebarOpen, api]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get current page title and create breadcrumb
    const currentPage = navigation.find(item => item.href === location.pathname);
    const pageTitle = currentPage?.name || 'Dashboard';

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-neutral-600 bg-opacity-75 backdrop-blur-sm z-40 lg:hidden"
                    >
                        <animated.div
                            ref={sidebarRef}
                            {...bind()}
                            style={{
                                transform: x.to(x => `translateX(${x}px)`),
                                touchAction: 'none'
                            }}
                            className="fixed inset-0 z-40 flex"
                        >
                            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                                <div className="absolute top-0 right-0 -mr-12 pt-2">
                                    <button
                                        type="button"
                                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <X className="h-6 w-6 text-white" />
                                    </button>
                                </div>

                                <div className="flex-shrink-0 flex items-center px-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
                                            <span className="text-lg font-bold text-white">A</span>
                                        </div>
                                        <span className="text-xl font-bold text-neutral-900">Admin Panel</span>
                                    </div>
                                </div>

                                <nav className="mt-5 flex-1 px-2 space-y-1">
                                    {navigation.map((item, index) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <motion.div
                                                key={item.name}
                                                custom={index}
                                                initial="hidden"
                                                animate="visible"
                                                variants={menuItemVariants}
                                            >
                                                <Link
                                                    to={item.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={classNames(
                                                        isActive
                                                            ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                                                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600',
                                                        'group flex items-center px-2 py-2 text-base font-medium rounded-xl transition-all duration-200'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={classNames(
                                                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                                            'mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200'
                                                        )}
                                                    />
                                                    {item.name}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </nav>
                            </div>
                        </animated.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-neutral-200 shadow-soft">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
                                    <span className="text-lg font-bold text-white">A</span>
                                </div>
                                <span className="text-xl font-bold text-neutral-900">Admin Panel</span>
                            </div>
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
                                                ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-all duration-200'
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                                'mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200'
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
                <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-soft border-b border-neutral-200">
                    <button
                        type="button"
                        className="px-4 border-r border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex items-center">
                            <div className="flex items-center text-neutral-600">
                                <Badge variant="outline" size="sm">Admin</Badge>
                                <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />
                                <div className="group relative">
                                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 truncate max-w-[200px] sm:max-w-md">
                                        {pageTitle}
                                    </h1>
                                    {/* Tooltip for truncated text */}
                                    <div className="absolute left-0 -bottom-8 hidden group-hover:block bg-neutral-800 text-white text-sm px-2 py-1 rounded-lg shadow-medium">
                                        {pageTitle}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ml-4 flex items-center gap-2 sm:gap-4">
                            <span className="hidden sm:inline text-neutral-700 font-medium">Welcome, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-error-600 hover:text-error-800 hover:bg-error-50 rounded-xl transition-all duration-200"
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