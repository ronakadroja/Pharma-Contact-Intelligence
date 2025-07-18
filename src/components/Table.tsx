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
import { ArrowUpDown, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Loader from './ui/Loader';
import ScrollToTopButton from './ui/ScrollToTopButton';

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
    enablePagination?: boolean; // New prop to control pagination
    enableTableScroll?: boolean; // New prop to enable table-level scrolling
    tableHeight?: string; // Height for the scrollable table container
    scrollContainerRef?: React.RefObject<HTMLDivElement>; // Ref for scroll container
    isLoadingMore?: boolean; // For infinite scroll loading indicator
    showScrollToTop?: boolean; // New prop to control scroll-to-top button visibility
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
    emptyStateMessage = 'No data available',
    enablePagination = true, // Default to true for backward compatibility
    enableTableScroll = false,
    tableHeight = '400px',
    scrollContainerRef,
    isLoadingMore = false,
    showScrollToTop = true // Default to true to show scroll-to-top button
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
        ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
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

    if (enableTableScroll) {
        return (
            <div className="relative w-full border border-gray-200 rounded-lg overflow-hidden bg-white" style={{ height: tableHeight }}>
                <div
                    ref={scrollContainerRef}
                    className="overflow-y-auto overflow-x-auto w-full h-full"
                    style={{ maxWidth: '100%' }}
                >
                    <table className="w-full divide-y divide-gray-200" style={{ width: '100%' }}>
                        <thead
                            className="bg-gray-50 sticky top-0 z-50 shadow-sm border-b border-gray-200"
                            style={{
                                position: 'sticky',
                                top: 0,
                                backgroundColor: '#f9fafb',
                                zIndex: 50
                            }}
                        >
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="pl-5 pr-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 relative z-10"
                                            style={{
                                                backgroundColor: '#f9fafb',
                                                position: 'sticky',
                                                top: 0,
                                                paddingLeft: '20px'
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`flex items-center ${enableSorting && header.column.getCanSort()
                                                        ? 'cursor-pointer select-none hover:text-gray-700'
                                                        : ''
                                                        }`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    role={enableSorting && header.column.getCanSort() ? 'button' : undefined}
                                                    tabIndex={enableSorting && header.column.getCanSort() ? 0 : undefined}
                                                    onKeyDown={(e) => {
                                                        if (enableSorting && header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                                                            e.preventDefault();
                                                            header.column.getToggleSortingHandler()?.(e);
                                                        }
                                                    }}
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
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="pl-5 pr-4 py-3 text-sm text-gray-900"
                                            style={{ paddingLeft: '20px' }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Loading indicator for infinite scroll */}
                    {isLoadingMore && (
                        <div className="flex items-center justify-center py-4 bg-white border-t border-gray-200 sticky bottom-0 z-40">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm font-medium">Loading more...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scroll to top button positioned within table area */}
                {showScrollToTop && (
                    <ScrollToTopButton
                        threshold={300}
                        containerRef={scrollContainerRef}
                        className="absolute bottom-4 right-4 z-50"
                    />
                )}
            </div>
        );
    }

    return (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Sticky Header Container */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full" style={{ minWidth: '1200px', tableLayout: 'fixed' }}>
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="pl-5 pr-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                                            style={{
                                                backgroundColor: '#f9fafb',
                                                width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : 'auto',
                                                minWidth: header.column.columnDef.size ? `${header.column.columnDef.size}px` : '120px',
                                                maxWidth: header.column.columnDef.size ? `${header.column.columnDef.size}px` : 'none',
                                                paddingLeft: '20px'
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`flex items-center ${enableSorting && header.column.getCanSort()
                                                        ? 'cursor-pointer select-none hover:text-gray-700'
                                                        : ''
                                                        }`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    role={enableSorting && header.column.getCanSort() ? 'button' : undefined}
                                                    tabIndex={enableSorting && header.column.getCanSort() ? 0 : undefined}
                                                    onKeyDown={(e) => {
                                                        if (enableSorting && header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                                                            e.preventDefault();
                                                            header.column.getToggleSortingHandler()?.(e);
                                                        }
                                                    }}
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
                    </table>
                </div>
            </div>

            {/* Scrollable Body Container */}
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1200px', tableLayout: 'fixed' }}>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td
                                        key={cell.id}
                                        className="pl-5 pr-4 py-3 text-sm text-gray-900"
                                        style={{
                                            width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : 'auto',
                                            minWidth: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : '120px',
                                            maxWidth: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : 'none',
                                            paddingLeft: '20px'
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default React.memo(Table) as typeof Table;
