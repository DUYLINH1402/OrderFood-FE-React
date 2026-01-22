import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

/**
 * Component hiển thị top user sử dụng coupon nhiều nhất
 */
const TopCouponUsersTable = ({ topUsers, loading }) => {
  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-3 h-full">
      {[...Array(5)].map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        {renderSkeleton()}
      </div>
    );
  }

  if (!topUsers || topUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top khách hàng sử dụng mã giảm giá
        </h3>
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm">Chưa có dữ liệu khách hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top khách hàng sử dụng mã giảm giá</h3>
        <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">Top 5</span>
      </div>

      <div className="space-y-3">
        {topUsers.map((user, idx) => (
          <div
            key={user.userId}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              {/* Ranking badge */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  idx === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : idx === 1
                    ? "bg-gray-200 text-gray-700"
                    : idx === 2
                    ? "bg-orange-100 text-orange-700"
                    : "bg-purple-100 text-purple-500"
                }`}>
                {idx < 3 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              <div>
                <p className="font-medium text-gray-900">{user.fullName || user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-purple-600">
                  {user.totalCouponsUsed?.toLocaleString("vi-VN") || 0}
                </span>
                <span className="text-sm text-gray-500">mã</span>
              </div>
              <p className="text-xs text-gray-500">
                Tiết kiệm: {formatCurrency(user.totalDiscountReceived || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tổng kết */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tổng mã sử dụng (Top 5):</span>
          <span className="font-medium text-gray-900">
            {topUsers
              .reduce((sum, user) => sum + (user.totalCouponsUsed || 0), 0)
              .toLocaleString("vi-VN")}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Tổng tiền tiết kiệm:</span>
          <span className="font-medium text-green-600">
            {formatCurrency(
              topUsers.reduce((sum, user) => sum + (user.totalDiscountReceived || 0), 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopCouponUsersTable;
