import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faTruck,
  faReceipt,
  faEye,
  faPhone,
  faCalendarAlt,
  faMapMarkerAlt,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";
import OrderDetailModal from "../../components/OrderDetailModal";
import { getOrders, cancelOrder } from "../../services/service/orderService";
import {
  ORDER_STATUS,
  ORDER_STATUS_CONFIG,
  CANCELLABLE_STATUSES,
} from "../../constants/orderConstants";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch all orders from API only once
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOrders({
          page: 0,
          size: 100,
        });
        if (result.success) {
          setOrders(result.data || []);
        } else {
          console.log("API error:", result);
          setError(result.message || "Không thể tải danh sách đơn hàng");
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Có lỗi xảy ra khi tải danh sách đơn hàng");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    const cancelReason = prompt("Vui lòng nhập lý do hủy đơn hàng:");
    if (!cancelReason || !cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    setCancellingOrder(orderId);
    try {
      const result = await cancelOrder(orderId, cancelReason.trim());
      if (result.success) {
        // Refresh orders list
        const updatedOrders = orders.map((order) =>
          order.id === orderId || order.orderCode === orderId
            ? { ...order, status: ORDER_STATUS.CANCELLED, cancelReason: cancelReason.trim() }
            : order
        );
        setOrders(updatedOrders);
        alert("Đơn hàng đã được hủy thành công");
      } else {
        alert("Không thể hủy đơn hàng: " + result.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Có lỗi xảy ra khi hủy đơn hàng");
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusConfig = (status) => {
    const normalizedStatus = status ? status.toUpperCase() : ORDER_STATUS.PENDING;
    return ORDER_STATUS_CONFIG[normalizedStatus] || ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];
  };

  const getStatusIcon = (status) => {
    const config = getStatusConfig(status);
    const iconMap = {
      faClock: faClock,
      faCheckCircle: faCheckCircle,
      faTruck: faTruck,
      faTimesCircle: faTimesCircle,
    };
    return iconMap[config.icon] || faClock;
  };

  const filterOrders = (status) => {
    if (status === "all") return orders;
    return orders.filter((order) => order.status?.toUpperCase() === status.toUpperCase());
  };

  const canCancelOrder = (order) => {
    const status = order.status?.toUpperCase();
    return (
      CANCELLABLE_STATUSES.includes(status) &&
      status !== ORDER_STATUS.CANCELLED &&
      status !== ORDER_STATUS.DELIVERED
    );
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedOrder(null);
    setShowDetailModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const statusTabs = [
    { id: "all", label: "Tất cả", count: orders.length },
    {
      id: ORDER_STATUS.PENDING.toLowerCase(),
      label: "Chờ xác nhận",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.PENDING).length,
    },
    {
      id: ORDER_STATUS.CONFIRMED.toLowerCase(),
      label: "Đã xác nhận",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.CONFIRMED).length,
    },
    {
      id: ORDER_STATUS.PREPARING.toLowerCase(),
      label: "Đang chuẩn bị",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.PREPARING).length,
    },
    {
      id: ORDER_STATUS.SHIPPING.toLowerCase(),
      label: "Đang giao",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.SHIPPING).length,
    },
    {
      id: ORDER_STATUS.DELIVERED.toLowerCase(),
      label: "Đã giao",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.DELIVERED).length,
    },
    {
      id: ORDER_STATUS.CANCELLED.toLowerCase(),
      label: "Đã hủy",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.CANCELLED).length,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="transform scale-150">
          <LoadingIcon />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 mb-1">Đang tải đơn hàng...</p>
          <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-red-400 mb-4" />
        <div className="text-center">
          <p className="text-lg font-medium text-red-600 mb-1">Có lỗi xảy ra</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm tablet:text-md ${
              selectedStatus === tab.id
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white bg-opacity-20">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {filterOrders(selectedStatus).length === 0 ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faBox} className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có đơn hàng</h3>
            <p className="text-gray-500">
              {selectedStatus === "all"
                ? "Bạn chưa có đơn hàng nào"
                : `Không có đơn hàng ${statusTabs
                    .find((t) => t.id === selectedStatus)
                    ?.label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          filterOrders(selectedStatus).map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                {/* Order header */}
                <div className="p-4 tablet:p-6">
                  <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full ${statusConfig.bgColor} flex items-center justify-center`}>
                          <FontAwesomeIcon
                            icon={getStatusIcon(order.status)}
                            className={`w-5 h-5 ${statusConfig.color}`}
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-md tablet:text-base">
                          Đơn hàng #{order.orderCode || order.id}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                            <span>{formatDate(order.createdAt || order.date)}</span>
                          </div>
                          <div
                            className={`px-2.5 py-0.5 rounded-full font-semibold transition-all duration-200 
                              text-xs tablet:text-sm desktop:text-sm 
                              ${statusConfig.bgColor} ${statusConfig.color}
                              shadow-sm border border-opacity-20 border-gray-300
                              whitespace-nowrap
                            `}>
                            {statusConfig.label}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-base tablet:text-lg">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-sm text-gray-500">{order.items.length} món</p>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded
                      ? "max-h-[1000px] opacity-100 visible p-6 tablet:p-8"
                      : "max-h-0 opacity-0 invisible p-0"
                  } border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white`}
                  style={{ pointerEvents: isExpanded ? "auto" : "none" }}>
                  {isExpanded && (
                    <>
                      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
                        {/* Items */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faReceipt} className="w-5 h-5 text-green-500" />
                            Chi tiết đơn hàng
                          </h5>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900 text-base">{item.name}</p>
                                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                                </div>
                                <p className="font-semibold text-green-600 text-base">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order info */}
                        <div className="space-y-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="w-5 h-5 text-blue-500"
                              />
                              Thông tin giao hàng
                            </h5>
                            <p className="text-sm text-gray-700 mb-2">{order.address}</p>
                            <p className="text-sm text-gray-700">
                              Thanh toán:{" "}
                              <span className="font-semibold text-green-600">
                                {order.paymentMethod}
                              </span>
                            </p>
                          </div>

                          {/* Status specific info */}
                          {order.status?.toUpperCase() === ORDER_STATUS.DELIVERED &&
                            order.deliveryTime && (
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="w-5 h-5 text-green-600"
                                />
                                <span className="text-sm text-green-700 font-medium">
                                  Giao hàng thành công lúc {formatDate(order.deliveryTime)}
                                </span>
                              </div>
                            )}

                          {order.status?.toUpperCase() === ORDER_STATUS.CANCELLED &&
                            order.cancelReason && (
                              <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  className="w-5 h-5 text-red-600"
                                />
                                <span className="text-sm text-red-700 font-medium">
                                  Lý do hủy: {order.cancelReason}
                                </span>
                              </div>
                            )}

                          {(order.status?.toUpperCase() === ORDER_STATUS.SHIPPING ||
                            order.status?.toUpperCase() === ORDER_STATUS.PREPARING ||
                            order.status?.toUpperCase() === ORDER_STATUS.CONFIRMED) &&
                            order.estimatedDelivery && (
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-blue-600" />
                                <span className="text-sm text-blue-700 font-medium">
                                  Dự kiến giao hàng: {formatDate(order.estimatedDelivery)}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col tablet:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order);
                          }}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-base tablet:text-md shadow">
                          <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                          Xem chi tiết
                        </button>
                        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-base tablet:text-md shadow">
                          <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" />
                          Xem hóa đơn
                        </button>
                        {order.status?.toUpperCase() === ORDER_STATUS.DELIVERED && (
                          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-base tablet:text-md shadow">
                            Đánh giá
                          </button>
                        )}
                        {canCancelOrder(order) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id || order.orderCode);
                            }}
                            disabled={cancellingOrder === (order.id || order.orderCode)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-base tablet:text-md shadow disabled:opacity-50 disabled:cursor-not-allowed">
                            {cancellingOrder === (order.id || order.orderCode) ? (
                              <>
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="w-5 h-5 animate-spin"
                                />
                                Đang hủy...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
                                Hủy đơn
                              </>
                            )}
                          </button>
                        )}
                        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-base tablet:text-md shadow">
                          <FontAwesomeIcon icon={faPhone} className="w-5 h-5" />
                          Liên hệ
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default OrdersTab;
