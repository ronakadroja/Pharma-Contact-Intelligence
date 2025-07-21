import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
    ChevronRight,
    Loader2,
    PanelLeftClose,
    PanelLeftOpen
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
    // Initialize sidebar collapsed state from localStorage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });
    // Add layout mounted state to prevent initial flash
    const [layoutMounted, setLayoutMounted] = useState(false);
    const { user, logout, isLoggingOut } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Set layout as mounted after first render
    useEffect(() => {
        setLayoutMounted(true);
    }, []);

    // Toggle function for sidebar collapse with persistence
    const handleSidebarToggle = useCallback(() => {
        const newCollapsedState = !sidebarCollapsed;
        setSidebarCollapsed(newCollapsedState);
        // Persist the state to localStorage
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newCollapsedState));
    }, [sidebarCollapsed]);

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

    // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                handleSidebarToggle();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSidebarToggle]);

    // Update spring animation when sidebar state changes
    useEffect(() => {
        api.start({ x: sidebarOpen ? 0 : -320 });
    }, [sidebarOpen, api]);

    // Persist sidebar collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/login');
    }, [logout, navigate]);

    // Get current page title and create breadcrumb
    const currentPage = navigation.find(item => item.href === location.pathname);
    const pageTitle = currentPage?.name || 'Dashboard';

    // Memoize the main content area to prevent unnecessary re-renders
    const mainContentClasses = useMemo(() =>
        `flex flex-col flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`,
        [sidebarCollapsed]
    );

    // Memoize main content to prevent unnecessary re-renders
    const mainContent = useMemo(() => (
        <main className="flex-1 transition-opacity duration-150 ease-in-out">
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </div>
        </main>
    ), []);
    // Memoize header content to prevent unnecessary re-renders
    const headerContent = useMemo(() => (
        <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
                <div className="flex items-center text-neutral-600">
                    <Badge variant="outline" size="sm">Admin</Badge>
                    <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />

                    {/* Sidebar State Indicator */}
                    <div className="hidden lg:flex items-center mr-3">
                        <div className={`
                            w-2 h-2 rounded-full transition-all duration-300
                            ${sidebarCollapsed
                                ? 'bg-amber-400 shadow-amber-400/50'
                                : 'bg-emerald-400 shadow-emerald-400/50'
                            } shadow-lg
                        `} />
                        <span className="ml-2 text-xs text-neutral-500 font-medium">
                            {sidebarCollapsed ? 'Compact' : 'Expanded'}
                        </span>
                    </div>

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
                    disabled={isLoggingOut}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-error-600 hover:text-error-800 hover:bg-error-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <LogOut size={18} />
                    )}
                    <span className="hidden sm:inline">
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                </button>
            </div>
        </div>
    ), [pageTitle, sidebarCollapsed, user?.name, isLoggingOut, handleLogout]);

    // Memoize navigation items to prevent re-renders
    const navigationItems = useMemo(() =>
        navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
                <div key={item.name} className="relative group">
                    <Link
                        to={item.href}
                        className={classNames(
                            isActive
                                ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600',
                            'group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                            sidebarCollapsed ? 'justify-center' : ''
                        )}
                        title={sidebarCollapsed ? item.name : ''}
                    >
                        <item.icon
                            className={classNames(
                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                'flex-shrink-0 h-6 w-6 transition-colors duration-200',
                                sidebarCollapsed ? '' : 'mr-3'
                            )}
                        />
                        {!sidebarCollapsed && item.name}
                    </Link>

                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.name}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45"></div>
                        </div>
                    )}
                </div>
            );
        }), [location.pathname, sidebarCollapsed]
    );

    // Show minimal loader until layout is mounted to prevent flash
    if (!layoutMounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

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
            <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
                }`}>
                <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-neutral-200 shadow-soft">
                    <div className="flex-1 flex flex-col pt-5 pb-4 ">
                        <div className={`flex items-center flex-shrink-0 ${sidebarCollapsed ? 'px-2 justify-center' : 'px-4'}`}>
                            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
                                    <span className="text-lg font-bold text-white">A</span>
                                </div>
                                {!sidebarCollapsed && (
                                    <span className="text-xl font-bold text-neutral-900">Admin Panel</span>
                                )}
                            </div>
                        </div>

                        {/* Fancy Toggle Button */}
                        <div className="relative mt-6 mb-4">
                            <div className={`${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
                                <button
                                    onClick={handleSidebarToggle}
                                    className={`
                                        relative w-full group overflow-hidden
                                        ${sidebarCollapsed
                                            ? 'h-10 w-10 mx-auto rounded-full'
                                            : 'h-10 rounded-xl px-3'
                                        }
                                        bg-gradient-to-r from-primary-50 to-primary-100
                                        hover:from-primary-100 hover:to-primary-200
                                        border border-primary-200 hover:border-primary-300
                                        shadow-sm hover:shadow-md
                                        transition-all duration-300 ease-in-out
                                        transform hover:scale-105 active:scale-95
                                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                                    `}
                                    title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar (Ctrl+B)`}
                                >
                                    {/* Background animation */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/0 via-primary-600/5 to-primary-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                                    {/* Content */}
                                    <div className="relative flex items-center justify-center text-primary-700 group-hover:text-primary-800">
                                        {sidebarCollapsed ? (
                                            <PanelLeftOpen className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                                        ) : (
                                            <>
                                                <PanelLeftClose className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                                                <span className="text-sm font-semibold tracking-wide">Collapse</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Subtle glow effect */}
                                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-primary-400/20 blur-xl transition-opacity duration-300" />
                                </button>
                            </div>

                            {/* Decorative line */}
                            {!sidebarCollapsed && (
                                <div className="mt-4 mx-4 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                            )}
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigationItems}
                        </nav>
                    </div>
                </div>

            </div>

            {/* Main content */}
            <div className={mainContentClasses}>
                {/* Static Header - will not re-render during navigation */}
                <header className="sticky top-0 z-2 flex-shrink-0 flex h-16 bg-white shadow-soft border-b border-neutral-200">
                    <button
                        type="button"
                        className="px-4 border-r border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {headerContent}
                </header>

                {/* Main content area - only this section will change during navigation */}
                {mainContent}
            </div>
        </div>
    );
};

export default AdminLayout; 