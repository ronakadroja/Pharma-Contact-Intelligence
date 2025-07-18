import { ArrowRight, Contact2, CreditCard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/design-system';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* User Management Card */}
                <Card
                    variant="elevated"
                    hover={true}
                    className="cursor-pointer group"
                    onClick={() => navigate('/admin/users')}
                >
                    <CardContent>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <Users className="h-6 w-6 text-primary-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-neutral-500 truncate">
                                        User Management
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-neutral-900">
                                            12
                                        </div>
                                        <div className="ml-2 text-sm text-neutral-600">
                                            active users
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                            <div className="text-sm flex items-center justify-between">
                                <span className="font-medium text-primary-600 group-hover:text-primary-700">
                                    Manage Users
                                </span>
                                <ArrowRight className="h-4 w-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Management Card */}
                <Card
                    variant="elevated"
                    hover={true}
                    className="cursor-pointer group"
                    onClick={() => navigate('/admin/contacts')}
                >
                    <CardContent>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center group-hover:bg-success-200 transition-colors">
                                    <Contact2 className="h-6 w-6 text-success-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-neutral-500 truncate">
                                        Contact Database
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-neutral-900">
                                            1,234
                                        </div>
                                        <div className="ml-2 text-sm text-neutral-600">
                                            total contacts
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                            <div className="text-sm flex items-center justify-between">
                                <span className="font-medium text-success-600 group-hover:text-success-700">
                                    Manage Contacts
                                </span>
                                <ArrowRight className="h-4 w-4 text-success-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Credit Management Card */}
                <Card
                    variant="elevated"
                    hover={true}
                    className="cursor-pointer group"
                >
                    <CardContent>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center group-hover:bg-warning-200 transition-colors">
                                    <CreditCard className="h-6 w-6 text-warning-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-neutral-500 truncate">
                                        Credits Allocated
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-neutral-900">
                                            2,500
                                        </div>
                                        <div className="ml-2 text-sm text-neutral-600">
                                            total credits
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                            <div className="text-sm flex items-center justify-between">
                                <span className="font-medium text-warning-600 group-hover:text-warning-700">
                                    View Credits
                                </span>
                                <ArrowRight className="h-4 w-4 text-warning-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;