import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Pagination } from "antd";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
import { useOptimizedOrders } from "../../hooks/useOptimizedOrders";
import { useStaffOrderWebSocket } from "../../hooks/useStaffOrderWebSocket";
import StaffOrderDetailModal from "./modal/StaffOrderDetailModal";
import OrderActionButtons from "./util/OrderActionButtons";
import CancelOrderModal from "./modal/CancelOrderModal";
import PhoneConfirmModal from "./modal/PhoneConfirmModal";
import DeliveryConfirmModal from "./modal/DeliveryConfirmModal";
import CompleteDeliveryModal from "./modal/CompleteDeliveryModal";
import WebSocketStatusIndicator from "../../components/WebSocketStatusIndicator";
import NotificationBell from "./util/NotificationBellAntd";
import OrderNotificationModal from "./modal/OrderNotificationModal";
import AudioPermissionButton from "./util/AudioPermissionButton";
import { useNotifications } from "./util/useNotifications";
import { FiUser, FiTruck, FiHome, FiDollarSign, FiPackage } from "react-icons/fi";
import { ORDER_STATUS, ORDER_STATUS_CONFIG } from "../../constants/orderConstants";
import {
  updateStaffOrderStatus,
  searchStaffOrderByCode,
} from "../../services/service/staffOrderService";

const StaffDashboard = () => {
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const { user: userFromRedux } = useSelector((state) => state.auth);

  // Sử dụng optimized orders hook
  const {
    selectedTab,
    setSelectedTab,
    orders: currentOrders,
    stats,
    loading,
    error: ordersError,
    lastUpdated,
    refreshData,
    updateOrderStatus: optimizedUpdateOrderStatus,
    connectionStatus,
    cacheInfo,
    webSocketConnected, // Add this to track WebSocket connection
  } = useOptimizedOrders("processing");

  // Sử dụng Staff Order WebSocket hook
  const {
    connected: wsConnected,
    connecting: wsConnecting,
    error: wsError,
    addMessageHandler,
    acknowledgeOrder,
    updateOrderStatus: wsUpdateOrderStatus,
    status: wsStatus,
  } = useStaffOrderWebSocket();

  // Sử dụng notification hook (phải khai báo trước khi sử dụng trong handlers)
  const {
    notifications: bellNotifications,
    unreadCount,
    isShaking,
    addNewOrderNotification,
    addOrderStatusNotification,
    markAsRead,
    stopShaking,
  } = useNotifications();

  // Xử lý đơn hàng mới từ WebSocket
  const handleNewOrder = useCallback(
    (orderData) => {
      // Tăng số lượng notification
      setNotifications((prev) => ({
        ...prev,
        newOrders: prev.newOrders + 1,
        messageCount: prev.messageCount + 1,
      }));

      // Thêm thông báo chuông
      addNewOrderNotification(orderData);

      // Làm mới dữ liệu để lấy đơn hàng mới
      refreshData();

      // Tự động xác nhận đã nhận được đơn hàng
      if (orderData.orderId) {
        acknowledgeOrder(orderData.orderId);
      }
    },
    [addNewOrderNotification, acknowledgeOrder, refreshData]
  );

  // Xử lý cập nhật trạng thái đơn hàng từ WebSocket
  const handleOrderStatusUpdate = useCallback(
    (updateData) => {
      // Tăng số lượng notification
      setNotifications((prev) => ({
        ...prev,
        statusUpdates: prev.statusUpdates + 1,
        messageCount: prev.messageCount + 1,
      }));

      // Thêm thông báo cập nhật trạng thái
      if (updateData.orderData && updateData.oldStatus && updateData.newStatus) {
        addOrderStatusNotification(
          updateData.orderData,
          updateData.oldStatus,
          updateData.newStatus
        );
      }

      // Làm mới dữ liệu để cập nhật UI
      refreshData();
    },
    [addOrderStatusNotification, refreshData]
  );

  // Xử lý pong response
  const handlePong = useCallback((pongData) => {
    console.log("Nhận pong từ server:", pongData);
  }, []);

  // Setup WebSocket handlers
  useEffect(() => {
    if (wsConnected) {
      // Đăng ký các message handlers
      const unsubscribeNewOrder = addMessageHandler("newOrder", handleNewOrder);
      const unsubscribeOrderUpdate = addMessageHandler(
        "orderStatusUpdate",
        handleOrderStatusUpdate
      );
      const unsubscribePong = addMessageHandler("pong", handlePong);
      // Cleanup khi component unmount hoặc websocket disconnect
      return () => {
        unsubscribeNewOrder();
        unsubscribeOrderUpdate();
        unsubscribePong();
      };
    }
  }, [wsConnected, handleNewOrder, handleOrderStatusUpdate, handlePong, addMessageHandler]);

  // Reset trang về 1 khi chuyển tab
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  // UI State
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // State cho phone confirmation modal
  const [phoneConfirmModal, setPhoneConfirmModal] = useState({
    show: false,
    orderCode: null,
    orderInfo: null,
  });

  // State cho cancel modal
  const [cancelModal, setCancelModal] = useState({
    show: false,
    orderId: null,
    orderCode: null,
  });
  const [phoneConfirmLoading, setPhoneConfirmLoading] = useState(false);

  // State cho delivery confirmation modal
  const [deliveryConfirmModal, setDeliveryConfirmModal] = useState({
    show: false,
    orderCode: null,
    orderInfo: null,
  });
  const [deliveryConfirmLoading, setDeliveryConfirmLoading] = useState(false);

  // State cho complete delivery confirmation modal
  const [completeDeliveryModal, setCompleteDeliveryModal] = useState({
    show: false,
    orderCode: null,
    orderInfo: null,
  });
  const [completeDeliveryLoading, setCompleteDeliveryLoading] = useState(false);

  // Real-time notification states
  const [notifications, setNotifications] = useState({
    newOrders: 0,
    statusUpdates: 0,
    messageCount: 0,
  });

  // State cho notification modal
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotificationOrder, setSelectedNotificationOrder] = useState(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // 5 đơn hàng mỗi trang

  // Helper function để lấy ID từ order
  const getOrderId = (order) => order.orderId || order.id;

  // Xử lý click vào chuông thông báo
  const handleBellClick = useCallback(() => {
    // Dừng shake animation khi user tương tác
    stopShaking();
  }, [stopShaking]);

  // Xử lý click vào notification trong dropdown
  const handleNotificationClick = useCallback(
    (notification) => {
      // Đánh dấu notification đã đọc
      markAsRead(notification.id);

      // Nếu là thông báo đơn hàng, hiển thị modal
      if (notification.orderData) {
        setSelectedNotificationOrder(notification.orderData);
        setShowNotificationModal(true);
      }
    },
    [markAsRead]
  );

  // Xử lý đánh dấu notification đã đọc
  const handleMarkAsRead = useCallback(
    (notificationId) => {
      markAsRead(notificationId);
    },
    [markAsRead]
  );

  // Xử lý đơn hàng từ notification modal
  const handleProcessOrderFromNotification = useCallback(
    (order) => {
      // Chuyển về tab processing để hiển thị đơn hàng
      setSelectedTab("processing");

      // Làm mới dữ liệu để đảm bảo có đơn hàng mới nhất
      refreshData();

      // Hiển thị thông báo
      toast.success(`Đã chuyển đến xử lý đơn hàng #${order.orderCode || order.id}`, {
        position: "top-right",
        autoClose: 3000,
      });
    },
    [setSelectedTab, refreshData]
  );

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

  // Hàm  xử lý click cancel
  const handleCancelOrderClick = (orderId) => {
    // Tìm thông tin đơn hàng
    const orderInfo = currentOrders.find((order) => getOrderId(order) === orderId);
    if (!orderInfo) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    // Lấy orderCode từ orderInfo
    const orderCode = orderInfo.orderCode || orderInfo.id;

    // Hiển thị modal với cả orderId và orderCode
    setCancelModal({
      show: true,
      orderId,
      orderCode,
    });
  };
  // Xử lý xác nhận đơn hàng (PROCESSING -> CONFIRMED)
  const handleConfirmOrder = async (orderId) => {
    // Tìm thông tin đơn hàng
    const orderInfo = currentOrders.find((order) => getOrderId(order) === orderId);
    if (!orderInfo) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    // Lấy orderCode từ orderInfo
    const orderCode = orderInfo.orderCode || orderInfo.id;

    // Hiển thị modal xác nhận điện thoại
    setPhoneConfirmModal({
      show: true,
      orderCode,
      orderInfo,
    });
  };

  // Xử lý xác nhận qua điện thoại và tiến hành chế biến
  const handlePhoneConfirmAndProcess = async (staffNote = "") => {
    try {
      setPhoneConfirmLoading(true);

      const baseMessage = "Đã xác nhận!";
      const finalNote =
        typeof staffNote === "string" && staffNote.trim()
          ? `${baseMessage}. ${staffNote.trim()}`
          : baseMessage;

      // Sử dụng optimized update
      const result = await optimizedUpdateOrderStatus(
        phoneConfirmModal.orderCode,
        ORDER_STATUS.CONFIRMED,
        finalNote
      );

      if (result.success) {
        setPhoneConfirmModal({ show: false, orderCode: null, orderInfo: null });
        toast.success("Xác nhận thành công! Bắt đầu chế biến!");

        // Gửi thông báo qua WebSocket (nếu kết nối)
        if (wsConnected && phoneConfirmModal.orderInfo) {
          wsUpdateOrderStatus(
            phoneConfirmModal.orderInfo.id || phoneConfirmModal.orderInfo.orderId,
            phoneConfirmModal.orderCode,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PROCESSING
          );
        }
      } else {
        toast.error(result.message || "Không thể xác nhận đơn hàng");
        console.log("Failed to update order status:", result.message);
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      toast.error("Có lỗi xảy ra khi xác nhận đơn hàng");
    } finally {
      setPhoneConfirmLoading(false);
    }
  };

  // Xử lý đóng phone confirmation modal
  const handlePhoneConfirmModalClose = () => {
    if (phoneConfirmLoading) return;
    setPhoneConfirmModal({ show: false, orderCode: null, orderInfo: null });
  };

  // Xử lý hoàn thành chế biến và bắt đầu giao hàng (CONFIRMED -> DELIVERING)
  const handleStartDelivering = async (orderId) => {
    // Tìm thông tin đơn hàng
    const orderInfo = currentOrders.find((order) => getOrderId(order) === orderId);
    if (!orderInfo) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    // Lấy orderCode từ orderInfo
    const orderCode = orderInfo.orderCode || orderInfo.id;

    // Hiển thị modal xác nhận giao hàng
    setDeliveryConfirmModal({
      show: true,
      orderCode,
      orderInfo,
    });
  };

  // Xử lý xác nhận và bắt đầu giao hàng
  const handleDeliveryConfirmAndStart = async (staffNote = "") => {
    try {
      setDeliveryConfirmLoading(true);

      const baseMessage = "Món ăn đã được chế biến xong, bắt đầu giao hàng";
      const finalNote =
        typeof staffNote === "string" && staffNote.trim()
          ? `${baseMessage}. ${staffNote.trim()}`
          : baseMessage;

      // Sử dụng optimized update
      const result = await optimizedUpdateOrderStatus(
        deliveryConfirmModal.orderCode,
        ORDER_STATUS.DELIVERING,
        finalNote
      );

      if (result.success) {
        setDeliveryConfirmModal({ show: false, orderCode: null, orderInfo: null });
        toast.success("Đã bắt đầu giao hàng!");

        // Gửi thông báo qua WebSocket (nếu kết nối)
        if (wsConnected && deliveryConfirmModal.orderInfo) {
          wsUpdateOrderStatus(
            deliveryConfirmModal.orderInfo.id || deliveryConfirmModal.orderInfo.orderId,
            deliveryConfirmModal.orderCode,
            ORDER_STATUS.DELIVERING,
            ORDER_STATUS.CONFIRMED
          );
        }
      } else {
        toast.error(result.message || "Không thể cập nhật trạng thái");
        console.log("Failed to update order status:", result.message);
      }
    } catch (error) {
      console.error("Error starting delivery:", error);
      toast.error("Có lỗi xảy ra khi bắt đầu giao hàng");
    } finally {
      setDeliveryConfirmLoading(false);
    }
  };

  // Xử lý đóng delivery confirmation modal
  const handleDeliveryConfirmModalClose = () => {
    if (deliveryConfirmLoading) return;
    setDeliveryConfirmModal({ show: false, orderCode: null, orderInfo: null });
  };
  // Xử lý hoàn thành giao hàng (DELIVERING -> COMPLETED)
  const handleCompleteDelivery = async (orderId) => {
    // Tìm thông tin đơn hàng
    const orderInfo = currentOrders.find((order) => getOrderId(order) === orderId);
    if (!orderInfo) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    // Lấy orderCode từ orderInfo
    const orderCode = orderInfo.orderCode || orderInfo.id;

    // Hiển thị modal xác nhận hoàn tất giao hàng
    setCompleteDeliveryModal({
      show: true,
      orderCode,
      orderInfo,
    });
  };

  // Xử lý xác nhận và hoàn tất giao hàng
  const handleCompleteDeliveryConfirmAndFinish = async (staffNote = "") => {
    try {
      setCompleteDeliveryLoading(true);

      const baseMessage = "Đơn hàng đã được giao thành công";
      const finalNote =
        typeof staffNote === "string" && staffNote.trim()
          ? `${baseMessage}. ${staffNote.trim()}`
          : baseMessage;

      // Sử dụng optimized update
      const result = await optimizedUpdateOrderStatus(
        completeDeliveryModal.orderCode,
        ORDER_STATUS.COMPLETED,
        finalNote
      );

      if (result.success) {
        setCompleteDeliveryModal({ show: false, orderCode: null, orderInfo: null });
        toast.success("Đã hoàn tất giao hàng!");

        // Gửi thông báo qua WebSocket (nếu kết nối)
        if (wsConnected && completeDeliveryModal.orderInfo) {
          wsUpdateOrderStatus(
            completeDeliveryModal.orderInfo.id || completeDeliveryModal.orderInfo.orderId,
            completeDeliveryModal.orderCode,
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.DELIVERING
          );
        }
      } else {
        toast.error(result.message || "Không thể cập nhật trạng thái");
        console.log("Failed to update order status:", result.message);
      }
    } catch (error) {
      console.error("Error completing delivery:", error);
      toast.error("Có lỗi xảy ra khi hoàn tất giao hàng");
    } finally {
      setCompleteDeliveryLoading(false);
    }
  };

  // Thêm hàm xử lý đóng complete delivery modal
  // Xử lý đóng complete delivery confirmation modal
  const handleCompleteDeliveryModalClose = () => {
    if (completeDeliveryLoading) return;
    setCompleteDeliveryModal({ show: false, orderCode: null, orderInfo: null });
  };

  // Xử lý hiển thị chi tiết đơn hàng
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.warning("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    try {
      setCancelLoading(true);
      // Sử dụng orderCode thay vì orderId
      const result = await optimizedUpdateOrderStatus(
        cancelModal.orderCode, // Sử dụng orderCode
        ORDER_STATUS.CANCELLED,
        `Hủy bởi nhân viên: ${cancelReason}`
      );

      if (result.success) {
        setCancelModal({ show: false, orderId: null, orderCode: null });
        setCancelReason("");
        toast.success("Đã hủy đơn hàng thành công!");

        // Gửi thông báo qua WebSocket
        if (wsConnected) {
          const order = currentOrders.find((o) => getOrderId(o) === cancelModal.orderId);
          if (order) {
            wsUpdateOrderStatus(
              cancelModal.orderId,
              cancelModal.orderCode, // Sử dụng orderCode từ modal state
              ORDER_STATUS.CANCELLED,
              order.status
            );
          }
        }
      } else {
        toast.error(result.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng");
    } finally {
      setCancelLoading(false);
    }
  };

  // Xử lý đóng cancel modal
  const handleCancelModalClose = () => {
    if (cancelLoading) return;
    setCancelModal({ show: false, orderId: null, orderCode: null });
    setCancelReason("");
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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 tablet:mb-8">
          <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between">
            <div className="mb-4 tablet:mb-0">
              <h1 className="text-lg tablet:text-xl desktop:text-xl font-bold text-gray-900 mb-2">
                Bảng điều khiển
              </h1>
            </div>

            {/* Connection Status & Refresh Button */}
            <div className="flex items-center space-x-3">
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Cập nhật lúc: {lastUpdated.toLocaleTimeString("vi-VN")}
                </span>
              )}

              {/* Audio Permission Button */}
              <AudioPermissionButton />

              {/* Notification Bell */}
              <NotificationBell
                notifications={bellNotifications}
                isShaking={isShaking}
                onBellClick={handleBellClick}
                onNotificationClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
              />

              {/* WebSocket Status Indicators */}
              <WebSocketStatusIndicator
                connected={wsConnected}
                connecting={wsConnecting}
                error={wsError}
              />

              <button
                onClick={() => refreshData()}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{loading ? "Đang tải..." : "Làm mới"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Hiển thị tất cả trạng thái staff xử lý */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-5 gap-4 tablet:gap-6 mb-6 tablet:mb-8">
          <div
            className={`bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTab === "processing" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedTab("processing")}>
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-blue-100 desktop:p-1.5">
                <div className="w-4 h-4 tablet:w-5 tablet:h-5 desktop:w-4 desktop:h-4 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-3 tablet:ml-4 desktop:ml-3 min-w-0 flex-1">
                <p className="text-sm tablet:text-sm desktop:text-sm font-medium text-gray-600 whitespace-nowrap desktop:leading-tight">
                  Chờ xác nhận
                </p>
                <p className="text-md tablet:text-lg desktop:text-lg font-semibold text-gray-900">
                  {stats.processingOrders}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTab === "confirmed"
                ? "ring-2 ring-yellow-500 bg-yellow-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedTab("confirmed")}>
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-yellow-100 desktop:p-1.5">
                <div className="w-4 h-4 tablet:w-5 tablet:h-5 desktop:w-4 desktop:h-4 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-3 tablet:ml-4 desktop:ml-3 min-w-0 flex-1">
                <p className="text-sm tablet:text-sm desktop:text-sm font-medium text-gray-600 whitespace-nowrap desktop:leading-tight">
                  Đang chế biến
                </p>
                <p className="text-md tablet:text-lg desktop:text-lg font-semibold text-gray-900">
                  {stats.confirmedOrders}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTab === "delivering"
                ? "ring-2 ring-purple-500 bg-purple-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedTab("delivering")}>
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-purple-100 desktop:p-1.5">
                <div className="w-4 h-4 tablet:w-5 tablet:h-5 desktop:w-4 desktop:h-4 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-3 tablet:ml-4 desktop:ml-3 min-w-0 flex-1">
                <p className="text-sm tablet:text-sm desktop:text-sm font-medium text-gray-600 whitespace-nowrap desktop:leading-tight">
                  Đang giao hàng
                </p>
                <p className="text-md tablet:text-lg desktop:text-lg font-semibold text-gray-900">
                  {stats.deliveringOrders}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTab === "completed" ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedTab("completed")}>
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-green-100 desktop:p-1.5">
                <div className="w-4 h-4 tablet:w-5 tablet:h-5 desktop:w-4 desktop:h-4 bg-green-600 rounded"></div>
              </div>
              <div className="ml-3 tablet:ml-4 desktop:ml-3 min-w-0 flex-1">
                <p className="text-sm tablet:text-sm desktop:text-sm font-medium text-gray-600 whitespace-nowrap desktop:leading-tight">
                  Đã hoàn thành
                </p>
                <p className="text-md tablet:text-lg desktop:text-lg font-semibold text-gray-900">
                  {stats.completedOrders}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTab === "cancelled" ? "ring-2 ring-red-500 bg-red-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedTab("cancelled")}>
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-red-100 desktop:p-1.5">
                <div className="w-4 h-4 tablet:w-5 tablet:h-5 desktop:w-4 desktop:h-4 bg-red-600 rounded"></div>
              </div>
              <div className="ml-3 tablet:ml-4 desktop:ml-3 min-w-0 flex-1">
                <p className="text-sm tablet:text-sm desktop:text-sm font-medium text-gray-600 whitespace-nowrap desktop:leading-tight">
                  Đã hủy
                </p>
                <p className="text-md tablet:text-lg desktop:text-lg font-semibold text-gray-900">
                  {stats.cancelledOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow mb-4 tablet:mb-6 p-4 tablet:p-6">
          <div className="flex flex-col tablet:flex-row gap-3 tablet:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nhập mã đơn hàng để tìm kiếm..."
                className="w-full  tablet:px-4 py-2 tablet:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tablet:text-md desktop:text-md"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchOrder()}
              />
            </div>
            <button
              onClick={handleSearchOrder}
              disabled={searchLoading}
              className="px-4 tablet:px-6 py-2 tablet:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm tablet:text-md desktop:text-md font-medium">
              {searchLoading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
            {(searchCode || searchResult) && (
              <button
                onClick={clearSearch}
                className="px-4 tablet:px-6 py-2 tablet:py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm tablet:text-md desktop:text-md font-medium">
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {(searchResult || searchError) && (
          <div className="bg-white rounded-lg shadow mb-4 tablet:mb-6">
            <div className="px-4 tablet:px-6 py-3 tablet:py-4 border-b border-gray-200">
              <h3 className="text-md tablet:text-md desktop:text-lg font-semibold text-gray-900">
                Kết quả tìm kiếm
              </h3>
            </div>
            <div className="p-4 tablet:p-6">
              {searchResult ? (
                <div className="border rounded-lg p-3 tablet:p-4">
                  <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-start mb-3 tablet:mb-4">
                    <div className="mb-3 tablet:mb-0">
                      <h4 className="text-sm tablet:text-md desktop:text-md font-semibold text-gray-900 mb-2">
                        #{searchResult.orderCode || searchResult.id}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm tablet:text-sm desktop:text-md text-gray-600">
                          <span className="font-medium">Khách hàng:</span>{" "}
                          {searchResult.receiverName || "N/A"}
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-md text-gray-600">
                          <span className="font-medium">SĐT:</span>{" "}
                          {searchResult.receiverPhone || "N/A"}
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-md text-gray-600">
                          <span className="font-medium">Địa chỉ:</span>{" "}
                          {searchResult.deliveryAddress || "N/A"}
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-md text-gray-600">
                          <span className="font-medium">Tổng tiền:</span>{" "}
                          {searchResult.totalPrice?.toLocaleString() || 0} VNĐ
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-md text-gray-600">
                          <span className="font-medium">Thanh toán:</span>{" "}
                          {searchResult.paymentMethod || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row  tablet:flex-col tablet:items-end space-x-2 tablet:space-x-0 tablet:space-y-2">
                      {getStatusBadge(searchResult.status)}
                      <button
                        onClick={() => handleViewOrder(searchResult)}
                        className="text-blue-600 hover:text-blue-800 text-sm tablet:text-sm desktop:text-md font-medium">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  <OrderActionButtons
                    order={searchResult}
                    onConfirmOrder={handleConfirmOrder}
                    onStartDelivering={handleStartDelivering}
                    onCompleteDelivery={handleCompleteDelivery}
                    onCancelOrder={handleCancelOrderClick}
                    getOrderId={getOrderId}
                  />
                </div>
              ) : (
                searchCode.trim() && (
                  <div className="text-center py-6 tablet:py-8">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 tablet:w-16 tablet:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 tablet:mb-4">
                        <svg
                          className="w-6 h-6 tablet:w-8 tablet:h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-md tablet:text-md desktop:text-lg font-semibold text-gray-900 mb-2">
                        Không tìm thấy đơn hàng
                      </h4>
                      <p className="text-sm tablet:text-md desktop:text-md text-gray-600 mb-4">
                        Không tìm thấy đơn hàng với mã "<strong>{searchCode}</strong>"
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 tablet:p-4">
                        <p className="text-sm tablet:text-sm desktop:text-md text-blue-800">
                          <strong>Gợi ý:</strong> Kiểm tra lại mã đơn hàng hoặc thử tìm kiếm với từ
                          khóa khác.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation - Hiển thị tất cả trạng thái staff xử lý */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 tablet:space-x-8 px-4 tablet:px-6 min-w-max">
              {[
                { key: "processing", label: "Chờ xác nhận", color: "blue" },
                { key: "confirmed", label: "Đang chế biến", color: "yellow" },
                { key: "delivering", label: "Đang giao hàng", color: "purple" },
                { key: "completed", label: "Đã hoàn thành", color: "green" },
                { key: "cancelled", label: "Đã hủy", color: "red" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`py-3 tablet:py-4 px-1 tablet:px-2 border-b-2 font-medium text-sm tablet:text-sm desktop:text-md whitespace-nowrap ${
                    selectedTab === tab.key
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Orders List */}
          <div className="p-4 tablet:p-6 desktop:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-8 tablet:py-12">
                <div className="animate-spin rounded-full h-6 w-6 tablet:h-8 tablet:w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 text-sm tablet:text-md desktop:text-md">
                  Đang tải...
                </span>
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="text-center py-8 tablet:py-12">
                <p className="text-gray-500 text-sm tablet:text-md desktop:text-md">
                  Không có đơn hàng nào trong trạng thái này
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 tablet:space-y-5 desktop:space-y-6">
                  {(() => {
                    // Tính toán phân trang
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedOrders = currentOrders.slice(startIndex, endIndex);

                    return paginatedOrders.map((order, index) => (
                      <div
                        key={getOrderId(order)}
                        className={`border-2 rounded-xl p-4 tablet:p-5 desktop:p-6 transition-all duration-200 hover:shadow-md ${
                          index % 2 === 0
                            ? "border-blue-200 bg-[#c5c9ce4d] hover:bg-blue-50/50"
                            : "border-green-200 bg-green-50/30 hover:bg-green-50/50"
                        }`}>
                        <div className="flex flex-col laptop:flex-row laptop:justify-between laptop:items-start mb-3 tablet:mb-4">
                          <div className="flex-1 space-y-4">
                            {/* Header với mã đơn hàng và số món */}
                            <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-center">
                              <h4 className="font-bold text-gray-900 mb-2 tablet:mb-0 text-base tablet:text-lg desktop:text-xl">
                                #{order.orderCode || order.id}
                              </h4>
                              {order.items && order.items.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs tablet:text-sm font-bold bg-orange-100 text-orange-800 border-2 border-orange-300">
                                    <FiPackage size={14} className="mr-1" /> {order.items.length}{" "}
                                    món
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Grid layout cho thông tin chi tiết */}
                            <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4 tablet:gap-6">
                              {/* Cột trái - Thông tin khách hàng và địa chỉ */}
                              <div className="space-y-3">
                                <div className=" rounded-lg p-3 border border-gray-200">
                                  <h5 className="font-semibold text-gray-800 mb-2 text-sm tablet:text-md flex items-center">
                                    <FiUser size={16} className="mr-1 text-blue-600" /> Thông tin
                                    khách hàng
                                  </h5>
                                  <div className="space-y-1">
                                    <p className="text-sm tablet:text-md text-gray-700">
                                      <span className="font-medium">Tên:</span>{" "}
                                      <span className=" text-gray-700">
                                        {order.receiverName || "N/A"}
                                      </span>
                                    </p>
                                    <p className="text-sm tablet:text-md text-gray-700">
                                      <span className="font-medium">SĐT:</span>{" "}
                                      <span className=" text-gray-700">
                                        {order.receiverPhone || "N/A"}
                                      </span>
                                    </p>
                                    {order.receiverEmail && (
                                      <p className="text-sm tablet:text-md text-gray-700">
                                        <span className="font-medium">Email:</span>{" "}
                                        <span className="text-gray-700">{order.receiverEmail}</span>
                                      </p>
                                    )}
                                    <div className="flex items-center mb-2">
                                      {order.deliveryType === "DELIVERY" ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm md:text-md bg-purple-100 text-purple-800">
                                          <FiTruck size={14} className="m-1" /> Giao hàng tận nơi
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm md:text-md bg-green-100 text-green-800">
                                          <FiHome size={14} className="m-1" /> Đến lấy tại cửa hàng
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Cột phải - Thông tin món ăn và chi tiết đơn hàng */}
                              <div className="space-y-3">
                                {/* Thông tin thanh toán */}
                                <div className=" rounded-lg p-3 border border-gray-200">
                                  <h5 className="font-semibold text-gray-800 mb-2 text-sm tablet:text-md flex items-center">
                                    <FiDollarSign size={16} className="mr-1 text-blue-600" /> Thông
                                    tin thanh toán
                                  </h5>
                                  <div className="space-y-1">
                                    <p className="text-sm tablet:text-md">
                                      <span className="text-gray-600">Tổng tiền:</span>{" "}
                                      <span className=" text-md text-gray-700">
                                        {order.totalPrice?.toLocaleString() || 0} VNĐ
                                      </span>
                                    </p>
                                    <p className="text-sm tablet:text-md text-gray-700">
                                      <span className="font-medium">Phương thức:</span>{" "}
                                      {order.paymentMethod || "N/A"}
                                    </p>
                                    <div className="flex w-fix items-center space-x-2">
                                      <span className="text-sm tablet:text-mdmd text-gray-700">
                                        Trạng thái:
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                                          order.paymentStatus === "PAID"
                                            ? "bg-green-100 text-green-700 border border-green-300"
                                            : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                        }`}>
                                        {order.paymentStatus === "PAID" ? (
                                          <div className="m-1">Đã thanh toán</div>
                                        ) : (
                                          <div className="m-1">Chưa thanh toán</div>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status và Actions */}
                        <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-center space-y-2 tablet:space-y-0 tablet:space-x-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-[#DC2628] hover:text-blue-800 text-base font-medium underline">
                            Xem chi tiết
                          </button>
                          <OrderActionButtons
                            order={order}
                            onConfirmOrder={handleConfirmOrder}
                            onStartDelivering={handleStartDelivering}
                            onCompleteDelivery={handleCompleteDelivery}
                            onCancelOrder={handleCancelOrderClick}
                            getOrderId={getOrderId}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Pagination */}
                {currentOrders.length > pageSize && (
                  <div className="flex justify-center mt-6 tablet:mt-8">
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={currentOrders.length}
                      onChange={(page, size) => {
                        setCurrentPage(page);
                        if (size !== pageSize) {
                          setPageSize(size);
                          setCurrentPage(1); // Reset về trang đầu khi thay đổi pageSize
                        }
                      }}
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`}
                      pageSizeOptions={["5", "10", "20", "50"]}
                      size="default"
                      className="ant-pagination-custom"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        open={cancelModal.show}
        orderCode={cancelModal.orderCode}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleCancelOrder}
        onCancel={handleCancelModalClose}
        loading={cancelLoading}
      />

      {/* Phone Confirmation Modal */}
      <PhoneConfirmModal
        open={phoneConfirmModal.show}
        orderInfo={phoneConfirmModal.orderInfo}
        onConfirm={handlePhoneConfirmAndProcess}
        onCancel={handlePhoneConfirmModalClose}
        loading={phoneConfirmLoading}
      />

      {/* Delivery Confirmation Modal */}
      <DeliveryConfirmModal
        open={deliveryConfirmModal.show}
        orderInfo={deliveryConfirmModal.orderInfo}
        onConfirm={handleDeliveryConfirmAndStart}
        onCancel={handleDeliveryConfirmModalClose}
        loading={deliveryConfirmLoading}
      />

      {/* Complete Delivery Confirmation Modal */}
      <CompleteDeliveryModal
        open={completeDeliveryModal.show}
        orderInfo={completeDeliveryModal.orderInfo}
        onConfirm={handleCompleteDeliveryConfirmAndFinish}
        onCancel={handleCompleteDeliveryModalClose}
        loading={completeDeliveryLoading}
      />

      {/* Modal chi tiết đơn hàng */}
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

      {/* Notification Modal */}
      <OrderNotificationModal
        isOpen={showNotificationModal}
        order={selectedNotificationOrder}
        onClose={() => {
          setShowNotificationModal(false);
          setSelectedNotificationOrder(null);
        }}
        onProcessOrder={handleProcessOrderFromNotification}
      />
    </div>
  );
};

export default StaffDashboard;
