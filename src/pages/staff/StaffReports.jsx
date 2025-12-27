import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  RefreshCw,
  ChevronDown,
  Package,
  AlertCircle,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { getStaffReportData } from "../../services/service/staffReportService";

const StaffReports = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    processingOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    completionRate: 0,
    topDishes: [],
    hourlyStats: [],
    recentOrders: [],
    trends: {
      orders: { positive: true, value: "0%", text: "" },
      revenue: { positive: true, value: "0%", text: "" },
      avgValue: { positive: true, value: "0%", text: "" },
      completion: { positive: true, value: "0%", text: "" },
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch report data from API
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getStaffReportData(selectedPeriod, selectedDate);

      if (response.success && response.data) {
        setReportData(response.data);
        setLastUpdated(new Date());
        console.log("Report data loaded:", response.data);
      } else {
        setError(response.message || "Không thể tải dữ liệu báo cáo");
        toast.error(response.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu báo cáo");
      toast.error("Có lỗi xảy ra khi tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedDate]);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-md font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xxl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-md text-gray-500">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center mt-2 text-md font-medium ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${!trend.positive && "rotate-180"}`} />
              {trend.value}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || "pending";
    const styles = {
      completed: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-orange-100 text-orange-700 border-orange-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      confirmed: "bg-yellow-100 text-yellow-700 border-yellow-200",
      delivering: "bg-purple-100 text-purple-700 border-purple-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    const labels = {
      completed: "Hoàn thành",
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      confirmed: "Đã xác nhận",
      delivering: "Đang giao",
      cancelled: "Đã hủy",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-sx font-medium border ${
          styles[normalizedStatus] || styles.pending
        }`}>
        {labels[normalizedStatus] || "Không rõ"}
      </span>
    );
  };

  const completionRate =
    reportData.totalOrders > 0
      ? ((reportData.completedOrders / reportData.totalOrders) * 100).toFixed(1)
      : 0;

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    return lastUpdated.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Loading overlay
  if (loading && reportData.totalOrders === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-base text-gray-600 font-medium">Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-md font-medium text-red-900 mb-1">Lỗi tải dữ liệu</p>
              <p className="text-md text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xxl laptop:text-[36px] font-bold text-gray-900 mb-2">
                Báo cáo hoạt động
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-base">Tổng quan tình hình kinh doanh</span>
                {lastUpdated && (
                  <span className="text-md text-gray-400">
                    - Cập nhật lúc: {formatLastUpdated()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={fetchReportData}
              disabled={loading}
              className="flex items-center px-4 py-2.5 bg-blue-600 text-white text-md rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
              <RefreshCw className={`w-6 h-6 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedPeriod("today")}
                className={`px-4 py-2 rounded-lg font-medium text-md transition-colors ${
                  selectedPeriod === "today"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Hôm nay
              </button>
              <button
                onClick={() => setSelectedPeriod("week")}
                className={`px-4 py-2 rounded-lg font-medium text-md transition-colors ${
                  selectedPeriod === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Tuần này
              </button>
              <button
                onClick={() => setSelectedPeriod("month")}
                className={`px-4 py-2 rounded-lg font-medium text-md transition-colors ${
                  selectedPeriod === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Tháng này
              </button>
              <button
                onClick={() => setSelectedPeriod("custom")}
                className={`px-4 py-2 rounded-lg font-medium text-md transition-colors ${
                  selectedPeriod === "custom"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Tùy chọn
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Clock className="w-6 h-6 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedPeriod("custom");
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng đơn hàng"
            value={reportData.totalOrders}
            subtitle="đơn"
            icon={ShoppingBag}
            color="bg-blue-600"
            trend={
              reportData.trends?.orders
                ? {
                    positive: reportData.trends.orders.positive,
                    value: `${reportData.trends.orders.value} ${
                      reportData.trends.orders.text || ""
                    }`,
                  }
                : null
            }
          />
          <StatCard
            title="Doanh thu"
            value={
              reportData.totalRevenue >= 1000000
                ? `${(reportData.totalRevenue / 1000000).toFixed(1)}M`
                : `${Math.round(reportData.totalRevenue / 1000)}K`
            }
            subtitle="VNĐ"
            icon={DollarSign}
            color="bg-green-600"
            trend={
              reportData.trends?.revenue
                ? {
                    positive: reportData.trends.revenue.positive,
                    value: `${reportData.trends.revenue.value} ${
                      reportData.trends.revenue.text || ""
                    }`,
                  }
                : null
            }
          />
          <StatCard
            title="Giá trị TB/đơn"
            value={`${Math.round(reportData.avgOrderValue / 1000)}K`}
            subtitle="VNĐ"
            icon={TrendingUp}
            color="bg-purple-600"
            trend={
              reportData.trends?.avgValue
                ? {
                    positive: reportData.trends.avgValue.positive,
                    value: `${reportData.trends.avgValue.value} ${
                      reportData.trends.avgValue.text || ""
                    }`,
                  }
                : null
            }
          />
          <StatCard
            title="Tỷ lệ hoàn thành"
            value={`${reportData.completionRate || completionRate}%`}
            subtitle={`${reportData.completedOrders}/${reportData.totalOrders} đơn`}
            icon={CheckCircle}
            color="bg-emerald-600"
            trend={
              reportData.trends?.completion
                ? {
                    positive: reportData.trends.completion.positive,
                    value: `${reportData.trends.completion.value} ${
                      reportData.trends.completion.text || ""
                    }`,
                  }
                : null
            }
          />
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-18 font-semibold text-gray-900">Trạng thái </h3>
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-md text-gray-900">Hoàn thành</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {reportData.completedOrders}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-md text-gray-900">Đang xử lý</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {reportData.processingOrders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-md text-gray-900">Đang giao</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {reportData.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-medium text-md text-gray-900">Đã hủy</span>
                </div>
                <span className="text-lg font-bold text-red-600">{reportData.cancelledOrders}</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-18 font-semibold text-gray-900">Đơn hàng gần đây</h3>
              <span className="text-md text-gray-500">
                {reportData.recentOrders?.length || 0} đơn
              </span>
            </div>
            <div className="overflow-x-auto">
              {reportData.recentOrders && reportData.recentOrders.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-md font-semibold text-gray-700">
                        Mã đơn
                      </th>
                      <th className="text-left py-3 px-4 text-md font-semibold text-gray-700">
                        Thời gian
                      </th>
                      <th className="text-left py-3 px-4 text-md font-semibold text-gray-700">
                        Số món
                      </th>
                      <th className="text-left py-3 px-4 text-md font-semibold text-gray-700">
                        Tổng tiền
                      </th>
                      <th className="text-left py-3 px-4 text-md font-semibold text-gray-700">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.recentOrders.map((order, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-md font-medium text-blue-600">{order.id}</td>
                        <td className="py-3 px-4 text-md text-gray-600">{order.time}</td>
                        <td className="py-3 px-4 text-md text-gray-600">{order.items} món</td>
                        <td className="py-3 px-4 text-md font-semibold text-gray-900">
                          {(order.total || 0).toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-md">Chưa có đơn hàng trong khoảng thời gian này</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Dishes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-18 font-semibold text-gray-900">Món bán chạy nhất</h3>
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            {reportData.topDishes && reportData.topDishes.length > 0 ? (
              <div className="space-y-3">
                {reportData.topDishes.map((dish, index) => {
                  const maxRevenue = Math.max(
                    ...reportData.topDishes.map((d) => d.revenue || 0),
                    1
                  );
                  const percentage = ((dish.revenue || 0) / maxRevenue) * 100;
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center flex-1">
                          <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg text-sx font-bold mr-3 shadow-sm">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-md text-gray-900 group-hover:text-blue-600 transition-colors">
                              {dish.name}
                            </p>
                            <p className="text-md text-gray-500">{dish.quantity} phần</p>
                          </div>
                        </div>
                        <span className="font-bold text-md text-gray-900 ml-4">
                          {((dish.revenue || 0) / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-md">Chưa có dữ liệu món bán chạy</p>
              </div>
            )}
          </div>

          {/* Hourly Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-18 font-semibold text-gray-900">Thống kê theo giờ</h3>
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            {reportData.hourlyStats && reportData.hourlyStats.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {reportData.hourlyStats.map((stat, index) => {
                  const maxOrders = Math.max(
                    ...reportData.hourlyStats.map((s) => s.orders || 0),
                    1
                  );
                  const percentage = ((stat.orders || 0) / maxOrders) * 100;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                      <div className="flex items-center flex-1">
                        <span className="font-semibold text-md text-gray-900 w-16">
                          {stat.hour}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-md text-gray-600 font-medium">{stat.orders} đơn</span>
                        <span className="font-bold text-md text-gray-900 min-w-[70px] text-right">
                          {((stat.revenue || 0) / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-md">Chưa có dữ liệu thống kê theo giờ</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-md font-medium text-blue-900 mb-1">Thông tin báo cáo</p>
            <p className="text-md text-blue-700">
              Dữ liệu được tính toán từ các đơn hàng thực tế trong hệ thống. Các chỉ số so sánh (%)
              được tính dựa trên cùng kỳ trước đó. Doanh thu chỉ tính từ đơn hàng đã hoàn thành.
              {reportData.period && (
                <span className="block mt-1">
                  Khoảng thời gian: {reportData.period.start} - {reportData.period.end}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReports;
