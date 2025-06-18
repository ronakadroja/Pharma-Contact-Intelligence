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

interface UserWithStatus extends User {
    status: 'Active' | 'Deactive';
    lastActive?: string;
}

const columnHelper = createColumnHelper<UserWithStatus>();

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
    const [users, setUsers] = useState<UserWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
    const [showFilters, setShowFilters] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { showToast } = useToast();

    const columns = useMemo<ColumnDef<UserWithStatus, any>[]>(
        () => [
            columnHelper.display({
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                ),
            }),
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.getValue() === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {info.getValue()}
                    </span>
                ),
            }),
            columnHelper.accessor('lastActive', {
                header: 'Last Active',
                cell: (info) => info.getValue() ? format(new Date(info.getValue()!), 'MMM dd, yyyy HH:mm') : 'Never',
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleEditUser(row.original)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => handleDeleteUser(row.original.id)}
                            className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
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
            const usersWithStatus: UserWithStatus[] = response.map(user => ({
                ...user,
                status: 'Active',
                lastActive: new Date().toISOString()
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
            showToast('User deleted successfully', 'success');
            fetchUsers();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete user', 'error');
        }
    };

    const handleBulkDelete = async () => {
        const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) return;

        try {
            await Promise.all(selectedIds.map(id => deleteUser(id)));
            showToast(`Successfully deleted ${selectedIds.length} users`, 'success');
            setSelectedRows({});
            fetchUsers();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete users', 'error');
        }
    };

    const handleBulkStatusChange = async (status: 'Active' | 'Deactive') => {
        const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
        try {
            await Promise.all(selectedIds.map(id => updateUserStatus(id, status === 'Active' ? 'active' : 'inactive')));
            showToast(`Successfully updated status for ${selectedIds.length} users`, 'success');
            setSelectedRows({});
            fetchUsers();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to update user status', 'error');
        }
    };

    const handleBulkRoleChange = async (role: string) => {
        const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
        try {
            await Promise.all(selectedIds.map(id => updateUserRole(id, role)));
            showToast(`Successfully updated role for ${selectedIds.length} users`, 'success');
            setSelectedRows({});
            fetchUsers();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to update user role', 'error');
        }
    };

    const handleEditUser = (user: UserWithStatus) => {
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Add, edit, or remove user accounts and manage their permissions.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                setShowModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </button>
                        <CSVLink
                            data={users}
                            filename={`users-${format(new Date(), 'yyyy-MM-dd')}.csv`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </CSVLink>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={globalFilter || ''}
                                        onChange={e => setGlobalFilter(e.target.value)}
                                        placeholder="Search users..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {(roleFilter !== 'all' || statusFilter !== 'all') && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {[
                                                roleFilter !== 'all' && 'Role',
                                                statusFilter !== 'all' && 'Status'
                                            ].filter(Boolean).length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Bulk Actions - Desktop */}
                    <div className="hidden sm:block">
                        {Object.keys(selectedRows).filter(id => selectedRows[id]).length > 0 && (
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
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
                </div>

                {/* User Creation/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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
        </div>
    );
};

export default UserManagement; 