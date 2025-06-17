import React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type OnChangeFn,
    type RowSelectionState
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingState from './LoadingState';

interface TableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[];
    isLoading?: boolean;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    enableSorting?: boolean;
    enableSelection?: boolean;
    selectedRows?: RowSelectionState;
    onSelectionChange?: OnChangeFn<RowSelectionState>;
    emptyStateMessage?: string;
}

function Table<T>({
    data,
    columns,
    isLoading = false,
    sorting = [],
    onSortingChange,
    enableSorting = true,
    enableSelection = false,
    selectedRows = {},
    onSelectionChange,
    emptyStateMessage = 'No data available'
}: TableProps<T>) {
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection: selectedRows,
        },
        enableRowSelection: enableSelection,
        onRowSelectionChange: onSelectionChange,
        onSortingChange: onSortingChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (isLoading) {
        return <LoadingState size="small" />;
    }

    if (!data.length) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">{emptyStateMessage}</p>
            </div>
        );
    }

    return (
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
                                            className={`flex items-center gap-2 ${enableSorting && header.column.getCanSort()
                                                ? 'cursor-pointer select-none'
                                                : ''
                                                }`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {enableSorting && header.column.getCanSort() && (
                                                <span className="inline-flex">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    )}
                                                </span>
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
                        <tr
                            key={row.id}
                            className={`hover:bg-gray-50 ${row.getIsSelected() ? 'bg-blue-50' : ''
                                }`}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
