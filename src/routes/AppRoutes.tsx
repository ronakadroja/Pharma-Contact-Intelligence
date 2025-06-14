import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ListingPage from "../components/ListingPage";
import DetailPage from "../pages/DetailPage";
import MyListPage from "../pages/MyListPage";
import AdminDashboard from "../pages/AdminDashboard";
import UserDashboard from "../pages/UserDashboard";
import UserManagement from "../pages/admin/UserManagement";
import ContactManagement from "../pages/admin/ContactManagement";
import AdminLayout from "../components/layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAppContext } from "../context/AppContext";

const AppRoutes = () => {
    const { user } = useAppContext();

    return (
        <Routes>
            <Route path="/" element={
                user ?
                    <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/listing'} />
                    : <Navigate to="/login" />
            } />

            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="contacts" element={<ContactManagement />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Route>

            {/* User Routes */}
            <Route path="/*" element={
                <ProtectedRoute allowedRoles={['user']}>
                    <Routes>
                        <Route path="dashboard" element={<ListingPage />} />
                        <Route path="listing" element={<ListingPage />} />
                        <Route path="detail/:id" element={<DetailPage />} />
                        <Route path="my-list" element={<MyListPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRoutes;
