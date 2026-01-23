import React, { useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

/**
 * Component bảng danh sách coupon với filter và phân trang
 */
const CouponListTable = ({
  coupons,
  loading,
  pagination,
  onFilter,
  onPageChange,
  onViewDetail,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    keyword: "",
  });

  // Xử lý thay đổi filter
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  // Áp dụng filter
  const handleApplyFilter = () => {
    onFilter && onFilter(filters);
  };

  // Reset filter
  const handleResetFilter = () => {
    const resetFilters = { status: "", type: "", keyword: "" };
    setFilters(resetFilters);
    onFilter && onFilter(resetFilters);
  };

  // Lấy badge status
  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { label: "Hoạt động", className: "bg-green-100 text-green-800" },
      INACTIVE: { label: "Vô hiệu", className: "bg-gray-100 text-gray-800" },
      EXPIRED: { label: "Hết hạn", className: "bg-red-100 text-red-800" },
      USED_OUT: { label: "Hết lượt", className: "bg-orange-100 text-orange-800" },
    };
    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 text-sx font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Lấy badge type
  const getTypeBadge = (type) => {
    const typeConfig = {
      PUBLIC: { label: "Công khai", className: "bg-blue-100 text-blue-800" },
      PRIVATE: { label: "Riêng tư", className: "bg-purple-100 text-purple-800" },
      FIRST_ORDER: { label: "Đơn đầu", className: "bg-yellow-100 text-yellow-800" },
    };
    const config = typeConfig[type] || { label: type, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 text-sx font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <tbody>
      {[...Array(5)].map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header và Filter */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách mã giảm giá</h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm mã hoặc tiêu đề..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Vô hiệu</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="USED_OUT">Hết lượt</option>
            </select>

            {/* Type filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Tất cả loại</option>
              <option value="PUBLIC">Công khai</option>
              <option value="PRIVATE">Riêng tư</option>
              <option value="FIRST_ORDER">Đơn đầu tiên</option>
            </select>

            {/* Buttons */}
            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Lọc
            </button>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Mã
              </th>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Giảm giá
              </th>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Sử dụng
              </th>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Thời hạn
              </th>
              <th className="px-4 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          {loading ? (
            renderSkeleton()
          ) : (
            <tbody className="divide-y divide-gray-200">
              {coupons && coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon.couponId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-600">{coupon.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 truncate max-w-[200px]">{coupon.title}</p>
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(coupon.couponType)}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {coupon.discountType === "PERCENT"
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(coupon.status)}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{coupon.usedCount || 0}</span>
                        <span className="text-gray-500">/{coupon.maxUsage || "∞"}</span>
                      </div>
                      {coupon.usageRate !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(coupon.usageRate, 100)}%` }}></div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sx text-gray-500">
                        <p>{formatDate(coupon.startDate)} -</p>
                        <p>{formatDate(coupon.endDate)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail && onViewDetail(coupon)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title="Xem chi tiết">
                          Chi tiết
                        </button>
                        <button
                          onClick={() => onEdit && onEdit(coupon)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          title="Chỉnh sửa">
                          Sửa
                        </button>
                        {coupon.status === "ACTIVE" ? (
                          <button
                            onClick={() => onDeactivate && onDeactivate(coupon.couponId)}
                            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                            title="Vô hiệu hóa">
                            Tắt
                          </button>
                        ) : coupon.status === "INACTIVE" ? (
                          <button
                            onClick={() => onActivate && onActivate(coupon.couponId)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            title="Kích hoạt">
                            Bật
                          </button>
                        ) : null}
                        <button
                          onClick={() => onDelete && onDelete(coupon.couponId)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          title="Xóa">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Không tìm thấy mã giảm giá nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {pagination.currentPage * pagination.pageSize + 1} -{" "}
            {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)}{" "}
            trong {pagination.totalElements} mã
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Trước
            </button>
            {[...Array(Math.min(pagination.totalPages, 5))].map((_, idx) => {
              const pageNum = idx;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange && onPageChange(pageNum)}
                  className={`px-3 py-1 border rounded text-sm ${
                    pagination.currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}>
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponListTable;
