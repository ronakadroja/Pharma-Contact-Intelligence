import { useEffect, useState } from 'react';
import { getUserProfile, type UserProfile as UserProfileType } from '../api/auth';
import { Card, CardContent, Badge } from '../components/ui/design-system';
import { User, Mail, Phone, Building, CreditCard, Calendar, Shield, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const UserProfile = () => {
    const { coins, logout, isLoggingOut } = useAppContext();
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getUserProfile();
                if (response.success) {
                    setProfile(response.data);
                } else {
                    setError('Failed to load profile data');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const isActive = status.toLowerCase() === 'active';
        return (
            <Badge
                variant={isActive ? 'success' : 'error'}
                size="sm"
                className="flex items-center gap-1"
            >
                <Shield size={12} />
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
                {/* Header */}
                <header className="bg-white shadow-md border-b border-blue-100 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="flex items-center space-x-3 group">
                                    <div className="relative">
                                        <svg className="h-9 w-9 text-blue-600 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M19.5 5.5h-15a2 2 0 00-2 2v9a2 2 0 002 2h15a2 2 0 002-2v-9a2 2 0 00-2-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M12 8.5v7M8.5 12h7" />
                                        </svg>
                                    </div>
                                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 tracking-wide">
                                        Pharma Contacts
                                    </span>
                                </Link>
                            </div>
                            <nav className="flex items-center space-x-8">
                                <Link to="/listing" className="text-gray-600 hover:text-blue-600 transition-all duration-200">Home</Link>
                                <Link to="/my-list" className="text-gray-600 hover:text-blue-600 transition-all duration-200">My List</Link>
                                <Link to="/profile" className="text-blue-600 font-medium flex items-center gap-2">
                                    <User size={16} />
                                    Profile
                                </Link>
                                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 rounded-full shadow-md">
                                    <span className="font-medium text-white">{coins.toLocaleString()} Coins</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Loading Content */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="animate-spin text-primary-600" />
                        <p className="text-neutral-600 font-medium">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
                {/* Header */}
                <header className="bg-white shadow-md border-b border-blue-100 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="flex items-center space-x-3 group">
                                    <div className="relative">
                                        <svg className="h-9 w-9 text-blue-600 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M19.5 5.5h-15a2 2 0 00-2 2v9a2 2 0 002 2h15a2 2 0 002-2v-9a2 2 0 00-2-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M12 8.5v7M8.5 12h7" />
                                        </svg>
                                    </div>
                                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 tracking-wide">
                                        Pharma Contacts
                                    </span>
                                </Link>
                            </div>
                            <nav className="flex items-center space-x-8">
                                <Link to="/listing" className="text-gray-600 hover:text-blue-600 transition-all duration-200">Home</Link>
                                <Link to="/my-list" className="text-gray-600 hover:text-blue-600 transition-all duration-200">My List</Link>
                                <Link to="/profile" className="text-blue-600 font-medium flex items-center gap-2">
                                    <User size={16} />
                                    Profile
                                </Link>
                                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 rounded-full shadow-md">
                                    <span className="font-medium text-white">{coins.toLocaleString()} Coins</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Error Content */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <AlertCircle size={48} className="text-error-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Profile</h3>
                            <p className="text-neutral-600">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
            {/* Header */}
            <Header></Header>

            {/* Main Content - No Scroll */}
            <main className="flex-1 overflow-hidden">
                <div className="max-w-4xl mx-auto h-full px-4 sm:px-6 lg:px-8">
                    <div className="h-full py-4 sm:px-0">
                        {profile && (
                            <div className="h-full flex flex-col">
                                {/* Integrated Header */}
                                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">User Profile</h1>
                                </div>

                                {/* Content Grid - Flexible Height */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
                                    {/* Profile Overview Card */}
                                    <div className="lg:col-span-2 flex flex-col min-h-0">
                                        <Card variant="elevated" className="flex-1">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-6">
                                                    {/* Avatar */}
                                                    <div className="flex-shrink-0">
                                                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <User className="h-10 w-10 text-white" />
                                                        </div>
                                                    </div>

                                                    {/* Basic Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h2 className="text-2xl font-bold text-neutral-900">
                                                                {profile.name}
                                                            </h2>
                                                            {getStatusBadge(profile.status)}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 text-neutral-600">
                                                                <Mail className="h-4 w-4 text-primary-500" />
                                                                <span className="text-sm">{profile.email}</span>
                                                            </div>
                                                            {profile.phone_number && (
                                                                <div className="flex items-center gap-3 text-neutral-600">
                                                                    <Phone className="h-4 w-4 text-success-500" />
                                                                    <span className="text-sm">{profile.phone_number}</span>
                                                                </div>
                                                            )}
                                                            {profile.company && (
                                                                <div className="flex items-center gap-3 text-neutral-600">
                                                                    <Building className="h-4 w-4 text-warning-500" />
                                                                    <span className="text-sm">{profile.company}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Credits Card */}
                                    <div className="flex flex-col min-h-0">
                                        <Card variant="elevated" className="flex-1">
                                            <CardContent className="p-4 text-center flex flex-col justify-center h-full">
                                                <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                    <CreditCard className="h-8 w-8 text-white" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Available Credits</h3>
                                                <div className="text-3xl font-bold text-success-600 mb-2">
                                                    {parseInt(profile.credits).toLocaleString()}
                                                </div>
                                                <p className="text-sm text-neutral-500">Credits remaining</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Subscription Details Card */}
                                    <div className="lg:col-span-3 flex flex-col min-h-0">
                                        <Card variant="elevated" className="flex-1">
                                            <CardContent className="p-4">
                                                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-primary-500" />
                                                    Subscription Details
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                            Start Date
                                                        </label>
                                                        <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                                                            <span className="text-sm text-neutral-900">
                                                                {formatDate(profile.subscription_start_date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                            End Date
                                                        </label>
                                                        <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                                                            <span className="text-sm text-neutral-900">
                                                                {formatDate(profile.subscription_end_date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
