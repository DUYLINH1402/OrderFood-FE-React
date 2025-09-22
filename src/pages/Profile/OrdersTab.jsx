import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faTruck,
  faReceipt,
  faPhone,
  faCalendarAlt,
  faMapMarkerAlt,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";
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

  // Fetch all orders from API only once
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOrders({
          // page: 0,
          // size: 100,
        });
        console.log("Fetch orders result:", result);
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
      status !== ORDER_STATUS.COMPLETED
    );
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
      id: (ORDER_STATUS.PENDING || "").toLowerCase(),
      label: "Chờ thanh toán",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.PENDING).length,
    },
    {
      id: (ORDER_STATUS.PROCESSING || "").toLowerCase(),
      label: "Chờ xác nhận",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.PROCESSING).length,
    },
    {
      id: (ORDER_STATUS.CONFIRMED || "").toLowerCase(),
      label: "Đang chế biến",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.CONFIRMED).length,
    },
    {
      id: (ORDER_STATUS.DELIVERING || "").toLowerCase(),
      label: "Đang giao hàng",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.DELIVERING).length,
    },
    {
      id: (ORDER_STATUS.COMPLETED || "").toLowerCase(),
      label: "Đã hoàn thành",
      count: orders.filter((o) => o.status?.toUpperCase() === ORDER_STATUS.COMPLETED).length,
    },
    {
      id: (ORDER_STATUS.CANCELLED || "").toLowerCase(),
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
      <div className="grid grid-cols-2 tablet:flex tablet:flex-wrap gap-2 border-b border-gray-200 pb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`w-full tablet:w-auto px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm tablet:text-md flex items-center justify-center ${
              selectedStatus === tab.id
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`ml-2 px-2 py-1 text-sx rounded-full border transition-colors duration-200
                  ${
                    selectedStatus === tab.id
                      ? "bg-white bg-opacity-20 border-white text-white"
                      : "bg-gray-200 border-gray-300 text-gray-600"
                  }
                `}>
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
                          className={`w-12 h-12 rounded-full ${statusConfig.bgColor} flex items-center justify-center shadow-sm`}>
                          <FontAwesomeIcon
                            icon={getStatusIcon(order.status)}
                            className={`w-6 h-6 ${statusConfig.color}`}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-gray-900 text-base">
                            #{order.orderCode || order.id}
                          </h4>
                          <div
                            className={`px-3 py-1 rounded-full font-semibold transition-all duration-200 
                              text-sx tablet:text-sm 
                              ${statusConfig.bgColor} ${statusConfig.color}
                              shadow-sm border ${statusConfig.borderColor}
                              whitespace-nowrap
                            `}>
                            {statusConfig.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                            <span>{formatDate(order.createdAt || order.date)}</span>
                          </div>
                          {order.receiverName && (
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                              <span>{order.receiverName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <p className="font-bold text-green-600 text-base tablet:text-18">
                          {formatPrice(order.finalAmount || order.totalPrice || order.total)}
                        </p>
                        {(order.discountAmount > 0 || order.couponDiscountAmount > 0) &&
                          order.totalBeforeDiscount && (
                            <p className="text-sm text-gray-400 line-through">
                              {formatPrice(order.totalBeforeDiscount)}
                            </p>
                          )}
                        <p className="text-sm text-gray-500">
                          {(order.items || []).length} món
                          {(order.discountAmount > 0 || order.couponDiscountAmount > 0) && (
                            <span className="ml-2 text-red-500">
                              (-
                              {formatPrice(
                                (order.discountAmount || 0) + (order.couponDiscountAmount || 0)
                              )}
                              )
                            </span>
                          )}
                        </p>
                      </div>
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
                      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                        {/* Items */}
                        <div>
                          <div className="space-y-3">
                            {(order.items || []).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.foodName || item.name}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {item.foodName || item.name}
                                  </p>
                                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-green-600 text-base">
                                    {formatPrice(item.price)}
                                  </p>
                                  <p className="text-sx text-gray-500">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Coupon và giảm giá */}
                          {(order.couponCode ||
                            order.couponDiscountAmount > 0 ||
                            order.pointsUsed > 0) && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                              <h6 className="font-medium text-green-800 mb-2">
                                Khuyến mãi & Giảm giá
                              </h6>
                              {order.couponCode && (
                                <p className="text-sm text-green-700 mb-1">
                                  Mã coupon:{" "}
                                  <span className="font-semibold">{order.couponCode}</span>
                                </p>
                              )}
                              {order.couponDiscountAmount > 0 && (
                                <p className="text-sm text-green-700 mb-1">
                                  Giảm giá từ coupon:{" "}
                                  <span className="font-semibold text-red-600">
                                    -{formatPrice(order.couponDiscountAmount)}
                                  </span>
                                </p>
                              )}
                              {order.pointsUsed > 0 && (
                                <p className="text-sm text-green-700 mb-1">
                                  Sử dụng điểm thưởng:{" "}
                                  <span className="font-semibold text-blue-600">
                                    {order.pointsUsed} điểm
                                  </span>
                                  <span className="font-semibold text-red-600 ml-2">
                                    -{formatPrice(order.discountAmount || 0)}
                                  </span>
                                </p>
                              )}
                              {(order.discountAmount > 0 || order.couponDiscountAmount > 0) && (
                                <div className="mt-2 pt-2 border-t border-green-200">
                                  <p className="text-sm font-semibold text-green-800">
                                    Tổng tiết kiệm:{" "}
                                    <span className="text-red-600">
                                      -
                                      {formatPrice(
                                        (order.discountAmount || 0) +
                                          (order.couponDiscountAmount || 0)
                                      )}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Order info */}
                        <div className="space-y-4">
                          {/* Thông tin giao hàng */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="w-5 h-5 text-blue-500"
                              />
                              Thông tin giao hàng
                            </h5>
                            <div className="space-y-2">
                              {order.receiverName && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Người nhận:</span>{" "}
                                  {order.receiverName}
                                </p>
                              )}
                              {order.receiverPhone && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Số điện thoại:</span>{" "}
                                  {order.receiverPhone}
                                </p>
                              )}
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Địa chỉ:</span>{" "}
                                {order.deliveryAddress || order.address}
                              </p>
                              {(order.wardName || order.districtName) && (
                                <p className="text-sm text-gray-500">
                                  {order.wardName && `${order.wardName}, `}
                                  {order.districtName}
                                </p>
                              )}
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Loại giao hàng:</span>{" "}
                                <span className="font-semibold text-blue-600">
                                  {order.deliveryType === "TAKE_AWAY"
                                    ? "Tự đến lấy"
                                    : "Giao hàng tận nơi"}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Thông tin thanh toán */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={faReceipt}
                                className="w-5 h-5 text-green-500"
                              />
                              Thông tin thanh toán
                            </h5>
                            <div className="space-y-2">
                              {/* Breakdown chi tiết */}
                              {order.subtotalAmount && (
                                <div className="pb-2 mb-2 border-b border-gray-100">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tổng tiền món:</span>
                                    <span className="font-medium">
                                      {formatPrice(order.subtotalAmount)}
                                    </span>
                                  </div>
                                  {order.shippingFee > 0 && (
                                    <div className="flex justify-between text-sm mt-1">
                                      <span className="text-gray-600">Phí giao hàng:</span>
                                      <span className="font-medium">
                                        {formatPrice(order.shippingFee)}
                                      </span>
                                    </div>
                                  )}
                                  {(order.discountAmount > 0 || order.couponDiscountAmount > 0) && (
                                    <div className="flex justify-between text-sm mt-1 text-red-600">
                                      <span>Tổng giảm giá:</span>
                                      <span className="font-medium">
                                        -
                                        {formatPrice(
                                          (order.discountAmount || 0) +
                                            (order.couponDiscountAmount || 0)
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-100 font-semibold">
                                    <span className="text-gray-900">Tổng cộng:</span>
                                    <span className="text-green-600">
                                      {formatPrice(
                                        order.finalAmount || order.totalPrice || order.total
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Phương thức:</span>{" "}
                                <span className="font-semibold text-green-600">
                                  {order.paymentMethod === "VISA"
                                    ? "Thẻ tín dụng"
                                    : order.paymentMethod === "MOMO"
                                    ? "Ví MoMo"
                                    : order.paymentMethod === "CASH"
                                    ? "Tiền mặt"
                                    : order.paymentMethod}
                                </span>
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Trạng thái:</span>{" "}
                                <span
                                  className={`font-semibold ${
                                    order.paymentStatus === "PAID"
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}>
                                  {order.paymentStatus === "PAID"
                                    ? "Đã thanh toán"
                                    : "Chưa thanh toán"}
                                </span>
                              </p>
                              {order.paymentTime && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Thời gian:</span>{" "}
                                  {formatDate(order.paymentTime)}
                                </p>
                              )}
                              {order.paymentTransactionId && (
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Mã giao dịch:</span>{" "}
                                  {order.paymentTransactionId}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Ghi chú nhân viên */}
                          {order.staffNote && (
                            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                              <h6 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                                Ghi chú từ nhân viên
                              </h6>
                              <p className="text-sm text-yellow-700">{order.staffNote}</p>
                            </div>
                          )}

                          {/* Ghi chú nội bộ */}
                          {order.internalNote && (
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <h6 className="font-medium text-gray-800 mb-2">Ghi chú nội bộ</h6>
                              <p className="text-sm text-gray-700">{order.internalNote}</p>
                            </div>
                          )}

                          {/* Status specific info */}
                          {order.status?.toUpperCase() === ORDER_STATUS.COMPLETED &&
                            order.deliveryTime && (
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="w-5 h-5 text-green-600"
                                  />
                                  <span className="font-medium text-green-800">
                                    Đơn hàng hoàn thành
                                  </span>
                                </div>
                                <p className="text-sm text-green-700">
                                  Giao hàng thành công lúc {formatDate(order.deliveryTime)}
                                </p>
                              </div>
                            )}

                          {order.status?.toUpperCase() === ORDER_STATUS.CANCELLED && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  className="w-5 h-5 text-red-600"
                                />
                                <span className="font-medium text-red-800">Đơn hàng đã bị hủy</span>
                              </div>
                              {order.cancelReason && (
                                <p className="text-sm text-red-700 mb-1">
                                  <span className="font-medium">Lý do:</span> {order.cancelReason}
                                </p>
                              )}
                              {order.cancelledAt && (
                                <p className="text-sm text-red-600">
                                  <span className="font-medium">Thời gian hủy:</span>{" "}
                                  {formatDate(order.cancelledAt)}
                                </p>
                              )}
                            </div>
                          )}

                          {(order.status?.toUpperCase() === ORDER_STATUS.DELIVERING ||
                            order.status?.toUpperCase() === ORDER_STATUS.CONFIRMED ||
                            order.status?.toUpperCase() === ORDER_STATUS.PROCESSING) &&
                            order.estimatedDelivery && (
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <FontAwesomeIcon
                                    icon={faClock}
                                    className="w-5 h-5 text-blue-600"
                                  />
                                  <span className="font-medium text-blue-800">
                                    Thời gian dự kiến
                                  </span>
                                </div>
                                <p className="text-sm text-blue-700">
                                  Dự kiến giao hàng: {formatDate(order.estimatedDelivery)}
                                </p>
                              </div>
                            )}

                          {order.status?.toUpperCase() === ORDER_STATUS.PROCESSING && (
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="w-5 h-5 text-orange-600"
                                />
                                <span className="font-medium text-orange-800">
                                  Đơn hàng đang chờ nhà hàng xác nhận
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {canCancelOrder(order) && (
                        <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id || order.orderCode);
                            }}
                            disabled={cancellingOrder === (order.id || order.orderCode)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
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
                                Hủy đơn hàng
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrdersTab;
