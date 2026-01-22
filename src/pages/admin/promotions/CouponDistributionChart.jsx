import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Component biểu đồ phân bổ coupon theo loại
 */
const CouponDistributionChart = ({ statistics, loading }) => {
  // Cấu hình màu sắc
  const colors = {
    byType: {
      PUBLIC: { bg: "rgba(59, 130, 246, 0.8)", border: "rgb(59, 130, 246)", label: "Công khai" },
      PRIVATE: { bg: "rgba(139, 92, 246, 0.8)", border: "rgb(139, 92, 246)", label: "Riêng tư" },
      FIRST_ORDER: {
        bg: "rgba(245, 158, 11, 0.8)",
        border: "rgb(245, 158, 11)",
        label: "Đơn đầu tiên",
      },
    },
    byStatus: {
      ACTIVE: { bg: "rgba(34, 197, 94, 0.8)", border: "rgb(34, 197, 94)", label: "Hoạt động" },
      INACTIVE: { bg: "rgba(156, 163, 175, 0.8)", border: "rgb(156, 163, 175)", label: "Vô hiệu" },
      EXPIRED: { bg: "rgba(239, 68, 68, 0.8)", border: "rgb(239, 68, 68)", label: "Hết hạn" },
      USED_OUT: { bg: "rgba(249, 115, 22, 0.8)", border: "rgb(249, 115, 22)", label: "Hết lượt" },
    },
    byDiscountType: {
      PERCENT: { bg: "rgba(14, 165, 233, 0.8)", border: "rgb(14, 165, 233)", label: "Phần trăm" },
      AMOUNT: { bg: "rgba(16, 185, 129, 0.8)", border: "rgb(16, 185, 129)", label: "Số tiền" },
    },
  };

  // Tạo dữ liệu biểu đồ
  const createChartData = (dataMap, colorMap) => {
    if (!dataMap || Object.keys(dataMap).length === 0) {
      return null;
    }

    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];

    Object.entries(dataMap).forEach(([key, value]) => {
      const colorConfig = colorMap[key];
      if (colorConfig) {
        labels.push(colorConfig.label);
        data.push(value);
        backgroundColors.push(colorConfig.bg);
        borderColors.push(colorConfig.border);
      }
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
        },
      ],
    };
  };

  // Options cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="h-48 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  // Render biểu đồ hoặc empty state
  const renderChart = (data, title) => {
    if (!data) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-400">
          <p className="text-sm">Không có dữ liệu</p>
        </div>
      );
    }
    return (
      <div className="h-48">
        <Doughnut data={data} options={chartOptions} />
      </div>
    );
  };

  const typeChartData = createChartData(statistics?.couponsByType, colors.byType);
  const statusChartData = createChartData(statistics?.couponsByStatus, colors.byStatus);
  const discountTypeChartData = createChartData(
    statistics?.couponsByDiscountType,
    colors.byDiscountType
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Theo loại */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
          Phân bổ theo loại
        </h3>
        {loading ? renderSkeleton() : renderChart(typeChartData, "Theo loại")}
      </div>

      {/* Theo trạng thái */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
          Phân bổ theo trạng thái
        </h3>
        {loading ? renderSkeleton() : renderChart(statusChartData, "Theo trạng thái")}
      </div>

      {/* Theo loại giảm giá */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
          Phân bổ theo loại giảm
        </h3>
        {loading ? renderSkeleton() : renderChart(discountTypeChartData, "Theo loại giảm")}
      </div>
    </div>
  );
};

export default CouponDistributionChart;
