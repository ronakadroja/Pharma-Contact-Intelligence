import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Here you could add error logging service integration
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            if (fallback) {
                return fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Something went wrong
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                An error occurred while rendering this component
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && error && (
                            <div className="mt-4">
                                <div className="bg-red-50 p-4 rounded-md">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error Details
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error.toString()}</p>
                                        {errorInfo && (
                                            <pre className="mt-2 whitespace-pre-wrap">
                                                {errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary; 