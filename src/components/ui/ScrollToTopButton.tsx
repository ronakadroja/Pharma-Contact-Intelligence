import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToTopButtonProps {
    /** Threshold in pixels to show the button */
    threshold?: number;
    /** Custom className for styling */
    className?: string;
    /** Smooth scroll behavior */
    smooth?: boolean;
    /** Container ref for custom scroll container (if not provided, uses window scroll) */
    containerRef?: React.RefObject<HTMLElement>;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
    threshold = 300,
    className = '',
    smooth = true,
    containerRef
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (containerRef?.current) {
                // Use container scroll
                const scrollTop = containerRef.current.scrollTop;
                setIsVisible(scrollTop > threshold);
            } else {
                // Use window scroll
                setIsVisible(window.pageYOffset > threshold);
            }
        };

        if (containerRef?.current) {
            const container = containerRef.current;
            container.addEventListener('scroll', toggleVisibility);
            return () => {
                container.removeEventListener('scroll', toggleVisibility);
            };
        } else {
            window.addEventListener('scroll', toggleVisibility);
            return () => {
                window.removeEventListener('scroll', toggleVisibility);
            };
        }
    }, [threshold, containerRef]);

    const scrollToTop = () => {
        if (containerRef?.current) {
            // Scroll container to top
            if (smooth) {
                containerRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                containerRef.current.scrollTop = 0;
            }
        } else {
            // Scroll window to top
            if (smooth) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                window.scrollTo(0, 0);
            }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={scrollToTop}
                    className={`
                        fixed bottom-6 right-6 z-50
                        w-12 h-12 
                        bg-blue-600 hover:bg-blue-700 
                        text-white 
                        rounded-full 
                        shadow-lg hover:shadow-xl
                        flex items-center justify-center
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        transform hover:scale-105 active:scale-95
                        ${className}
                    `}
                    aria-label="Scroll to top"
                    title="Scroll to top"
                >
                    <ChevronUp size={20} className="transition-transform group-hover:-translate-y-0.5" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTopButton;
