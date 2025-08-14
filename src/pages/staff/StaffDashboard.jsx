import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
import { PERMISSIONS, ROLES } from "../../utils/roleConfig";
import OrderDetailModal from "../../components/OrderDetailModal";
import OrderActionButtons from "./util/OrderActionButtons";
import CancelOrderModal from "./util/CancelOrderModal";
import PhoneConfirmModal from "./util/PhoneConfirmModal";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CONFIG,
} from "../../constants/orderConstants";
import {
  getAllStaffOrders,
  updateStaffOrderStatus,
  searchStaffOrderByCode,
} from "../../services/service/staffOrderService";

const StaffDashboard = () => {
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const { user: userFromRedux } = useSelector((state) => state.auth);

  const [selectedTab, setSelectedTab] = useState("processing");
  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // State cho phone confirmation modal
  const [phoneConfirmModal, setPhoneConfirmModal] = useState({
    show: false,
    orderId: null,
    orderInfo: null,
  });
  const [phoneConfirmLoading, setPhoneConfirmLoading] = useState(false);

  // State cho orders theo trạng thái (chỉ các trạng thái staff xử lý)
  const [processingOrders, setProcessingOrders] = useState([]); // PROCESSING - chờ xác nhận
  const [confirmedOrders, setConfirmedOrders] = useState([]); // CONFIRMED - đang chế biến
  const [deliveringOrders, setDeliveringOrders] = useState([]); // DELIVERING - đang giao hàng
  const [completedOrders, setCompletedOrders] = useState([]); // COMPLETED - đã hoàn thành
  const [cancelledOrders, setCancelledOrders] = useState([]); // CANCELLED - đã hủy

  const [stats, setStats] = useState({
    todayOrders: 0,
    processingOrders: 0,
    confirmedOrders: 0,
    deliveringOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  // Helper function để lấy ID từ order
  const getOrderId = (order) => order.orderId || order.id;

  // Fetch orders theo từng trạng thái (chỉ các trạng thái staff xử lý)
  const fetchOrdersByStatus = async (status) => {
    try {
      setLoading(true);
      setError(null);
      // Sử dụng API getAllStaffOrders để lấy tất cả đơn hàng mà staff có thể xử lý
      const result = await getAllStaffOrders(0, 100);

      if (result.success) {
        const allOrders = result.data || [];
        if (allOrders.length === 0) {
          console.log("No orders returned from API");
        } else {
          // Log tất cả trạng thái có trong data
          const statusCounts = {};
          allOrders.forEach((order) => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
          });
        }

        // Filter theo từng trạng thái
        const filteredOrders = allOrders.filter((order) => {
          const matches = order.status === status;
          return matches;
        });

        if (status === ORDER_STATUS.PROCESSING) setProcessingOrders(filteredOrders);
        else if (status === ORDER_STATUS.CONFIRMED) setConfirmedOrders(filteredOrders);
        else if (status === ORDER_STATUS.DELIVERING) setDeliveringOrders(filteredOrders);
        else if (status === ORDER_STATUS.COMPLETED) setCompletedOrders(filteredOrders);
        else if (status === ORDER_STATUS.CANCELLED) setCancelledOrders(filteredOrders);
      } else {
        console.error("API call failed:", result);
        setError(
          result.message ||
            `Không thể tải danh sách đơn hàng ${ORDER_STATUS_LABELS[status] || status}`
        );
      }
    } catch (err) {
      console.error(`Error fetching ${status} orders:`, err);
      setError(`Có lỗi xảy ra khi tải dữ liệu đơn hàng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Lấy orders theo tab hiện tại (chỉ các trạng thái staff xử lý)
  const getCurrentOrders = () => {
    switch (selectedTab) {
      case "processing":
        return processingOrders;
      case "confirmed":
        return confirmedOrders;
      case "delivering":
        return deliveringOrders;
      case "completed":
        return completedOrders;
      case "cancelled":
        return cancelledOrders;
      default:
        return [];
    }
  };

  const fetchAllOrdersData = async () => {
    try {
      setLoading(true);
      // Fetch tất cả trạng thái mà staff xử lý (bao gồm cả CANCELLED)
      await Promise.all([
        fetchOrdersByStatus(ORDER_STATUS.PROCESSING),
        fetchOrdersByStatus(ORDER_STATUS.CONFIRMED),
        fetchOrdersByStatus(ORDER_STATUS.DELIVERING),
        fetchOrdersByStatus(ORDER_STATUS.COMPLETED),
        fetchOrdersByStatus(ORDER_STATUS.CANCELLED),
      ]);
    } catch (error) {
      console.error("Error fetching orders data:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // useEffect để fetch dữ liệu khi component mount hoặc tab thay đổi
  useEffect(() => {
    if (hasPermission(PERMISSIONS.VIEW_ORDERS)) {
      // Load dữ liệu cho tab hiện tại (chỉ các trạng thái staff xử lý)
      const statusMap = {
        processing: ORDER_STATUS.PROCESSING,
        confirmed: ORDER_STATUS.CONFIRMED,
        delivering: ORDER_STATUS.DELIVERING,
        completed: ORDER_STATUS.COMPLETED,
      };

      if (statusMap[selectedTab]) {
        fetchOrdersByStatus(statusMap[selectedTab]);
      }
    }
  }, [selectedTab]);

  // Load tất cả dữ liệu lần đầu
  useEffect(() => {
    if (hasPermission(PERMISSIONS.VIEW_ORDERS)) {
      fetchAllOrdersData();
    } else {
      console.log("User does not have permission to view orders");
      setError("Bạn không có quyền xem danh sách đơn hàng");
      setLoading(false);
    }
  }, []);

  // Update stats khi có thay đổi orders (bao gồm cả cancelled orders)
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      processingOrders: processingOrders.length,
      confirmedOrders: confirmedOrders.length,
      deliveringOrders: deliveringOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
    }));
  }, [processingOrders, confirmedOrders, deliveringOrders, completedOrders, cancelledOrders]);

  const filteredOrders = getCurrentOrders();

  // Xử lý tìm kiếm đơn hàng theo mã
  const handleSearchOrder = async () => {
    if (!searchCode.trim()) {
      toast.warning("Vui lòng nhập mã đơn hàng");
      return;
    }

    try {
      setSearchLoading(true);
      const result = await searchStaffOrderByCode(searchCode.trim());

      if (result.success && result.data) {
        setSearchResult(result.data);
        setError(null);
      } else {
        setSearchResult(null);
        setError(result.message || "Không tìm thấy đơn hàng");
      }
    } catch (error) {
      console.error("Error searching order:", error);
      setSearchResult(null);
      setError("Có lỗi xảy ra khi tìm kiếm đơn hàng");
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchCode("");
    setSearchResult(null);
    setError(null);
  };

  // Xử lý xác nhận đơn hàng (PROCESSING -> CONFIRMED)
  const handleConfirmOrder = async (orderId) => {
    // Tìm thông tin đơn hàng
    const orderInfo = processingOrders.find((order) => getOrderId(order) === orderId);
    if (!orderInfo) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    // Hiển thị modal xác nhận điện thoại
    setPhoneConfirmModal({
      show: true,
      orderId,
      orderInfo,
    });
  };

  // Xử lý xác nhận qua điện thoại và tiến hành chế biến
  const handlePhoneConfirmAndProcess = async (staffNote = "") => {
    try {
      setPhoneConfirmLoading(true);

      // Tạo ghi chú gửi lên BE
      const baseMessage = "Đã xác nhận qua điện thoại!";
      const finalNote = staffNote.trim() ? `${baseMessage}. ${staffNote.trim()}` : baseMessage;

      const result = await updateStaffOrderStatus(
        phoneConfirmModal.orderId,
        ORDER_STATUS.CONFIRMED,
        finalNote
      );

      if (result.success) {
        // Di chuyển order từ processing sang confirmed
        const orderToMove = processingOrders.find(
          (order) => getOrderId(order) === phoneConfirmModal.orderId
        );
        if (orderToMove) {
          const updatedOrder = {
            ...orderToMove,
            status: ORDER_STATUS.CONFIRMED,
            staffNote: finalNote,
          };
          setProcessingOrders((prev) =>
            prev.filter((order) => getOrderId(order) !== phoneConfirmModal.orderId)
          );
          setConfirmedOrders((prev) => [...prev, updatedOrder]);
        }

        setPhoneConfirmModal({ show: false, orderId: null, orderInfo: null });
        toast.success("Đã xác nhận đơn hàng qua điện thoại và bắt đầu chế biến!");
      } else {
        toast.error(result.message || "Không thể xác nhận đơn hàng");
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
    setPhoneConfirmModal({ show: false, orderId: null, orderInfo: null });
  };

  // Xử lý hoàn thành chế biến và bắt đầu giao hàng (CONFIRMED -> DELIVERING)
  const handleStartDelivering = async (orderId) => {
    try {
      const result = await updateStaffOrderStatus(
        orderId,
        ORDER_STATUS.DELIVERING,
        "Món ăn đã được chế biến xong, bắt đầu giao hàng"
      );

      if (result.success) {
        // Di chuyển order từ confirmed sang delivering
        const orderToMove = confirmedOrders.find((order) => getOrderId(order) === orderId);
        if (orderToMove) {
          const updatedOrder = { ...orderToMove, status: ORDER_STATUS.DELIVERING };
          setConfirmedOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));
          setDeliveringOrders((prev) => [...prev, updatedOrder]);
        }

        toast.success("Đã bắt đầu giao hàng!");
      } else {
        toast.error(result.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error starting delivery:", error);
      toast.error("Có lỗi xảy ra khi bắt đầu giao hàng");
    }
  };

  // Xử lý hoàn thành giao hàng (DELIVERING -> COMPLETED)
  const handleCompleteDelivery = async (orderId) => {
    try {
      const result = await updateStaffOrderStatus(
        orderId,
        ORDER_STATUS.COMPLETED,
        "Đơn hàng đã được giao thành công"
      );

      if (result.success) {
        // Di chuyển order từ delivering sang completed
        const orderToMove = deliveringOrders.find((order) => getOrderId(order) === orderId);
        if (orderToMove) {
          const updatedOrder = { ...orderToMove, status: ORDER_STATUS.COMPLETED };
          setDeliveringOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));
          setCompletedOrders((prev) => [...prev, updatedOrder]);
        }

        toast.success("Đã hoàn thành giao hàng!");
      } else {
        toast.error(result.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error completing delivery:", error);
      toast.error("Có lỗi xảy ra khi hoàn thành giao hàng");
    }
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
      const result = await updateStaffOrderStatus(
        cancelModal.orderId,
        ORDER_STATUS.CANCELLED,
        `Hủy bởi nhân viên: ${cancelReason}`
      );

      if (result.success) {
        // Tìm order được hủy và thêm vào cancelledOrders
        const orderId = cancelModal.orderId;
        let cancelledOrder = null;

        // Tìm order trong các trạng thái hiện tại
        cancelledOrder =
          processingOrders.find((order) => getOrderId(order) === orderId) ||
          confirmedOrders.find((order) => getOrderId(order) === orderId) ||
          deliveringOrders.find((order) => getOrderId(order) === orderId);

        if (cancelledOrder) {
          // Cập nhật trạng thái order và thêm vào cancelledOrders
          const updatedCancelledOrder = {
            ...cancelledOrder,
            status: ORDER_STATUS.CANCELLED,
            staffNote: `Hủy bởi nhân viên: ${cancelReason}`,
          };
          setCancelledOrders((prev) => [...prev, updatedCancelledOrder]);
        }

        // Xóa order khỏi tất cả các trạng thái có thể
        setProcessingOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));
        setConfirmedOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));
        setDeliveringOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));

        setCancelModal({ show: false, orderId: null });
        setCancelReason("");

        toast.success("Đã hủy đơn hàng thành công!");
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
    if (cancelLoading) return; // Không cho phép đóng khi đang loading
    setCancelModal({ show: false, orderId: null });
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
        <div className="mb-6 tablet:mb-8">
          <h1 className="text-lg tablet:text-xl desktop:text-xxl  font-bold text-gray-900 mb-2">
            Bảng điều khiển nhân viên
          </h1>
          <p className="text-sm tablet:text-md desktop:text-base text-gray-600">
            Quản lý và theo dõi đơn hàng, cập nhật trạng thái đơn hàng
          </p>
        </div>

        {/* Stats Cards - Hiển thị tất cả trạng thái staff xử lý */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-5 gap-4 tablet:gap-6 mb-6 tablet:mb-8">
          <div className="bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4">
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

          <div className="bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4">
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

          <div className="bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4">
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

          <div className="bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4">
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

          <div className="bg-white rounded-lg shadow p-4 tablet:p-6 desktop:p-4">
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
                className="w-full px-3 tablet:px-4 py-2 tablet:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tablet:text-md desktop:text-base"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchOrder()}
              />
            </div>
            <button
              onClick={handleSearchOrder}
              disabled={searchLoading}
              className="px-4 tablet:px-6 py-2 tablet:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm tablet:text-md desktop:text-base font-medium">
              {searchLoading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
            {(searchCode || searchResult) && (
              <button
                onClick={clearSearch}
                className="px-4 tablet:px-6 py-2 tablet:py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm tablet:text-md desktop:text-base font-medium">
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {(searchResult || error) && (
          <div className="bg-white rounded-lg shadow mb-4 tablet:mb-6">
            <div className="px-4 tablet:px-6 py-3 tablet:py-4 border-b border-gray-200">
              <h3 className="text-md tablet:text-base desktop:text-lg font-semibold text-gray-900">
                Kết quả tìm kiếm
              </h3>
            </div>
            <div className="p-4 tablet:p-6">
              {searchResult ? (
                <div className="border rounded-lg p-3 tablet:p-4">
                  <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-start mb-3 tablet:mb-4">
                    <div className="mb-3 tablet:mb-0">
                      <h4 className="text-sm tablet:text-md desktop:text-base font-semibold text-gray-900 mb-2">
                        #{searchResult.orderCode || searchResult.id}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                          <span className="font-medium">Khách hàng:</span>{" "}
                          {searchResult.receiverName || "N/A"}
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                          <span className="font-medium">SĐT:</span>{" "}
                          {searchResult.receiverPhone || "N/A"}
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                          <span className="font-medium">Địa chỉ:</span>{" "}
                          {searchResult.deliveryAddress || "N/A"}
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                          <span className="font-medium">Tổng tiền:</span>{" "}
                          {searchResult.totalPrice?.toLocaleString() || 0} VNĐ
                        </p>
                        <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                          <span className="font-medium">Thanh toán:</span>{" "}
                          {searchResult.paymentMethod || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row  tablet:flex-col tablet:items-end space-x-2 tablet:space-x-0 tablet:space-y-2">
                      {getStatusBadge(searchResult.status)}
                      <button
                        onClick={() => handleViewOrder(searchResult)}
                        className="text-blue-600 hover:text-blue-800 text-sm tablet:text-sm desktop:text-base font-medium">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  <OrderActionButtons
                    order={searchResult}
                    onConfirmOrder={handleConfirmOrder}
                    onStartDelivering={handleStartDelivering}
                    onCompleteDelivery={handleCompleteDelivery}
                    onCancelOrder={(orderId) => setCancelModal({ show: true, orderId })}
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
                      <h4 className="text-md tablet:text-base desktop:text-lg font-semibold text-gray-900 mb-2">
                        Không tìm thấy đơn hàng
                      </h4>
                      <p className="text-sm tablet:text-md desktop:text-base text-gray-600 mb-4">
                        Không tìm thấy đơn hàng với mã "<strong>{searchCode}</strong>"
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 tablet:p-4">
                        <p className="text-sm tablet:text-sm desktop:text-base text-blue-800">
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
                  className={`py-3 tablet:py-4 px-1 tablet:px-2 border-b-2 font-medium text-sm tablet:text-sm desktop:text-base whitespace-nowrap ${
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
                <span className="ml-2 text-gray-600 text-sm tablet:text-md desktop:text-base">
                  Đang tải...
                </span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 tablet:py-12">
                <p className="text-gray-500 text-sm tablet:text-md desktop:text-base">
                  Không có đơn hàng nào trong trạng thái này
                </p>
              </div>
            ) : (
              <div className="space-y-3 tablet:space-y-4 desktop:space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={getOrderId(order)}
                    className="border rounded-lg p-3 tablet:p-4 desktop:p-6 hover:bg-gray-50">
                    <div className="flex flex-col laptop:flex-row laptop:justify-between laptop:items-start mb-3 tablet:mb-4">
                      <div className="flex-1 grid grid-cols-1 laptop:grid-cols-2 gap-3 tablet:gap-4 desktop:gap-6">
                        {/* Cột trái - Thông tin khách hàng */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm tablet:text-sm desktop:text-base">
                            #{order.orderCode || order.id}
                          </h4>
                          <div className="space-y-1 tablet:space-y-2">
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                              <span className="font-medium">Khách hàng:</span>{" "}
                              {order.receiverName || "N/A"}
                            </p>
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                              <span className="font-medium">SĐT:</span>{" "}
                              {order.receiverPhone || "N/A"}
                            </p>
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                              <span className="font-medium">Địa chỉ:</span>{" "}
                              {order.deliveryAddress || "N/A"}
                            </p>
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                              <span className="font-medium">Loại giao hàng:</span>{" "}
                              {order.deliveryType || "DELIVERY"}
                            </p>
                            {order.items && (
                              <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                                <span className="font-medium">Số món:</span> {order.items.length}{" "}
                                món
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cột phải - Thông tin đơn hàng */}
                        <div>
                          <div className="space-y-1 tablet:space-y-2">
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-900 font-medium">
                              <span className="text-gray-600">Tổng tiền:</span>{" "}
                              {order.totalPrice?.toLocaleString() || 0} VNĐ
                            </p>
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                              <span className="font-medium">Thanh toán:</span>{" "}
                              {order.paymentMethod || "N/A"}
                            </p>
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                              <span className="font-medium">Trạng thái:</span>
                              <span
                                className={`ml-1 px-2 py-1 rounded-full text-sm tablet:text-sm desktop:text-md ${
                                  order.paymentStatus === "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}>
                                {order.paymentStatus === "PAID"
                                  ? "Đã thanh toán"
                                  : "Chưa thanh toán"}
                              </span>
                            </p>
                            <p className="text-sm tablet:text-sm desktop:text-base text-gray-600">
                              <span className="font-medium">Đặt lúc:</span>{" "}
                              {new Date(order.createdAt).toLocaleString("vi-VN")}
                            </p>

                            {order.staffNote && (
                              <p className="text-sm tablet:text-sm desktop:text-base text-blue-600">
                                <span className="font-medium">Ghi chú NV:</span> {order.staffNote}
                              </p>
                            )}
                            {order.internalNote && (
                              <p className="text-sm tablet:text-sm desktop:text-base text-purple-600">
                                <span className="font-medium">Ghi chú nội bộ:</span>{" "}
                                {order.internalNote}
                              </p>
                            )}
                          </div>

                          {/* Ước tính thời gian hoàn thành */}
                          <div className="mt-2 tablet:mt-3">
                            {order.status === ORDER_STATUS.PROCESSING && (
                              <div className="text-sm tablet:text-sm desktop:text-base bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                ⏱️ Chờ nhân viên xác nhận
                              </div>
                            )}
                            {order.status === ORDER_STATUS.CONFIRMED && (
                              <div className="text-sm tablet:text-sm desktop:text-base bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                                👨‍🍳 Đang chế biến
                              </div>
                            )}
                            {order.status === ORDER_STATUS.DELIVERING && (
                              <div className="text-sm tablet:text-sm desktop:text-base bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                🚚 Đang giao
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status và Actions */}
                    <div>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800 text-sm tablet:text-sm desktop:text-base whitespace-nowrap mb-4">
                        Xem chi tiết
                      </button>
                    </div>
                    <OrderActionButtons
                      order={order}
                      onConfirmOrder={handleConfirmOrder}
                      onStartDelivering={handleStartDelivering}
                      onCompleteDelivery={handleCompleteDelivery}
                      onCancelOrder={(orderId) => setCancelModal({ show: true, orderId })}
                      getOrderId={getOrderId}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        open={cancelModal.show}
        orderId={cancelModal.orderId}
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

      {/* Modal chi tiết đơn hàng */}
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

export default StaffDashboard;
