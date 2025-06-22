import { useState, useEffect, useMemo } from 'react';
import { getUsers, deleteUser, updateUserStatus, updateUserRole } from '../../api/auth';
import UserCreationForm from '../../components/UserCreationForm';
import { useToast } from '../../context/ToastContext';
import type { User } from '../../types/auth';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import LoadingState from '../../components/LoadingState';
import {
    Trash2,
    PencilIcon,
    X,
    Search,
    Download,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    Clock,
    Filter,
    Plus
} from 'lucide-react';
import {
    createColumnHelper,
    type SortingState,
    type ColumnDef,
    type RowSelectionState
} from '@tanstack/react-table';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import classNames from 'classnames';
import { Button, Card, Input, Badge } from '../../components/ui/design-system';



const columnHelper = createColumnHelper<User>();

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
    const [showFilters, setShowFilters] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { success, error: showError } = useToast();

    const columns = useMemo<ColumnDef<User, any>[]>(
        () => [
            // columnHelper.display({
            //     id: 'select',
            //     header: ({ table }) => (
            //         <input
            //             type="checkbox"
            //             checked={table.getIsAllRowsSelected()}
            //             onChange={table.getToggleAllRowsSelectedHandler()}
            //             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            //         />
            //     ),
            //     cell: ({ row }) => (
            //         <input
            //             type="checkbox"
            //             checked={row.getIsSelected()}
            //             onChange={row.getToggleSelectedHandler()}
            //             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            //         />
            //     ),
            // }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('company', {
                header: 'Company',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('role', {
                header: 'Role',
                cell: (info) => (
                    <span className="capitalize">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor('credits', {
                header: 'Credits',
                cell: (info) => info.getValue(),
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => (
                    <Badge variant={info.getValue() === 'Active' ? 'success' : 'error'} size="sm">
                        {info.getValue()}
                    </Badge>
                ),
            }),
            // columnHelper.accessor('lastActive', {
            //     header: 'Last Active',
            //     cell: (info) => info.getValue() ? format(new Date(info.getValue()!), 'MMM dd, yyyy HH:mm') : 'Never',
            // }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="  space-x-2 text-center">
                        <button
                            onClick={() => handleEditUser(row.original)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        {/* <button
                            onClick={() => handleDeleteUser(row.original.id)}
                            className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button> */}
                    </div>
                ),
            }),
        ],
        []
    );

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getUsers();
            const usersWithStatus: User[] = response.map(user => ({
                ...user,
            }));
            setUsers(usersWithStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUser(id);
            success('User deleted successfully!', {
                title: 'Deleted'
            });
            fetchUsers();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to delete user', {
                title: 'Delete Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
        }
    };

    const handleBulkDelete = async () => {
        const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) return;

        try {
            await Promise.all(selectedIds.map(id => deleteUser(id)));
            success(`Successfully deleted ${selectedIds.length} users!`, {
                title: 'Bulk Delete Complete'
            });
            setSelectedRows({});
            fetchUsers();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to delete users', {
                title: 'Bulk Delete Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
        }
    };

    const handleBulkStatusChange = async (status: 'Active' | 'Deactive') => {
        const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
        try {
            await Promise.all(selectedIds.map(id => updateUserStatus(id, status === 'Active' ? 'active' : 'inactive')));
            success(`Successfully updated status for ${selectedIds.length} users!`, {
                title: 'Status Updated'
            });
            setSelectedRows({});
            fetchUsers();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to update user status', {
                title: 'Status Update Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
        }
    };

    const handleBulkRoleChange = async (role: string) => {
        const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
        try {
            await Promise.all(selectedIds.map(id => updateUserRole(id, role)));
            success(`Successfully updated role for ${selectedIds.length} users!`, {
                title: 'Role Updated'
            });
            setSelectedRows({});
            fetchUsers();
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to update user role', {
                title: 'Role Update Failed',
                duration: 6000 // Auto-close after 6 seconds
            });
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchUsers();
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <Card variant="elevated" padding="lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Manage Users</h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Add, edit, or remove user accounts and manage their permissions.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => {
                                setSelectedUser(null);
                                setShowModal(true);
                            }}
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Add User
                        </Button>
                        <CSVLink
                            data={users}
                            filename={`users-${format(new Date(), 'yyyy-MM-dd')}.csv`}
                            className="inline-flex items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-xl text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </CSVLink>
                    </div>
                </div>
            </Card>

            {/* Search and Filter Section */}
            <Card variant="elevated" padding="none">
                <div className="p-6 border-b border-neutral-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={globalFilter || ''}
                                onChange={e => setGlobalFilter(e.target.value)}
                                placeholder="Search users..."
                                leftIcon={<Search className="h-5 w-5" />}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                icon={<Filter className="h-4 w-4" />}
                            >
                                Filters
                                {(roleFilter !== 'all' || statusFilter !== 'all') && (
                                    <Badge variant="primary" size="sm" className="ml-2">
                                        {[
                                            roleFilter !== 'all' && 'Role',
                                            statusFilter !== 'all' && 'Status'
                                        ].filter(Boolean).length}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Role</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full text-sm px-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full text-sm px-4 py-3 border border-neutral-300 rounded-xl bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all duration-200"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Table Section */}
            <Card variant="elevated" padding="none" className="overflow-hidden">
                {/* Bulk Actions - Desktop */}
                <div className="hidden sm:block">
                    {Object.keys(selectedRows).filter(id => selectedRows[id]).length > 0 && (
                        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                    {Object.keys(selectedRows).filter(id => selectedRows[id]).length} users selected
                                </span>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleBulkStatusChange('Active')}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleBulkStatusChange('Deactive')}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                        Deactivate
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bulk Actions - Mobile */}
                <div className="sm:hidden">
                    {Object.keys(selectedRows).filter(id => selectedRows[id]).length > 0 && (
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <div className="flex flex-col gap-3">
                                <span className="text-sm text-gray-700">
                                    {Object.keys(selectedRows).filter(id => selectedRows[id]).length} users selected
                                </span>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleBulkStatusChange('Active')}
                                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleBulkStatusChange('Deactive')}
                                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                        Deactivate
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border-b border-gray-200">
                            <Table
                                data={users}
                                columns={columns}
                                isLoading={isLoading}
                                sorting={sorting}
                                onSortingChange={setSorting}
                                enableSelection={true}
                                selectedRows={selectedRows}
                                onSelectionChange={setSelectedRows}
                                emptyStateMessage={error || "No users found"}
                            />
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {!isLoading && !error && users.length > 0 && (
                    <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700 w-full sm:w-auto text-center sm:text-left">
                                Showing {Math.min(ITEMS_PER_PAGE, users.length)} of {users.length} users
                            </div>
                            <Pagination
                                currentPage={1}
                                totalPages={Math.ceil(users.length / ITEMS_PER_PAGE)}
                                onPageChange={(page) => {
                                    // Handle page change
                                }}
                                totalItems={users.length}
                                pageSize={ITEMS_PER_PAGE}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* User Creation/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-neutral-500 opacity-75 backdrop-blur-sm"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <div className="mt-4">
                                            <UserCreationForm
                                                user={selectedUser}
                                                onSuccess={handleSuccess}
                                                onCancel={handleCloseModal}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement; 