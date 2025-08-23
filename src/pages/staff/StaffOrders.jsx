import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
import { useStaffOrderWebSocket } from "../../hooks/useStaffOrderWebSocket";
import { PERMISSIONS } from "../../utils/roleConfig";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CONFIG,
} from "../../constants/orderConstants";
import OrderDetailModal from "../../components/OrderDetailModal";

const StaffOrders = () => {
  const { hasPermission } = usePermissions();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    completedOrders: 0,
  });
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

  // Sử dụng WebSocket hook
  const {
    connected: wsConnected,
    connecting: wsConnecting,
    error: wsError,
    addMessageHandler,
    removeHandlers,
    acknowledgeOrder,
    requestOrderDetails,
    updateOrderStatus,
    ping,
    status: wsStatus,
  } = useStaffOrderWebSocket();

  // Xử lý đơn hàng mới từ WebSocket
  const handleNewOrder = useCallback(
    (orderData) => {
      console.log("🆕 Nhận được đơn hàng mới:", orderData);

      // Hiển thị thông báo
      toast.info(`🛒 Đơn hàng mới: ${orderData.orderCode}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => {
          // Có thể mở modal chi tiết đơn hàng
          requestOrderDetails(orderData.orderId);
        },
      });

      // Cập nhật danh sách đơn hàng
      setOrders((prevOrders) => [orderData, ...prevOrders]);

      // Cập nhật thống kê
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pendingOrders: prev.pendingOrders + 1,
      }));

      // Tự động xác nhận đã nhận được đơn hàng
      acknowledgeOrder(orderData.orderId);
    },
    [requestOrderDetails, acknowledgeOrder]
  );

  // Xử lý cập nhật trạng thái đơn hàng từ WebSocket
  const handleOrderStatusUpdate = useCallback((updateData) => {
    console.log("📦 Cập nhật trạng thái đơn hàng:", updateData);

    // Hiển thị thông báo
    toast.info(
      `📦 ${updateData.orderCode}: ${updateData.previousStatus} → ${updateData.orderStatus}`,
      {
        position: "top-right",
        autoClose: 4000,
      }
    );

    // Cập nhật đơn hàng trong danh sách
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updateData.orderId
          ? { ...order, status: updateData.orderStatus, updatedAt: new Date() }
          : order
      )
    );

    // Cập nhật thống kê (tùy vào trạng thái)
    setStats((prev) => {
      const newStats = { ...prev };

      // Giảm số lượng trạng thái cũ
      if (updateData.previousStatus === ORDER_STATUS.PENDING) {
        newStats.pendingOrders = Math.max(0, prev.pendingOrders - 1);
      } else if (updateData.previousStatus === ORDER_STATUS.PREPARING) {
        newStats.preparingOrders = Math.max(0, prev.preparingOrders - 1);
      }

      // Tăng số lượng trạng thái mới
      if (updateData.orderStatus === ORDER_STATUS.PENDING) {
        newStats.pendingOrders = prev.pendingOrders + 1;
      } else if (updateData.orderStatus === ORDER_STATUS.PREPARING) {
        newStats.preparingOrders = prev.preparingOrders + 1;
      } else if (updateData.orderStatus === ORDER_STATUS.DELIVERED) {
        newStats.completedOrders = prev.completedOrders + 1;
      }

      return newStats;
    });
  }, []);

  // Xử lý cập nhật thống kê từ WebSocket
  const handleStatsUpdate = useCallback((statsData) => {
    console.log("📊 Cập nhật thống kê:", statsData);
    if (statsData && typeof statsData === "object") {
      setStats((prevStats) => ({ ...prevStats, ...statsData }));
    }
  }, []);

  // Xử lý chi tiết đơn hàng từ WebSocket
  const handleOrderDetails = useCallback((detailsData) => {
    console.log("📋 Nhận chi tiết đơn hàng:", detailsData);
    // Có thể mở modal chi tiết hoặc cập nhật state
  }, []);

  // Setup WebSocket handlers
  useEffect(() => {
    if (wsConnected) {
      console.log("🔗 Đã kết nối WebSocket, đăng ký handlers");

      // Đăng ký các message handlers
      const unsubscribeNewOrder = addMessageHandler("newOrder", handleNewOrder);
      const unsubscribeOrderUpdate = addMessageHandler(
        "orderStatusUpdate",
        handleOrderStatusUpdate
      );
      const unsubscribeStats = addMessageHandler("statsUpdate", handleStatsUpdate);
      const unsubscribeDetails = addMessageHandler("orderDetails", handleOrderDetails);

      // Cleanup khi component unmount hoặc websocket disconnect
      return () => {
        unsubscribeNewOrder();
        unsubscribeOrderUpdate();
        unsubscribeStats();
        unsubscribeDetails();
      };
    }
  }, [
    wsConnected,
    handleNewOrder,
    handleOrderStatusUpdate,
    handleStatsUpdate,
    handleOrderDetails,
    addMessageHandler,
  ]);

  useEffect(() => {
    if (hasPermission(PERMISSIONS.VIEW_ORDERS)) {
      fetchOrders();
    } else {
      setError("Bạn không có quyền xem danh sách đơn hàng");
      setLoading(false);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Giả định có API getAllOrders cho staff
      // const response = await getAllOrdersForStaff();
      // Tạm thời dùng dữ liệu mẫu để test WebSocket
      const sampleOrders = [
        {
          id: 1,
          orderCode: "ORD001",
          receiverName: "Nguyễn Văn A",
          receiverPhone: "0123456789",
          totalPrice: 250000,
          status: ORDER_STATUS.PENDING,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          orderCode: "ORD002",
          receiverName: "Trần Thị B",
          receiverPhone: "0987654321",
          totalPrice: 350000,
          status: ORDER_STATUS.PREPARING,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 giờ trước
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      setOrders(sampleOrders);

      // Cập nhật thống kê ban đầu
      setStats({
        totalOrders: sampleOrders.length,
        pendingOrders: sampleOrders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
        preparingOrders: sampleOrders.filter((o) => o.status === ORDER_STATUS.PREPARING).length,
        completedOrders: sampleOrders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length,
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Có lỗi xảy ra khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
    // Yêu cầu chi tiết đơn hàng qua WebSocket
    requestOrderDetails(order.id);
  };

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId, orderCode, newStatus) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;

    const previousStatus = currentOrder.status;

    // Cập nhật qua WebSocket
    const success = updateOrderStatus(orderId, orderCode, newStatus, previousStatus);

    if (success) {
      toast.success(`✅ Đã cập nhật trạng thái đơn hàng ${orderCode}`);
    } else {
      toast.error("❌ Không thể cập nhật trạng thái đơn hàng");
    }
  };

  // Hàm test ping WebSocket
  const handlePing = () => {
    const success = ping();
    if (success) {
      toast.info("🏓 Đã gửi ping để kiểm tra kết nối");
    } else {
      toast.error("❌ Không thể ping - WebSocket chưa kết nối");
    }
  };

  const getStatusBadge = (status) => {
    const config = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
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
      matchesDate = orderDate >= fromDate && orderDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (!hasPermission(PERMISSIONS.VIEW_ORDERS)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-base text-gray-600">Bạn không có quyền xem danh sách đơn hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
              <p className="text-base text-gray-600">Theo dõi và xử lý đơn hàng real-time</p>
            </div>

            {/* WebSocket Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    wsConnected
                      ? "bg-green-500 animate-pulse"
                      : wsConnecting
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                  }`}></div>
                <span className="text-sm text-gray-600">
                  {wsConnected ? "Đã kết nối" : wsConnecting ? "Đang kết nối..." : "Mất kết nối"}
                </span>
              </div>

              {/* Ping button */}
              {wsConnected && (
                <button
                  onClick={handlePing}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
                  🏓 Ping
                </button>
              )}
            </div>
          </div>

          {/* WebSocket Error */}
          {wsError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">⚠️ Lỗi WebSocket: {wsError}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">📝</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">⏳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">👨‍🍳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đang chuẩn bị</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.preparingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Mã đơn, tên khách hàng, SĐT..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
                <option value="ALL">Tất cả trạng thái</option>
                <option value={ORDER_STATUS.PENDING}>Chờ xác nhận</option>
                <option value={ORDER_STATUS.CONFIRMED}>Đã xác nhận</option>
                <option value={ORDER_STATUS.PREPARING}>Đang chuẩn bị</option>
                <option value={ORDER_STATUS.SHIPPING}>Đang giao hàng</option>
                <option value={ORDER_STATUS.DELIVERED}>Đã giao hàng</option>
                <option value={ORDER_STATUS.CANCELLED}>Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                value={dateFilter.from}
                onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                value={dateFilter.to}
                onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách đơn hàng ({filteredOrders.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 text-base">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 m-6">
              <p className="text-red-800 text-base">{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">#{order.orderCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.receiverName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.receiverPhone || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.totalPrice?.toLocaleString()} VNĐ
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-900 font-medium">
                            Xem chi tiết
                          </button>

                          {/* Update Status Buttons */}
                          {order.status === ORDER_STATUS.PENDING && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  order.orderCode,
                                  ORDER_STATUS.PREPARING
                                )
                              }
                              className="text-green-600 hover:text-green-900 font-medium">
                              Xác nhận
                            </button>
                          )}

                          {order.status === ORDER_STATUS.PREPARING && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  order.orderCode,
                                  ORDER_STATUS.DELIVERED
                                )
                              }
                              className="text-purple-600 hover:text-purple-900 font-medium">
                              Hoàn thành
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
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

export default StaffOrders;
