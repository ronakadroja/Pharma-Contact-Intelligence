import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Array<'admin' | 'user'>;
}

const ProtectedRoute = ({ children, allowedRoles = ['admin', 'user'] }: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAppContext();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // If user's role is not in the allowed roles, redirect to appropriate dashboard
        const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 