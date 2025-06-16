import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    total: number;
    perPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ total, perPage, currentPage, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(total / perPage);

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page and ellipsis if necessary
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className="px-3 py-1 rounded hover:bg-gray-100 text-sm"
                    aria-label="Go to first page"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="ellipsis1" className="px-2 text-gray-500">
                        ...
                    </span>
                );
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 rounded text-sm ${i === currentPage
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-gray-100"
                        }`}
                    aria-label={`Go to page ${i}`}
                    aria-current={i === currentPage ? "page" : undefined}
                >
                    {i}
                </button>
            );
        }

        // Add last page and ellipsis if necessary
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="ellipsis2" className="px-2 text-gray-500">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-1 rounded hover:bg-gray-100 text-sm"
                    aria-label="Go to last page"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between border-t py-4">
            <div className="flex items-center text-sm text-gray-500">
                <span>
                    Showing {Math.min((currentPage - 1) * perPage + 1, total)} to{" "}
                    {Math.min(currentPage * perPage, total)} of {total} results
                </span>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-1 rounded ${currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-100"
                        }`}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center">
                    {renderPageNumbers()}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded ${currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-100"
                        }`}
                    aria-label="Next page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
