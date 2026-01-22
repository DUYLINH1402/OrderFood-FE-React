import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

/**
 * Component hiển thị các thẻ thống kê tổng quan về coupon
 */
const CouponStatisticsCards = ({ statistics, loading }) => {
  const cards = [
    {
      title: "Tổng mã giảm giá",
      value: statistics?.totalCoupons || 0,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      ),
      bgColor: "bg-indigo-500",
      textColor: "text-indigo-600",
    },
    {
      title: "Đang hoạt động",
      value: statistics?.activeCoupons || 0,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      bgColor: "bg-green-500",
      textColor: "text-green-600",
      subValue: statistics?.activeRate ? `${statistics.activeRate.toFixed(1)}%` : null,
      subLabel: "tỷ lệ hoạt động",
    },
    {
      title: "Tổng lượt sử dụng",
      value: statistics?.totalUsageCount || 0,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      ),
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      subValue: statistics?.usageRate ? `${statistics.usageRate.toFixed(1)}%` : null,
      subLabel: "tỷ lệ sử dụng",
    },
    {
      title: "Tổng tiền giảm",
      value: formatCurrency(statistics?.totalDiscountAmount || 0),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      ),
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-600",
      isPrice: true,
    },
  ];

  const statusCards = [
    {
      title: "Hết hạn",
      value: statistics?.expiredCoupons || 0,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Vô hiệu hóa",
      value: statistics?.inactiveCoupons || 0,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      title: "Hết lượt",
      value: statistics?.usedOutCoupons || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "TB giảm/lần",
      value: formatCurrency(statistics?.averageDiscountAmount || 0),
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-5 animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 ${card.bgColor} rounded-md flex items-center justify-center`}>
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">{card.title}</p>
                  <p className={`text-lg font-semibold text-gray-900`}>
                    {card.isPrice ? card.value : card.value.toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
              {card.subValue && (
                <div className="mt-2 flex items-center text-sm">
                  <span className={card.textColor}>{card.subValue}</span>
                  <span className="text-gray-500 ml-1">{card.subLabel}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((card, idx) => (
          <div key={idx} className={`${card.bgColor} rounded-lg p-4`}>
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className={`text-xl font-semibold ${card.color}`}>
              {typeof card.value === "number" ? card.value.toLocaleString("vi-VN") : card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponStatisticsCards;
