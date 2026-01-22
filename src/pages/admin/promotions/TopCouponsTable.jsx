import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

/**
 * Component hiển thị top coupon theo lượt sử dụng hoặc tiền giảm
 */
const TopCouponsTable = ({ topByUsage, topByDiscount, loading }) => {
  // Lấy icon theo loại giảm giá
  const getDiscountTypeIcon = (type) => {
    if (type === "PERCENT") {
      return (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-10 h-10 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );

  // Render danh sách coupon
  const renderCouponList = (coupons, type = "usage") => {
    if (!coupons || coupons.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-10 w-10 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">Chưa có dữ liệu</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {coupons.map((coupon, idx) => (
          <div
            key={coupon.couponId}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              {/* Ranking badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  idx === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : idx === 1
                    ? "bg-gray-200 text-gray-700"
                    : idx === 2
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                {idx + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{coupon.couponCode}</span>
                  {getDiscountTypeIcon(coupon.discountType)}
                </div>
                <p className="text-sm text-gray-500 truncate max-w-[180px]">{coupon.title}</p>
              </div>
            </div>

            <div className="text-right">
              {type === "usage" ? (
                <div>
                  <span className="text-lg font-semibold text-blue-600">
                    {coupon.usageCount.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">lượt</span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(coupon.totalDiscountAmount)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top theo lượt sử dụng */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top mã giảm giá theo lượt dùng</h3>
          <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">Top 5</span>
        </div>
        {loading ? renderSkeleton() : renderCouponList(topByUsage, "usage")}
      </div>

      {/* Top theo tổng tiền giảm */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top mã giảm giá theo tiền giảm</h3>
          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">Top 5</span>
        </div>
        {loading ? renderSkeleton() : renderCouponList(topByDiscount, "discount")}
      </div>
    </div>
  );
};

export default TopCouponsTable;
