import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faMapMarkerAlt,
  faCreditCard,
  faUser,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faReceipt,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
  DELIVERY_TYPE_LABELS,
} from "../constants/orderConstants";

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const statusConfig =
    ORDER_STATUS_CONFIG[order.status?.toUpperCase()] || ORDER_STATUS_CONFIG.PENDING;

  const getStatusIcon = (status) => {
    const iconMap = {
      faClock: faClock,
      faCheckCircle: faCheckCircle,
      faTruck: faTruck,
      faTimesCircle: faTimesCircle,
    };
    return iconMap[statusConfig.icon] || faClock;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có thông tin";
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

  const calculateItemTotal = (price, quantity) => {
    return price * quantity;
  };

  const calculateSubtotal = () => {
    return (
      order.items?.reduce((sum, item) => sum + calculateItemTotal(item.price, item.quantity), 0) ||
      0
    );
  };

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto mt-100 mb-4 text-md tablet:text-base laptop:text-base desktop:text-base">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${statusConfig.bgColor} flex items-center justify-center`}>
              <FontAwesomeIcon
                icon={getStatusIcon(order.status)}
                className={`w-6 h-6 tablet:w-7 tablet:h-7 ${statusConfig.color}`}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Chi tiết đơn hàng #{order.orderCode || order.id}
              </h2>
              <p className="text-sm text-gray-600">
                Đặt hàng lúc {formatDate(order.createdAt || order.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div
            className={`p-4 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={getStatusIcon(order.status)}
                className={`w-7 h-7 tablet:w-8 tablet:h-8 ${statusConfig.color}`}
              />
              <div>
                <h3 className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</h3>
                <p className="text-sm text-gray-600">
                  Cập nhật lúc {formatDate(order.updatedAt || order.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 tablet:w-6 tablet:h-6" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tên khách hàng</p>
                <p className="font-medium">
                  {order.receiverName || order.customerName || "Không có thông tin"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">
                  {order.receiverPhone || order.customerPhone || "Không có thông tin"}
                </p>
              </div>
              {order.receiverEmail && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{order.receiverEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 tablet:w-6 tablet:h-6" />
              Thông tin giao hàng
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Loại giao hàng</p>
                <p className="font-medium">
                  {DELIVERY_TYPE_LABELS[order.deliveryType] || "Giao hàng tận nơi"}
                </p>
              </div>
              {order.deliveryAddress && (
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
              )}
              {order.estimatedDelivery && (
                <div>
                  <p className="text-sm text-gray-600">Thời gian dự kiến</p>
                  <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
                </div>
              )}
              {order.deliveryTime && (
                <div>
                  <p className="text-sm text-gray-600">Thời gian giao hàng</p>
                  <p className="font-medium text-green-600">{formatDate(order.deliveryTime)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4 tablet:w-6 tablet:h-6" />
              Món ăn đã đặt
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name || item.foodName}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-600">Phân loại: {item.variant}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(calculateItemTotal(item.price, item.quantity))}
                    </p>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Không có thông tin món ăn</p>}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faCreditCard} className="w-4 h-4 tablet:w-6 tablet:h-6" />
              Thông tin thanh toán
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              {order.deliveryFee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí giao hàng:</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
              )}
              {order.pointsDiscount && order.pointsDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá từ điểm thưởng:</span>
                  <span>-{formatPrice(order.pointsDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                <span>Tổng cộng:</span>
                <span className="text-green-600">
                  {formatPrice(order.totalPrice || order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Cancel Reason */}
          {order.cancelReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 tablet:w-6 tablet:h-6" />
                Lý do hủy đơn hàng
              </h3>
              <p className="text-red-700">{order.cancelReason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Đóng
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <FontAwesomeIcon icon={faReceipt} className="w-4 h-4 tablet:w-6 tablet:h-6" />
              Tải hóa đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document.body
  return ReactDOM.createPortal(modalContent, document.body);
};

export default OrderDetailModal;
