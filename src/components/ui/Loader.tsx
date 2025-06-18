import React from 'react';
import { useLoading } from '../../context/LoadingContext';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderVariant = 'spinner' | 'pulse' | 'skeleton';

interface LoaderProps {
    size?: LoaderSize;
    variant?: LoaderVariant;
    fullScreen?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
};

const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    variant = 'spinner',
    fullScreen = false,
    className = ''
}) => {
    const renderSpinner = () => (
        <div className={`${sizeClasses[size]} animate-spin ${className}`}>
            <svg className="text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );

    const renderPulse = () => (
        <div className={`animate-pulse ${className}`}>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    );

    const renderSkeleton = () => (
        <div className={`animate-pulse flex flex-col items-center ${className}`}>
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
            <div className="text-gray-500">Loading...</div>
        </div>
    );

    const renderLoader = () => {
        switch (variant) {
            case 'pulse':
                return renderPulse();
            case 'skeleton':
                return renderSkeleton();
            default:
                return renderSpinner();
        }
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                {renderLoader()}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            {renderLoader()}
        </div>
    );
};

export default Loader; 