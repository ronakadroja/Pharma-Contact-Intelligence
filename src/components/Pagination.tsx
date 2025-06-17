import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    totalItems?: number;
    pageSize?: number;
    showTotalItems?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    pageSize,
    showTotalItems = true,
}) => {
    const canPreviousPage = hasPreviousPage ?? currentPage > 1;
    const canNextPage = hasNextPage ?? currentPage < totalPages;

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
            {showTotalItems && totalItems !== undefined && pageSize !== undefined && (
                <div className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                        {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
                    </span>
                    {' '}-{' '}
                    <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalItems)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{totalItems}</span>
                    {' '}results
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={!canPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">First</span>
                    <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="hidden sm:flex gap-1">
                    {getPageNumbers().map((pageNumber, index) => (
                        pageNumber === '...' ? (
                            <span
                                key={`dots-${index}`}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={pageNumber}
                                onClick={() => onPageChange(pageNumber as number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${currentPage === pageNumber
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        )
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">Last</span>
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
