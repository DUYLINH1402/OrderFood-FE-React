import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Select } from "antd";
import {
  getAdvancedStatisticsApi,
  getRevenueByCategoryApi,
  getFoodPerformanceApi,
  getTopSellingFoodsApi,
} from "../../services/api/adminDashboardApi";
import { formatCurrency } from "../../utils/formatCurrency";
import SpinnerCube from "../../components/Skeleton/SpinnerCube";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalytics = () => {
  // State cho dữ liệu thống kê
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30"); // Số ngày thống kê
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    aovChangePercent: 0,
    cancelRate: 0,
    cancelRateChangePercent: 0,
    newCustomers: 0,
    newCustomersChangePercent: 0,
    usedPoints: 0,
    usedPointsChangePercent: 0,
    pointsDiscountValue: 0,
  });
  const [topFoods, setTopFoods] = useState([]);
  const [foodPerformance, setFoodPerformance] = useState([]);
  const [chartType, setChartType] = useState("bar"); // "bar" hoặc "line"
  const [categoryRevenue, setCategoryRevenue] = useState([]);

  // Hàm lấy dữ liệu thống kê
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const periodDays = parseInt(period);

      // Gọi 4 API mới song song
      const [advancedStatsRes, categoryRevenueRes, foodPerformanceRes, topSellingRes] =
        await Promise.all([
          getAdvancedStatisticsApi(periodDays),
          getRevenueByCategoryApi(periodDays),
          getFoodPerformanceApi(periodDays, 0, 10),
          getTopSellingFoodsApi(periodDays),
        ]);

      // Xử lý dữ liệu thống kê nâng cao
      if (advancedStatsRes?.success && advancedStatsRes.data) {
        const data = advancedStatsRes.data;
        setStatistics({
          totalOrders: data.totalOrders || 0,
          cancelledOrders: data.cancelledOrders || 0,
          averageOrderValue: data.aov || 0,
          aovChangePercent: data.aovChangePercent || 0,
          cancelRate: data.cancellationRate || 0,
          cancelRateChangePercent: data.cancellationRateChangePercent || 0,
          newCustomers: data.newCustomers || 0,
          newCustomersChangePercent: data.newCustomersChangePercent || 0,
          usedPoints: data.pointsUsed || 0,
          usedPointsChangePercent: data.pointsUsedChangePercent || 0,
          pointsDiscountValue: data.pointsDiscountValue || 0,
        });
      }

      // Xử lý dữ liệu doanh thu theo danh mục
      if (categoryRevenueRes?.success && categoryRevenueRes.data) {
        setCategoryRevenue(categoryRevenueRes.data.categories || []);
      }

      // Xử lý dữ liệu hiệu quả món ăn
      if (foodPerformanceRes?.success && foodPerformanceRes.data) {
        setFoodPerformance(foodPerformanceRes.data.foods || []);
      }

      // Xử lý dữ liệu top món bán chạy
      if (topSellingRes?.success && topSellingRes.data) {
        setTopFoods(topSellingRes.data.topFoods || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu thống kê:", err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Gọi API khi component mount hoặc period thay đổi
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Xử lý thay đổi period
  const handlePeriodChange = (value) => {
    setPeriod(value);
  };

  // 1. Dữ liệu cho Biểu đồ Cột (Top món bán chạy)
  const topFoodsChartData = {
    labels: topFoods.length > 0 ? topFoods.map((food) => food.foodName) : ["Chưa có dữ liệu"],
    datasets: [
      {
        label: "Số lượng bán ra",
        data: topFoods.length > 0 ? topFoods.map((food) => food.quantitySold || 0) : [0],
        backgroundColor: chartType === "bar" ? "rgba(34, 197, 94, 0.7)" : "rgba(34, 197, 94, 0.2)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
        borderRadius: chartType === "bar" ? 6 : 0,
        fill: chartType === "line",
        tension: 0.4,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Doanh thu (triệu)",
        data: topFoods.length > 0 ? topFoods.map((food) => (food.revenue || 0) / 1000000) : [0],
        backgroundColor:
          chartType === "bar" ? "rgba(59, 130, 246, 0.7)" : "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        borderRadius: chartType === "bar" ? 6 : 0,
        fill: chartType === "line",
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: "y1",
      },
    ],
  };

  // 2. Dữ liệu cho Biểu đồ Tròn (Cơ cấu danh mục)
  const doughnutData = {
    labels:
      categoryRevenue.length > 0
        ? categoryRevenue.map((cat) => cat.categoryName)
        : ["Chưa có dữ liệu"],
    datasets: [
      {
        data: categoryRevenue.length > 0 ? categoryRevenue.map((cat) => cat.revenue) : [0],
        backgroundColor:
          categoryRevenue.length > 0
            ? categoryRevenue.map((cat) => cat.color || "#3b82f6")
            : ["#3b82f6"],
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    maintainAspectRatio: false,
  };

  // Options cho biểu đồ top món ăn
  const topFoodsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Doanh thu (triệu)") {
              return `Doanh thu: ${context.raw.toFixed(2)}M VNĐ`;
            }
            return `Số lượng: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Số lượng",
          font: {
            size: 12,
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function (value) {
            return value.toFixed(1) + "M";
          },
        },
        title: {
          display: true,
          text: "Doanh thu (triệu VNĐ)",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center items-center ">
          <SpinnerCube />
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Phân tích</h1>
          <p className="text-base text-gray-600">Dữ liệu chi tiết về hoạt động kinh doanh</p>
        </div>
        <Select
          value={period}
          onChange={handlePeriodChange}
          size="large"
          className="w-40"
          style={{ minWidth: 140 }}
          options={[
            { value: "7", label: "7 ngày qua" },
            { value: "30", label: "30 ngày qua" },
            { value: "90", label: "Quý này" },
          ]}
        />
      </div>

      {/* Grid thông số nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "AOV (Đơn trung bình)",
            value: formatCurrency(statistics.averageOrderValue),
            change: statistics.aovChangePercent,
            color: "text-blue-600",
          },
          {
            label: "Tỷ lệ hủy đơn",
            value: `${statistics.cancelRate.toFixed(1)}%`,
            change: statistics.cancelRateChangePercent,
            color: "text-red-600",
            inverseChange: true, // Tăng là xấu, giảm là tốt
          },
          {
            label: "Khách hàng mới",
            value: statistics.newCustomers.toLocaleString("vi-VN"),
            change: statistics.newCustomersChangePercent,
            color: "text-green-600",
          },
          {
            label: "Điểm thưởng đã dùng",
            value: statistics.usedPoints.toLocaleString("vi-VN"),
            change: statistics.usedPointsChangePercent,
            color: "text-orange-600",
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            {item.change !== undefined && item.change !== 0 && (
              <div className="flex items-center mt-1">
                <span
                  className={`text-sm font-medium ${
                    item.inverseChange
                      ? item.change > 0
                        ? "text-red-500"
                        : "text-green-500"
                      : item.change > 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {item.change > 0 ? "+" : ""}
                  {item.change.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-400 ml-1">so với kỳ trước</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Biểu đồ chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Biểu đồ cột chiếm 2 phần */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Header với nút chuyển đổi chế độ */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top món ăn bán chạy</h3>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  chartType === "bar"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Biểu đồ cột">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  chartType === "line"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Biểu đồ đường">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {topFoods.length > 0 ? (
            <div>
              <div className="h-[300px]">
                {chartType === "bar" ? (
                  <Bar data={topFoodsChartData} options={topFoodsChartOptions} />
                ) : (
                  <Line data={topFoodsChartData} options={topFoodsChartOptions} />
                )}
              </div>
              {/* Tổng kết */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-500">Số lượng bán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-500">Doanh thu</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Tổng doanh thu: </span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(topFoods.reduce((sum, food) => sum + (food.revenue || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Chưa có dữ liệu món ăn</p>
              </div>
            </div>
          )}
        </div>

        {/* Biểu đồ tròn chiếm 1 phần */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Cơ cấu doanh thu</h3>
          <div className="h-[300px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bảng chi tiết hiệu quả sản phẩm */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Chi tiết hiệu quả món ăn</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">Tên món</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Số đơn</th>
                <th className="p-4 font-semibold">SL bán</th>
                <th className="p-4 font-semibold">Doanh thu</th>
                <th className="p-4 font-semibold">Đánh giá</th>
                <th className="p-4 font-semibold">Xu hướng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {foodPerformance.length > 0 ? (
                foodPerformance.map((food, index) => (
                  <tr key={food.foodId || index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {food.imageUrl && (
                          <img
                            src={food.imageUrl}
                            alt={food.foodName}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <span className="text-sm">{food.foodName}</span>
                      </div>
                    </td>
                    <td className="text-sm p-1 text-gray-600">{food.categoryName || "-"}</td>
                    <td className="text-sm p-1">{food.orderCount || 0}</td>
                    <td className="text-sm p-1">{food.quantitySold || 0}</td>
                    <td className="text-sm p-1 font-semibold">
                      {formatCurrency(food.revenue || 0)}
                    </td>
                    <td className="text-sm p-4 text-yellow-500">
                      {food.averageRating
                        ? `${food.averageRating.toFixed(1)}/5 (${food.reviewCount || 0})`
                        : "Chưa có"}
                    </td>
                    <td className="p-4">
                      {food.trend ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            food.trend === "UP"
                              ? "bg-green-100 text-green-700"
                              : food.trend === "DOWN"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                          {food.trend === "UP"
                            ? `+${food.trendPercentage?.toFixed(1) || 0}%`
                            : food.trend === "DOWN"
                            ? `${food.trendPercentage?.toFixed(1) || 0}%`
                            : food.trend}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-sm text-center text-gray-500">
                    Chưa có dữ liệu món ăn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
