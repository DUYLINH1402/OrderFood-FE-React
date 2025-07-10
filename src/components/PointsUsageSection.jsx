import React from "react";
import { calculatePointsNeeded } from "../pages/Order/orderUtils";

const PointsUsageSection = ({
  user,
  availablePoints,
  usePoints,
  pointsToUse,
  pointsError,
  maxPointsDiscount,
  pointsToVndRate,
  pointsDiscount,
  onUsePointsChange,
  onPointsInputChange,
  onUseMaxPoints,
}) => {
  // Debug: Log để kiểm tra giá trị
  console.log("PointsUsageSection Props:", { user, availablePoints, usePoints });

  // Chỉ ẩn nếu user chưa đăng nhập
  if (!user) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 transition-all duration-300 hover:shadow-md">
      <label className="flex items-center gap-2 mb-3 text-sm md:text-base select-none cursor-pointer">
        <input
          type="checkbox"
          checked={usePoints}
          onChange={(e) => onUsePointsChange(e.target.checked)}
          className="accent-green-600 w-6 h-6 rounded border-gray-300 focus:ring-2 focus:ring-green-400 transition-all duration-150"
          disabled={availablePoints <= 0}
        />
        <span className="font-medium text-green-700 transition-colors duration-200">
          Sử dụng điểm thưởng ({availablePoints.toLocaleString()} điểm có sẵn)
          {availablePoints <= 0 && <span className="text-gray-500 ml-1">(Không có điểm)</span>}
        </span>
      </label>

      {/* Hiệu ứng đóng mở mượt mà cho phần nhập điểm */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          usePoints
            ? "max-h-[400px] opacity-100 mt-0"
            : "max-h-0 opacity-0 -mt-3 pointer-events-none"
        }`}
        style={{ willChange: "max-height, opacity, margin-top" }}>
        <div className="space-y-3 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={Math.min(
                availablePoints,
                calculatePointsNeeded(maxPointsDiscount, pointsToVndRate)
              )}
              value={pointsToUse}
              onChange={(e) => onPointsInputChange(e.target.value)}
              placeholder="Nhập số điểm"
              className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                pointsError ? "border-red-500 focus:ring-red-400" : ""
              }`}
            />
            <button
              type="button"
              onClick={onUseMaxPoints}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 whitespace-nowrap transform hover:scale-105 active:scale-95">
              Dùng tối đa
            </button>
          </div>

          {pointsError && (
            <p className="text-red-500 text-sm animate-pulse transition-all duration-300">
              {pointsError}
            </p>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p className="transition-all duration-200">• Tối đa sử dụng 50% tổng tiền đơn hàng</p>
            <p className="transition-all duration-200">• 1 điểm = 1.000đ</p>
            {pointsDiscount > 0 && (
              <p className="text-green-600 font-medium transition-all duration-300 transform translate-x-0">
                → Giảm: {pointsDiscount.toLocaleString()}₫
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsUsageSection;
