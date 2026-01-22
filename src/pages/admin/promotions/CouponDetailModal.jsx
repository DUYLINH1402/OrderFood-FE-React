import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

/**
 * Modal hiển thị chi tiết hiệu suất của một coupon
 */
const CouponDetailModal = ({ coupon, isOpen, onClose }) => {
  if (!isOpen || !coupon) return null;

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết mã giảm giá</h2>
              <p className="text-sm text-gray-500 mt-1">Thông tin hiệu suất coupon</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Mã coupon</p>
                  <p className="text-2xl font-bold text-blue-600 font-mono">{coupon.code}</p>
                </div>
                {getStatusBadge(coupon.status)}
              </div>
              <p className="text-lg font-medium text-gray-900">{coupon.title}</p>
              {coupon.description && (
                <p className="text-sm text-gray-600 mt-2">{coupon.description}</p>
              )}
            </div>

            {/* Discount Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Giảm giá</p>
                <p className="text-xl font-bold text-green-600">
                  {coupon.discountType === "PERCENT"
                    ? `${coupon.discountValue}%`
                    : formatCurrency(coupon.discountValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Loại: {coupon.discountType === "PERCENT" ? "Phần trăm" : "Số tiền cố định"}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Loại coupon</p>
                <p className="text-xl font-bold text-purple-600">
                  {coupon.couponType === "PUBLIC"
                    ? "Công khai"
                    : coupon.couponType === "PRIVATE"
                    ? "Riêng tư"
                    : "Đơn đầu tiên"}
                </p>
              </div>
            </div>

            {/* Usage Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Thống kê sử dụng</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{coupon.usedCount || 0}</p>
                  <p className="text-xs text-gray-500">Đã sử dụng</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-600">{coupon.maxUsage || "∞"}</p>
                  <p className="text-xs text-gray-500">Tối đa</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {coupon.remainingUsage ?? "-"}
                  </p>
                  <p className="text-xs text-gray-500">Còn lại</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {coupon.uniqueUsersCount || 0}
                  </p>
                  <p className="text-xs text-gray-500">User đã dùng</p>
                </div>
              </div>

              {/* Usage rate bar */}
              {coupon.usageRate !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tỷ lệ sử dụng</span>
                    <span className="font-medium text-gray-900">
                      {coupon.usageRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(coupon.usageRate, 100)}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Performance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Hiệu quả</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Tổng tiền đã giảm</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(coupon.totalDiscountAmount || 0)}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">TB giảm mỗi lần</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(coupon.averageDiscountAmount || 0)}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">TB lượt sử dụng/ngày</p>
                  <p className="text-xl font-bold text-purple-600">
                    {coupon.averageUsagePerDay?.toFixed(1) || 0}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Số ngày hoạt động</p>
                  <p className="text-xl font-bold text-gray-600">{coupon.daysActive || 0}</p>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Điều kiện áp dụng</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đơn tối thiểu:</span>
                  <span className="font-medium text-gray-900">
                    {coupon.minOrderAmount
                      ? formatCurrency(coupon.minOrderAmount)
                      : "Không giới hạn"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm tối đa:</span>
                  <span className="font-medium text-gray-900">
                    {coupon.maxDiscountAmount
                      ? formatCurrency(coupon.maxDiscountAmount)
                      : "Không giới hạn"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giới hạn/người:</span>
                  <span className="font-medium text-gray-900">
                    {coupon.maxUsagePerUser ? `${coupon.maxUsagePerUser} lần` : "Không giới hạn"}
                  </span>
                </div>
              </div>
            </div>

            {/* Time */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Thời gian</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Bắt đầu</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(coupon.startDate)}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                <div className="flex-1 bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Kết thúc</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(coupon.endDate)}</p>
                </div>
              </div>
              {coupon.daysRemaining !== undefined && coupon.daysRemaining > 0 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Còn <span className="font-medium text-orange-600">{coupon.daysRemaining}</span>{" "}
                  ngày nữa hết hạn
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailModal;
