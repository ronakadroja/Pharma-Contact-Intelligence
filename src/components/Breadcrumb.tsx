import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const defaultRouteNames: Record<string, string> = {
    'admin': 'Admin',
    'dashboard': 'Dashboard',
    'users': 'User Management',
    'contacts': 'Contact Database',
    'listing': 'Contact Search',
    'detail': 'Contact Details',
    'my-list': 'My List',
    'settings': 'Settings'
};

const Breadcrumb = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link
                        to="/"
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                </li>
                {pathSegments.map((segment, index) => {
                    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathSegments.length - 1;
                    const name = defaultRouteNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <li key={path} className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            {isLast ? (
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                    {name}
                                </span>
                            ) : (
                                <Link
                                    to={path}
                                    className="ml-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb; 