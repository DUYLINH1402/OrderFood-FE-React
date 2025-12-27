import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Pagination } from "antd";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
import { PERMISSIONS } from "../../utils/roleConfig";
import { ORDER_STATUS, ORDER_STATUS_CONFIG } from "../../constants/orderConstants";
import StaffOrderDetailModal from "../staff/modal/StaffOrderDetailModal";
import {
  FiUser,
  FiTruck,
  FiHome,
  FiDollarSign,
  FiPackage,
  FiSearch,
  FiBarChart,
  FiRefreshCw,
} from "react-icons/fi";
import {
  getAllStaffOrders,
  searchStaffOrderByCode,
} from "../../services/service/staffOrderService";
import SpinnerCube from "../../components/Skeleton/SpinnerCube";

const OrderStatistics = () => {
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const { user: userFromRedux } = useSelector((state) => state.auth);

  // Orders data state
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Statistics state
  const [stats, setStats] = useState({
    totalOrders: 0,
    processingOrders: 0,
    confirmedOrders: 0,
    deliveringOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  // UI State
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

  // Search states
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Helper function để lấy ID từ order
  const getOrderId = (order) => order.orderId || order.id;

  // Calculate statistics from orders
  const calculateStats = useCallback((orders) => {
    const stats = {
      totalOrders: orders.length,
      processingOrders: 0,
      confirmedOrders: 0,
      deliveringOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };

    orders.forEach((order) => {
      switch (order.status) {
        case ORDER_STATUS.PROCESSING:
          stats.processingOrders++;
          break;
        case ORDER_STATUS.CONFIRMED:
          stats.confirmedOrders++;
          break;
        case ORDER_STATUS.DELIVERING:
          stats.deliveringOrders++;
          break;
        case ORDER_STATUS.COMPLETED:
          stats.completedOrders++;
          break;
        case ORDER_STATUS.CANCELLED:
          stats.cancelledOrders++;
          break;
        default:
          break;
      }
    });

    return stats;
  }, []);

  // Load all staff orders
  const loadAllOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await getAllStaffOrders(0, 1000); // Load large number to get all orders

      if (response.success) {
        const orders = response.data.content || response.data || [];
        setAllOrders(orders);
        setStats(calculateStats(orders));
        setLastUpdated(new Date());
        console.log("Loaded orders:", orders);
      } else {
        setOrdersError(response.message || "Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrdersError("Có lỗi xảy ra khi tải danh sách đơn hàng");
    } finally {
      setOrdersLoading(false);
    }
  }, [calculateStats]);

  // Refresh data function
  const refreshData = useCallback(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  // Initial data load
  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  // Permission check
  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_ORDERS)) {
      setError("Bạn không có quyền xem thống kê đơn hàng");
    }
  }, [hasPermission]);

  // Reset trang về 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, dateFilter]);

  // Xử lý tìm kiếm đơn hàng theo mã
  const handleSearchOrder = useCallback(async () => {
    if (!searchCode.trim()) {
      setSearchError("Vui lòng nhập mã đơn hàng");
      return;
    }
    setSearchError(null);
    setSearchLoading(true);

    try {
      const response = await searchStaffOrderByCode(searchCode);
      if (response.success) {
        setSearchResult(response.data);
        toast.success("Tìm thấy đơn hàng!");
      } else {
        setSearchError("Không tìm thấy đơn hàng với mã này");
      }
    } catch (error) {
      console.error("Error searching order:", error);
      setSearchError("Có lỗi xảy ra khi tìm kiếm đơn hàng");
    } finally {
      setSearchLoading(false);
    }
  }, [searchCode]);

  // Clear search results
  const clearSearch = () => {
    setSearchCode("");
    setSearchResult(null);
    setSearchError(null);
  };

  // Filtered orders based on search term, status, and date
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.receiverPhone?.includes(searchTerm);

    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;

    let matchesDate = true;
    if (dateFilter.from && dateFilter.to) {
      const orderDate = new Date(order.createdAt);
      const fromDate = new Date(dateFilter.from);
      const toDate = new Date(dateFilter.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = orderDate >= fromDate && orderDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Order action handlers
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const getStatusBadge = (status) => {
    const config = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Calculate additional statistics
  const totalRevenue = filteredOrders
    .filter((order) => order.status === ORDER_STATUS.COMPLETED)
    .reduce((sum, order) => sum + (order.finalAmount || 0), 0);

  const avgOrderValue =
    filteredOrders.length > 0
      ? filteredOrders.reduce((sum, order) => sum + (order.finalAmount || 0), 0) /
        filteredOrders.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <FiBarChart className="w-6 h-6 mr-2 text-blue-600" />
                Thống kê đơn hàng
              </h1>
              <p className="text-base text-gray-600">Xem và phân tích dữ liệu đơn hàng</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Cập nhật lúc: {lastUpdated.toLocaleTimeString("vi-VN")}
                </span>
              )}

              <button
                onClick={() => refreshData()}
                disabled={ordersLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">
                <FiRefreshCw className={`w-6 h-6 ${ordersLoading ? "animate-spin" : ""}`} />
                <span>{ordersLoading ? "Đang tải..." : "Làm mới"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-blue-100">
                <FiPackage className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-yellow-100">
                <div className="w-5 h-5 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processingOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-orange-100">
                <div className="w-5 h-5 bg-orange-600 rounded"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Đang chế biến</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmedOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-purple-100">
                <FiTruck className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Đang giao hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveringOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-green-100">
                <div className="w-5 h-5 bg-green-600 rounded"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-indigo-100">
                <FiDollarSign className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Doanh thu</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalRevenue.toLocaleString()} VNĐ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Giá trị đơn hàng trung bình
            </h3>
            <p className="text-2xl font-bold text-blue-600">{avgOrderValue.toLocaleString()} VNĐ</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tỷ lệ hoàn thành</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalOrders > 0
                ? (((stats.completedOrders || 0) / stats.totalOrders) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đơn hàng bị hủy</h3>
            <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders || 0}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nhập mã đơn hàng để tìm kiếm..."
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchOrder()}
              />
            </div>
            <button
              onClick={handleSearchOrder}
              disabled={searchLoading}
              className="px-6 py-3 bg-blue-600 text-sm  text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium flex items-center space-x-2">
              <FiSearch className="w-6 h-6" />
              <span>{searchLoading ? "Đang tìm..." : "Tìm kiếm"}</span>
            </button>
            {(searchCode || searchResult) && (
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-gray-600 text-sm text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium">
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {(searchResult || searchError) && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Kết quả tìm kiếm</h3>
            </div>
            <div className="p-6">
              {searchResult ? (
                <div className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                    <div className="mb-3 lg:mb-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        #{searchResult.orderCode || searchResult.id}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Khách hàng:</span>{" "}
                            {searchResult.receiverName || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">SĐT:</span>{" "}
                            {searchResult.receiverPhone || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Địa chỉ:</span>{" "}
                            {searchResult.deliveryAddress || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Tổng tiền:</span>{" "}
                            {searchResult.finalAmount?.toLocaleString() || 0} VNĐ
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Thanh toán:</span>{" "}
                            {searchResult.paymentMethod || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="flex flex-col items-end space-y-2">
                      {getStatusBadge(searchResult.status)}
                      <button
                        onClick={() => handleViewOrder(searchResult)}
                        className="text-blue-600 hover:text-blue-800 font-medium">
                        Xem chi tiết
                      </button>
                    </span>
                  </div>
                </div>
              ) : (
                searchError && (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiSearch className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Không tìm thấy đơn hàng
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Không tìm thấy đơn hàng với mã "<strong>{searchCode}</strong>"
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Mã đơn, tên khách hàng, SĐT..."
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ALL">Tất cả trạng thái</option>
                <option value={ORDER_STATUS.PROCESSING}>Chờ xác nhận</option>
                <option value={ORDER_STATUS.CONFIRMED}>Đã xác nhận</option>
                <option value={ORDER_STATUS.DELIVERING}>Đang giao hàng</option>
                <option value={ORDER_STATUS.COMPLETED}>Đã hoàn thành</option>
                <option value={ORDER_STATUS.CANCELLED}>Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                className="w-full px-4 text-sm py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateFilter.from}
                onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateFilter.to}
                onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          {/* Filter Summary */}
          {(searchTerm || selectedStatus !== "ALL" || dateFilter.from || dateFilter.to) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Bộ lọc hiện tại:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Tìm kiếm: {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 text-blue-600 hover:text-blue-900">
                      ×
                    </button>
                  </span>
                )}
                {selectedStatus !== "ALL" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Trạng thái: {ORDER_STATUS_CONFIG[selectedStatus]?.label}
                    <button
                      onClick={() => setSelectedStatus("ALL")}
                      className="ml-1 text-green-600 hover:text-green-900">
                      ×
                    </button>
                  </span>
                )}
                {(dateFilter.from || dateFilter.to) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Ngày: {dateFilter.from} - {dateFilter.to}
                    <button
                      onClick={() => setDateFilter({ from: "", to: "" })}
                      className="ml-1 text-purple-600 hover:text-purple-900">
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("ALL");
                    setDateFilter({ from: "", to: "" });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline">
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách đơn hàng ({filteredOrders.length})
              </h3>
              <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} của{" "}
                {filteredOrders.length} đơn hàng
              </div>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                <SpinnerCube />
              </span>
            </div>
          ) : ordersError ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 m-6">
              <p className="text-red-800">{ordersError}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiPackage className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Không có đơn hàng</h4>
                <p className="text-gray-600">
                  {searchTerm || selectedStatus !== "ALL" || dateFilter.from || dateFilter.to
                    ? "Không tìm thấy đơn hàng phù hợp với bộ lọc"
                    : "Chưa có đơn hàng nào"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <div key={getOrderId(order)} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="lg:flex-row lg:items-center lg:justify-between">
                      {/* Order Info */}
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              #{order.orderCode || order.id}
                            </h4>
                            <div className="flex items-center space-x-4">
                              {getStatusBadge(order.status)}
                              {order.items && order.items.length > 0 && (
                                <span className="inline-flex text-sm items-center px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-800">
                                  <FiPackage className="w-6 h-6 mr-1" />
                                  {order.items.length} món
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {order.finalAmount?.toLocaleString() || 0} VNĐ
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Customer Info */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="font-medium text-sm text-gray-800 mb-2 flex items-center">
                              <FiUser className="w-6 h-6 mr-1 text-blue-600" />
                              Thông tin khách hàng
                            </h5>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Tên:</span>{" "}
                                {order.receiverName || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">SĐT:</span>{" "}
                                {order.receiverPhone || "N/A"}
                              </p>
                              {order.receiverEmail && (
                                <p>
                                  <span className="font-medium">Email:</span> {order.receiverEmail}
                                </p>
                              )}
                              <div className="flex items-center mt-2">
                                {order.deliveryType === "DELIVERY" ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                                    <FiTruck className="w-6 h-6 mr-1" />
                                    Giao hàng tận nơi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                    <FiHome className="w-6 h-6 mr-1" />
                                    Đến lấy tại cửa hàng
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                              <FiDollarSign className="w-6 h-6 mr-1 text-blue-600" />
                              Thông tin thanh toán
                            </h5>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Phương thức:</span>{" "}
                                {order.paymentMethod || "N/A"}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span>Trạng thái:</span>
                                <span
                                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                                    order.paymentStatus === "PAID"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}>
                                  {order.paymentStatus === "PAID"
                                    ? "Đã thanh toán"
                                    : "Chưa thanh toán"}
                                </span>
                              </div>
                              {order.deliveryType === "DELIVERY" && order.deliveryAddress && (
                                <p>
                                  <span className="font-medium">Địa chỉ:</span>{" "}
                                  {order.deliveryAddress}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions - Only View Details */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-4 py-2 bg-blue-600 text-sm text-white rounded-md hover:bg-blue-700 font-medium transition-colors">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filteredOrders.length > pageSize && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredOrders.length}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      if (size !== pageSize) {
                        setPageSize(size);
                        setCurrentPage(1);
                      }
                    }}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`}
                    pageSizeOptions={["5", "10", "20", "50"]}
                    size="default"
                    className="flex justify-center"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <StaffOrderDetailModal
          order={selectedOrder}
          isOpen={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderStatistics;
