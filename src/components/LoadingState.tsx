import React from 'react';

interface LoadingStateProps {
    fullScreen?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const LoadingState: React.FC<LoadingStateProps> = ({
    fullScreen = false,
    size = 'medium'
}) => {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    const containerClasses = fullScreen
        ? 'min-h-[calc(100vh-4rem)] flex items-center justify-center'
        : 'flex items-center justify-center p-8';

    return (
        <div className={containerClasses}>
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
        </div>
    );
};

export default LoadingState; 