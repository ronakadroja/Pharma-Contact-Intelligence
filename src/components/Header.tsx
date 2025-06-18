import { useAppContext } from "../context/AppContext";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
    const { coins } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

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
        <header className="sticky top-0 z-50 bg-white shadow-md border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <svg className="h-9 w-9 text-blue-600 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M19.5 5.5h-15a2 2 0 00-2 2v9a2 2 0 002 2h15a2 2 0 002-2v-9a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M12 8.5v7M8.5 12h7" />
                                </svg>
                                <div className="absolute inset-0 bg-blue-200/30 blur-xl rounded-full transform group-hover:scale-110 transition-transform"></div>
                            </div>
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 tracking-wide">
                                Pharma Contacts
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/listing"
                            className={`transition-all duration-200 hover:text-blue-600 relative group ${isActiveLink('/listing') ? 'text-blue-600 font-medium' : 'text-gray-600'
                                }`}
                        >
                            Home
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full ${isActiveLink('/listing') ? 'w-full' : ''
                                }`}></span>
                        </Link>
                        <Link
                            to="/my-list"
                            className={`transition-all duration-200 hover:text-blue-600 relative group ${isActiveLink('/my-list') ? 'text-blue-600 font-medium' : 'text-gray-600'
                                }`}
                        >
                            My List
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full ${isActiveLink('/my-list') ? 'w-full' : ''
                                }`}></span>
                        </Link>
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 rounded-full shadow-md">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1.002-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.548.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979a1 1 0 00-1.715 1.029C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95c.285-.475.507-1.002.67-1.55H14a1 1 0 100-2h-.013a9.358 9.358 0 000-1H14a1 1 0 000-2h-.351c-.163-.548-.385-1.075-.67-1.55C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-white">
                                {coins.toLocaleString()} Coins
                            </span>
                        </div>
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg
                            className="h-6 w-6 transition-transform duration-200 ease-in-out"
                            style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.nav
                        id="mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white shadow-lg border-t border-blue-100"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                to="/listing"
                                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActiveLink('/listing')
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/my-list"
                                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActiveLink('/my-list')
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                My List
                            </Link>
                            <div className="px-3 py-2">
                                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 rounded-full shadow-md">
                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1.002-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.548.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979a1 1 0 00-1.715 1.029C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95c.285-.475.507-1.002.67-1.55H14a1 1 0 100-2h-.013a9.358 9.358 0 000-1H14a1 1 0 000-2h-.351c-.163-.548-.385-1.075-.67-1.55C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-white">
                                        {coins.toLocaleString()} Coins
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;