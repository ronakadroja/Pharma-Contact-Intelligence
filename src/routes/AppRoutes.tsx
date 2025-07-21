import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
// Import AdminLayout directly (not lazy) to prevent full screen refresh
import AdminLayout from "../components/layouts/AdminLayout";
import { motion } from 'framer-motion';

// Lazy load components
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ListingPage = lazy(() => import("../pages/user/ListingPage"));
const DetailPage = lazy(() => import("../pages/DetailPage"));
const MyListPage = lazy(() => import("../pages/MyListPage"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"));
const ContactManagement = lazy(() => import("../pages/admin/ContactManagement"));

// Loading fallback for full screen
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Loading fallback for admin content area only
const AdminContentLoader = () => (
    <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

// 404 Page
const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-blue-600">404</h1>
            <p className="mt-4 text-xl text-gray-600">Page not found</p>
            <button
                onClick={() => window.history.back()}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Go Back
            </button>
        </div>
    </div>
);

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
    >
        {children}
    </motion.div>
);

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
    const { user } = useAppContext();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

const AppRoutes = () => {
    const { user } = useAppContext();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/" element={
                    user ?
                        <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />
                        : <Navigate to="/login" />
                } />

                <Route path="/login" element={
                    user ? <Navigate to="/" /> : (
                        <PageTransition>
                            <LoginPage />
                        </PageTransition>
                    )
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={
                        <Suspense fallback={<AdminContentLoader />}>
                            <PageTransition>
                                <AdminDashboard />
                            </PageTransition>
                        </Suspense>
                    } />
                    <Route path="users" element={
                        <Suspense fallback={<AdminContentLoader />}>
                            <PageTransition>
                                <UserManagement />
                            </PageTransition>
                        </Suspense>
                    } />
                    <Route path="contacts" element={
                        <Suspense fallback={<AdminContentLoader />}>
                            <PageTransition>
                                <ContactManagement />
                            </PageTransition>
                        </Suspense>
                    } />
                    <Route path="credits" element={
                        <Suspense fallback={<AdminContentLoader />}>
                            <PageTransition>
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Credit Management</h1>
                                    <p className="text-gray-600">Credit management functionality coming soon...</p>
                                </div>
                            </PageTransition>
                        </Suspense>
                    } />
                    <Route path="upload" element={
                        <Suspense fallback={<AdminContentLoader />}>
                            <PageTransition>
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Bulk Upload</h1>
                                    <p className="text-gray-600">Bulk upload functionality coming soon...</p>
                                </div>
                            </PageTransition>
                        </Suspense>
                    } />
                    <Route path="settings" element={
                        <Suspense fallback={<AdminContentLoader />}>
                            <PageTransition>
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                                    <p className="text-gray-600">Settings functionality coming soon...</p>
                                </div>
                            </PageTransition>
                        </Suspense>
                    } />
                </Route>

                {/* User Routes */}
                <Route path="/*" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <Routes>
                            <Route path="dashboard" element={
                                <PageTransition>
                                    <UserDashboard />
                                </PageTransition>
                            } />
                            <Route path="listing" element={
                                <PageTransition>
                                    <ListingPage />
                                </PageTransition>
                            } />
                            <Route path="detail/:id" element={
                                <PageTransition>
                                    <DetailPage />
                                </PageTransition>
                            } />
                            <Route path="my-list" element={
                                <PageTransition>
                                    <MyListPage />
                                </PageTransition>
                            } />
                            <Route path="profile" element={
                                <PageTransition>
                                    <UserProfile />
                                </PageTransition>
                            } />
                        </Routes>
                    </ProtectedRoute>
                } />

                {/* 404 Route */}
                <Route path="*" element={
                    <PageTransition>
                        <NotFoundPage />
                    </PageTransition>
                } />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
