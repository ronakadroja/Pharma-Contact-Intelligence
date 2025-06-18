import React, { useMemo } from 'react';
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
import Loader from './ui/Loader';

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
    const memoizedColumns = useMemo(() => columns, [columns]);
    const memoizedData = useMemo(() => data, [data]);

    const table = useReactTable({
        data: memoizedData,
        columns: memoizedColumns,
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
        return <Loader variant="skeleton" />;
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
                                            className={`flex items-center ${enableSorting && header.column.getCanSort()
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
                                                <span className="ml-2">
                                                    {{
                                                        asc: <ChevronUp className="h-4 w-4" />,
                                                        desc: <ChevronDown className="h-4 w-4" />
                                                    }[header.column.getIsSorted() as string] ?? (
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
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default React.memo(Table) as typeof Table;
