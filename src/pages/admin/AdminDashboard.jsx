import React, { useState, useEffect } from "react";
import { usePermissions } from "../../hooks/auth/useAuth";
import { PERMISSIONS } from "../../utils/roleConfig";
import {
  getDashboardStatisticsApi,
  getDashboardRevenueApi,
  getDashboardActivitiesApi,
} from "../../services/api/adminDashboardApi";
import { formatCurrency } from "../../utils/formatCurrency";
import { getActivityColor } from "../../utils/getActivityColor";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
// Hàm lấy icon dựa vào loại hoạt động
const getActivityIcon = (type) => {
  if (type.includes("CANCEL")) {
    return (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    );
  }
  if (type.includes("COMPLETED") || type.includes("DELIVERED")) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />;
  }
  if (type.includes("ORDER")) {
    return (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    );
  }
  return (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  );
};

const AdminDashboard = () => {
  const { hasPermission } = usePermissions();

  // State cho thống kê
  const [statistics, setStatistics] = useState({
    totalCustomers: 0,
    monthlyRevenue: 0,
    todayOrders: 0,
    totalStaff: 0,
    pendingOrders: 0,
    completedTodayOrders: 0,
    revenueGrowthPercent: 0,
    customerGrowthPercent: 0,
  });

  // State cho doanh thu 7 ngày
  const [revenueData, setRevenueData] = useState([]);

  // State cho hoạt động gần đây
  const [activities, setActivities] = useState([]);

  // State loading
  const [loading, setLoading] = useState(true);

  // State cho chế độ biểu đồ: "bar" hoặc "line"
  const [chartType, setChartType] = useState("bar");

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Gọi song song 3 API
        const [statsRes, revenueRes, activitiesRes] = await Promise.all([
          getDashboardStatisticsApi(),
          getDashboardRevenueApi(7),
          getDashboardActivitiesApi(10),
        ]);

        if (statsRes.success && statsRes.data) {
          setStatistics(statsRes.data);
        }

        if (revenueRes.success && revenueRes.data?.dailyRevenues) {
          setRevenueData(revenueRes.data.dailyRevenues);
        }

        if (activitiesRes.success && activitiesRes.data?.activities) {
          setActivities(activitiesRes.data.activities);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Tính toán max revenue để vẽ biểu đồ
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

  // Cấu hình dữ liệu cho Chart.js
  const chartData = {
    labels: revenueData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: revenueData.map((item) => item.revenue),
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
        label: "Số đơn hàng",
        data: revenueData.map((item) => item.orderCount),
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

  // Cấu hình options cho Chart.js
  const chartOptions = {
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
            if (context.dataset.label === "Doanh thu (VNĐ)") {
              return `Doanh thu: ${formatCurrency(context.raw)}`;
            }
            return `Đơn hàng: ${context.raw}`;
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
          callback: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + "K";
            }
            return value;
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
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Bảng điều khiển quản trị</h1>
        <p className="text-base text-gray-600">Tổng quan hệ thống nhà hàng</p>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tổng khách hàng */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng khách hàng</dt>
                  <dd className="flex items-baseline">
                    <span className="text-lg font-medium text-gray-900">
                      {loading ? "..." : statistics.totalCustomers.toLocaleString("vi-VN")}
                    </span>
                    {statistics.customerGrowthPercent !== 0 && (
                      <span
                        className={`ml-2 text-xs font-medium ${
                          statistics.customerGrowthPercent > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                        {statistics.customerGrowthPercent > 0 ? "+" : ""}
                        {statistics.customerGrowthPercent.toFixed(1)}%
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/admin/users" className="font-medium text-indigo-600 hover:text-indigo-500">
                Xem chi tiết
              </a>
            </div>
          </div>
        </div>

        {/* Nhân viên */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Nhân viên</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? "..." : statistics.totalStaff}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/admin/staff" className="font-medium text-red-600 hover:text-red-500">
                Quản lý nhân viên
              </a>
            </div>
          </div>
        </div>

        {/* Doanh thu tháng */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Doanh thu tháng</dt>
                  <dd className="flex items-baseline">
                    <span className="text-lg font-medium text-gray-900">
                      {loading ? "..." : formatCurrency(statistics.monthlyRevenue)}
                    </span>
                    {statistics.revenueGrowthPercent !== 0 && (
                      <span
                        className={`ml-2 text-sm font-medium ${
                          statistics.revenueGrowthPercent > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                        {statistics.revenueGrowthPercent > 0 ? "+" : ""}
                        {statistics.revenueGrowthPercent.toFixed(1)}%
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="/admin/analytics"
                className="font-medium text-green-600 hover:text-green-500">
                Xem báo cáo
              </a>
            </div>
          </div>
        </div>

        {/* Đơn hàng hôm nay */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Đơn hàng hôm nay</dt>
                  <dd className="flex items-baseline">
                    <span className="text-lg font-medium text-gray-900">
                      {loading ? "..." : statistics.todayOrders}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({statistics.completedTodayOrders} hoàn thành, {statistics.pendingOrders} chờ
                      xử lý)
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/admin/orders" className="font-medium text-yellow-600 hover:text-yellow-500">
                Quản lý đơn hàng
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Biểu đồ doanh thu */}
        {hasPermission(PERMISSIONS.VIEW_ANALYTICS) && (
          <div className="bg-white shadow rounded-lg p-6">
            {/* Header với nút chuyển đổi chế độ */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Doanh thu 7 ngày qua</h2>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType("bar")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    chartType === "bar"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Biểu đồ cột">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {loading ? (
              <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-500">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : revenueData.length > 0 ? (
              <div>
                {/* Biểu đồ Chart.js */}
                <div className="h-72">
                  {chartType === "bar" ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <Line data={chartData} options={chartOptions} />
                  )}
                </div>
                {/* Tổng doanh thu */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-500">Doanh thu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-500">Đơn hàng</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Tổng 7 ngày: </span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center">
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
                  <p className="mt-2 text-sm text-gray-500">Chưa có dữ liệu doanh thu</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hoạt động gần đây */}
        <div className="bg-white  shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="flow-root ">
            {loading ? (
              <div className="flex  items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : activities.length > 0 ? (
              <ul className="-mb-8">
                {activities.slice(0, 5).map((activity, activityIdx) => (
                  <li key={activity.referenceId || activityIdx}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.slice(0, 5).length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(
                              activity.type
                            )}`}>
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              {getActivityIcon(activity.type)}
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            {activity.customerName && (
                              <p className="text-sm text-gray-400 mt-1">
                                KH: {activity.customerName}
                                {activity.amount > 0 && (
                                  <span className="ml-2">- {formatCurrency(activity.amount)}</span>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{formatRelativeTime(activity.timestamp)}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hasPermission(PERMISSIONS.MANAGE_USERS) && (
            <a
              href="/admin/users"
              className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg border border-indigo-200 text-left transition-colors block">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">Quản lý người dùng</p>
                  <p className="text-sm text-indigo-600">Xem và quản lý tài khoản</p>
                </div>
              </div>
            </a>
          )}

          {hasPermission(PERMISSIONS.MANAGE_MENU) && (
            <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 text-left transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Thêm món ăn</p>
                  <p className="text-sm text-green-600">Cập nhật thực đơn</p>
                </div>
              </div>
            </button>
          )}

          {hasPermission(PERMISSIONS.MANAGE_PROMOTIONS) && (
            <button className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg border border-yellow-200 text-left transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Tạo khuyến mãi</p>
                  <p className="text-sm text-yellow-600">Chương trình ưu đãi</p>
                </div>
              </div>
            </button>
          )}

          {hasPermission(PERMISSIONS.VIEW_FINANCIAL_REPORTS) && (
            <button className="bg-red-50 hover:bg-red-100 p-4 rounded-lg border border-red-200 text-left transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Xuất báo cáo</p>
                  <p className="text-sm text-red-600">Báo cáo tài chính</p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
