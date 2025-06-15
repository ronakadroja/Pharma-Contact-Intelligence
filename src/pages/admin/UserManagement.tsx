import { useState, useEffect, useMemo } from 'react';
import { getUsers, deleteUser, updateUserStatus, updateUserRole } from '../../api/auth';
import UserCreationForm from '../../components/UserCreationForm';
import { useToast } from '../../context/ToastContext';
import type { User } from '../../types/auth';
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
    Filter
} from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    createColumnHelper,
    type SortingState,
    type ColumnDef
} from '@tanstack/react-table';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import classNames from 'classnames';

interface UserWithStatus extends User {
    status: 'active' | 'inactive';
    lastActive?: string;
}

const columnHelper = createColumnHelper<UserWithStatus>();

const UserManagement = () => {
    const [users, setUsers] = useState<UserWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.getValue() === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

    const table = useReactTable({
        data: users,
        columns,
        state: {
            sorting,
            globalFilter,
            rowSelection: selectedRows.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
        },
        enableRowSelection: true,
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === 'function'
                ? updater(selectedRows.reduce((acc, id) => ({ ...acc, [id]: true }), {}))
                : updater;
            setSelectedRows(Object.keys(newSelection).filter(key => newSelection[key]));
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const fetchUsers = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await getUsers();
            if (!Array.isArray(response)) {
                throw new Error('Invalid response format from server');
            }
            // Add mock status and lastActive for demonstration
            const usersWithStatus = response.map(user => ({
                ...user,
                status: (Math.random() > 0.3 ? 'active' : 'inactive') as 'active' | 'inactive',
                lastActive: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            }));
            setUsers(usersWithStatus);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch users';
            setError(message);
            showToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUser(userId);
            showToast('User deleted successfully', 'success');
            fetchUsers();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete user', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} users?`)) return;

        try {
            await Promise.all(selectedRows.map(id => deleteUser(id)));
            showToast(`Successfully deleted ${selectedRows.length} users`, 'success');
            setSelectedRows([]);
            fetchUsers();
        } catch (error) {
            showToast('Failed to delete some users', 'error');
        }
    };

    const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
        try {
            await Promise.all(selectedRows.map(id => updateUserStatus(id, status)));
            showToast(`Successfully updated status for ${selectedRows.length} users`, 'success');
            setSelectedRows([]);
            fetchUsers();
        } catch (error) {
            showToast('Failed to update status for some users', 'error');
        }
    };

    const handleBulkRoleChange = async (role: string) => {
        try {
            await Promise.all(selectedRows.map(id => updateUserRole(id, role)));
            showToast(`Successfully updated role for ${selectedRows.length} users`, 'success');
            setSelectedRows([]);
            fetchUsers();
        } catch (error) {
            showToast('Failed to update role for some users', 'error');
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleEditUser = (user: UserWithStatus) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const csvData = users.map(user => ({
        Name: user.name,
        Email: user.email,
        Company: user.company,
        Role: user.role,
        Credits: user.credits,
        Status: user.status,
        'Last Active': user.lastActive ? format(new Date(user.lastActive), 'MMM dd, yyyy HH:mm') : 'Never'
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </button>
                    <CSVLink
                        data={csvData}
                        filename={`users-${format(new Date(), 'yyyy-MM-dd')}.csv`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </CSVLink>
                    <button
                        onClick={handleAddUser}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add User
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {selectedRows.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-blue-700">{selectedRows.length} users selected</span>
                    <div className="flex gap-2">
                        <select
                            onChange={(e) => handleBulkRoleChange(e.target.value)}
                            className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Change Role</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <select
                            onChange={(e) => handleBulkStatusChange(e.target.value as 'active' | 'inactive')}
                            className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Change Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button
                            onClick={handleBulkDelete}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {users.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">No users found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={classNames(
                                                            'flex items-center gap-1',
                                                            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                                                        )}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {typeof header.column.columnDef.header === 'string'
                                                            ? header.column.columnDef.header
                                                            : null}
                                                        {{
                                                            asc: <ChevronUp className="h-4 w-4" />,
                                                            desc: <ChevronDown className="h-4 w-4" />
                                                        }[header.column.getIsSorted() as string] ?? (
                                                                header.column.getCanSort() && <ArrowUpDown className="h-4 w-4" />
                                                            )}
                                                    </div>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {typeof cell.column.columnDef.cell === 'function'
                                                    ? cell.column.columnDef.cell({ ...cell.getContext(), getValue: () => cell.getValue() })
                                                    : cell.getValue()}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>
                                    {' '}-{' '}
                                    <span className="font-medium">
                                        {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPrePaginationRowModel().rows.length)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-medium">{table.getPrePaginationRowModel().rows.length}</span>
                                    {' '}results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                        disabled={!table.getCanNextPage()}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        Last
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <UserCreationForm
                                user={selectedUser}
                                onSuccess={() => {
                                    setShowModal(false);
                                    setSelectedUser(null);
                                    fetchUsers();
                                }}
                                onCancel={() => {
                                    setShowModal(false);
                                    setSelectedUser(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement; 