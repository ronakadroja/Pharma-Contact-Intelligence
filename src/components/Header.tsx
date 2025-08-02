import { useAppContext } from "../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Loader2 } from "lucide-react";

const Header = () => {
    const { coins, logout, isLoggingOut } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const nav = document.getElementById('mobile-menu');
            if (isMenuOpen && nav && !nav.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const isActiveLink = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-18">
                    {/* Logo and Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group" aria-label="Pharma Contacts Home">
                            <div className="relative p-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                               <span className="text-3xl font-bold text-white">Q</span>

                                </div>
                                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-xl transform group-hover:scale-110 transition-transform duration-300"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 tracking-tight">
                                    Qurodata
                                </span>
                                {/* <span className="text-xs text-gray-500 font-medium tracking-wide">
                                    Intelligence Platform
                                </span> */}
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-2" role="navigation" aria-label="Main navigation">
                        <Link
                            to="/listing"
                            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative group ${isActiveLink('/listing')
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                                }`}
                        >
                            <span className="relative z-10">Home</span>
                            {isActiveLink('/listing') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl opacity-50"></div>
                            )}
                        </Link>
                        <Link
                            to="/my-list"
                            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative group ${isActiveLink('/my-list')
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                                }`}
                        >
                            <span className="relative z-10">My List</span>
                            {isActiveLink('/my-list') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl opacity-50"></div>
                            )}
                        </Link>
                        {/* <Link
                            to="/profile"
                            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative group flex items-center gap-2 ${isActiveLink('/profile')
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                                }`}
                        >
                            <User size={16} className="relative z-10" />
                            <span className="relative z-10">Profile</span>
                            {isActiveLink('/profile') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl opacity-50"></div>
                            )}
                        </Link> */}
                        {/* Right Header Section */}
                        <div className="flex items-center space-x-1 ml-4">
                            {/* User Account Section */}
                            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                                {/* Credits Badge */}
                                <div className="flex items-center space-x-1 mr-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">$</span>
                                    </div>
                                    <span className="text-gray-700 font-semibold text-sm">
                                        {coins.toLocaleString()}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="w-px h-6 bg-gray-300 mx-3"></div>

                                {/* User Avatar */}
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Link to="/profile">
                                        <User size={16} className="text-white" />
                                    </Link>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                title={isLoggingOut ? 'Logging out...' : 'Logout'}
                            >
                                {isLoggingOut ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <LogOut size={20} />
                                )}
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Right Section */}
                    <div className="lg:hidden flex items-center space-x-2">
                        {/* Mobile User Badge */}
                        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 border">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                                <span className="text-white text-xs font-bold">$</span>
                            </div>
                            <span className="text-gray-700 font-medium text-xs">
                                {coins.toLocaleString()}
                            </span>
                        </div>

                        <button
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg
                                className="h-6 w-6 transition-all duration-300 ease-in-out"
                                style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.nav
                        id="mobile-menu"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="lg:hidden bg-white/95 backdrop-blur-md shadow-xl border-t border-blue-200/50"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            <Link
                                to="/listing"
                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${isActiveLink('/listing')
                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-blue-50/70 hover:text-blue-600'
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/my-list"
                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${isActiveLink('/my-list')
                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-blue-50/70 hover:text-blue-600'
                                    }`}
                            >
                                My List
                            </Link>
                            {/* <Link
                                to="/profile"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${isActiveLink('/profile')
                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-blue-50/70 hover:text-blue-600'
                                    }`}
                            >
                                <User size={18} />
                                Profile
                            </Link> */}

                            {/* Mobile Account Section */}
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    {/* Credits */}
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">$</span>
                                        </div>
                                        <span className="text-gray-700 font-semibold">
                                            {coins.toLocaleString()} Credits
                                        </span>
                                    </div>

                                    {/* User Avatar */}
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Link to="/profile">
                                            <User size={16} className="text-white" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Logout Button */}
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-base text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-gray-200"
                            >
                                {isLoggingOut ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <LogOut size={18} />
                                )}
                                <span>
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </span>
                            </button>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;