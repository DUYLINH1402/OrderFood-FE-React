import React from "react";

/**
 * Component phân trang cho comment
 * @param {Object} props
 * @param {number} props.currentPage - Trang hiện tại (0-indexed)
 * @param {number} props.totalPages - Tổng số trang
 * @param {boolean} props.hasNext - Có trang tiếp không
 * @param {boolean} props.hasPrevious - Có trang trước không
 * @param {Function} props.onPageChange - Callback khi đổi trang
 * @param {boolean} props.isLoading - Đang loading
 */
const CommentPagination = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  isLoading,
}) => {
  if (totalPages <= 1) return null;

  // Tạo danh sách số trang hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    // Điều chỉnh start nếu end đã chạm giới hạn
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious || isLoading}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600">
        <i className="fas fa-chevron-left text-sx"></i>
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* First page & ellipsis */}
      {pageNumbers[0] > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            disabled={isLoading}
            className="w-9 h-9 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50">
            1
          </button>
          {pageNumbers[0] > 1 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`w-9 h-9 text-sm font-medium rounded-lg transition-all disabled:opacity-50 ${
            page === currentPage
              ? "bg-green-600 text-white shadow-md"
              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
          }`}>
          {page + 1}
        </button>
      ))}

      {/* Last page & ellipsis */}
      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={isLoading}
            className="w-9 h-9 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50">
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext || isLoading}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600">
        <span className="hidden sm:inline">Sau</span>
        <i className="fas fa-chevron-right text-sx"></i>
      </button>
    </div>
  );
};

export default CommentPagination;
