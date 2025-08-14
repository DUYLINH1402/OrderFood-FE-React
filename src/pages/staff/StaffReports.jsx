import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { staffOrderService } from "../../services/service/staffOrderService";

const StaffReports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState({
    orderStats: {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      pendingOrders: 0,
      revenue: 0,
    },
    dailyStats: [],
    topDishes: [],
    customerStats: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
    },
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Giả định có API lấy báo cáo
      // const response = await staffOrderService.getReports(dateRange);
      // if (response.success) {
      //   setReportData(response.data);
      // } else {
      //   toast.error("Không thể tải dữ liệu báo cáo");
      // }

      // Mock data cho demo
      setReportData({
        orderStats: {
          totalOrders: 247,
          completedOrders: 198,
          cancelledOrders: 15,
          pendingOrders: 34,
          revenue: 45780000,
        },
        dailyStats: [
          { date: "2025-08-01", orders: 12, revenue: 2340000 },
          { date: "2025-08-02", orders: 18, revenue: 3560000 },
          { date: "2025-08-03", orders: 15, revenue: 2890000 },
          { date: "2025-08-04", orders: 22, revenue: 4120000 },
          { date: "2025-08-05", orders: 19, revenue: 3780000 },
        ],
        topDishes: [
          { name: "Phở Bò Tái", quantity: 85, revenue: 8500000 },
          { name: "Bún Bò Huế", quantity: 72, revenue: 7200000 },
          { name: "Cơm Tấm Sườn", quantity: 68, revenue: 6800000 },
          { name: "Bánh Mì Thịt", quantity: 54, revenue: 2700000 },
          { name: "Chè Ba Màu", quantity: 43, revenue: 1720000 },
        ],
        customerStats: {
          totalCustomers: 156,
          newCustomers: 23,
          returningCustomers: 133,
        },
      });
    } catch (error) {
      console.error("Error loading report data:", error);
      toast.error("Có lỗi xảy ra khi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const exportReport = () => {
    // Giả định xuất báo cáo
    toast.success("Đang chuẩn bị file báo cáo...");
    // Logic xuất file Excel/PDF sẽ được implement sau
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Báo cáo thống kê</h1>
            <p className="text-base text-gray-600">
              Theo dõi hiệu suất và phân tích dữ liệu kinh doanh
            </p>
          </div>
          <button
            onClick={exportReport}
            className="mt-4 sm:mt-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-base">
            Xuất báo cáo
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Khoảng thời gian</h3>
          <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
            <button
              onClick={loadReportData}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base disabled:opacity-50">
              {loading ? "Đang tải..." : "Cập nhật"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("daily")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "daily"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                Theo ngày
              </button>
              <button
                onClick={() => setActiveTab("dishes")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dishes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                Món ăn
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-6">
              {/* Order Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Tổng đơn hàng</p>
                      <p className="text-2xl font-bold">{reportData.orderStats.totalOrders}</p>
                    </div>
                    <div className="text-blue-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Hoàn thành</p>
                      <p className="text-2xl font-bold">{reportData.orderStats.completedOrders}</p>
                    </div>
                    <div className="text-green-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Đã hủy</p>
                      <p className="text-2xl font-bold">{reportData.orderStats.cancelledOrders}</p>
                    </div>
                    <div className="text-red-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Doanh thu</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(reportData.orderStats.revenue)}
                      </p>
                    </div>
                    <div className="text-yellow-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.customerStats.totalCustomers}
                    </p>
                    <p className="text-base text-gray-600">Tổng khách hàng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.customerStats.newCustomers}
                    </p>
                    <p className="text-base text-gray-600">Khách hàng mới</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.customerStats.returningCustomers}
                    </p>
                    <p className="text-base text-gray-600">Khách hàng quay lại</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Stats Tab */}
          {activeTab === "daily" && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trung bình/đơn
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.dailyStats.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                          {formatDate(day.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                          {day.orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                          {formatCurrency(day.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                          {formatCurrency(day.revenue / day.orders)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Dishes Tab */}
          {activeTab === "dishes" && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Món ăn bán chạy nhất</h3>
              <div className="space-y-4">
                {reportData.topDishes.map((dish, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-base">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">{dish.name}</h4>
                        <p className="text-sm text-gray-500">Đã bán: {dish.quantity} phần</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-gray-900">
                        {formatCurrency(dish.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(dish.revenue / dish.quantity)}/phần
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-base font-medium text-gray-900">Đang tải dữ liệu...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReports;
