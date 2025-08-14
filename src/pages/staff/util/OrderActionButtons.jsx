import React from "react";
import { ORDER_STATUS } from "../../../constants/orderConstants";

/**
 * Component hiển thị các action buttons theo trạng thái đơn hàng
 * @param {Object} props - Props của component
 * @param {Object} props.order - Thông tin đơn hàng
 * @param {Function} props.onConfirmOrder - Callback khi xác nhận đơn hàng
 * @param {Function} props.onStartDelivering - Callback khi bắt đầu giao hàng
 * @param {Function} props.onCompleteDelivery - Callback khi hoàn thành giao hàng
 * @param {Function} props.onCancelOrder - Callback khi hủy đơn hàng
 * @param {Function} props.getOrderId - Helper function lấy ID đơn hàng
 */
const OrderActionButtons = ({
  order,
  onConfirmOrder,
  onStartDelivering,
  onCompleteDelivery,
  onCancelOrder,
  getOrderId,
}) => {
  const canCancel = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.CONFIRMED,
  ].includes(order.status);

  switch (order.status) {
    case ORDER_STATUS.PENDING:
      return (
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-base">
            Chờ khách thanh toán
          </span>
        </div>
      );

    case ORDER_STATUS.PROCESSING:
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => onConfirmOrder(getOrderId(order))}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base">
            Xác nhận & Chế biến
          </button>
          {canCancel && (
            <button
              onClick={() => onCancelOrder(getOrderId(order))}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-base">
              Hủy
            </button>
          )}
        </div>
      );

    case ORDER_STATUS.CONFIRMED:
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => onStartDelivering(getOrderId(order))}
            className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-base">
            Hoàn thành & Giao hàng
          </button>
          {canCancel && (
            <button
              onClick={() => onCancelOrder(getOrderId(order))}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-base">
              Hủy
            </button>
          )}
        </div>
      );

    case ORDER_STATUS.DELIVERING:
      return (
        <button
          onClick={() => onCompleteDelivery(getOrderId(order))}
          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-base">
          Hoàn thành giao hàng
        </button>
      );

    case ORDER_STATUS.COMPLETED:
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-base">
          Đã hoàn thành
        </span>
      );

    case ORDER_STATUS.CANCELLED:
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-base">Đã hủy</span>;

    default:
      return null;
  }
};

export default OrderActionButtons;
