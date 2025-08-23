import React from "react";
import { Modal, Card, Button, Typography, Avatar } from "antd";
import { ShoppingBag, User, Phone, Clock, X, DollarSign } from "lucide-react";

const { Title, Text } = Typography;

const OrderNotificationModal = ({ isOpen, order, onClose }) => {
  if (!order) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      PENDING: {
        label: "Chờ xử lý",
        color: "gold",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
      },
      PROCESSING: {
        label: "Chờ xác nhận",
        color: "blue",
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
      },
      CONFIRMED: {
        label: "Đang chế biến",
        color: "purple",
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
        borderColor: "border-purple-200",
      },
      DELIVERING: {
        label: "Đang giao hàng",
        color: "orange",
        bgColor: "bg-orange-50",
        textColor: "text-orange-800",
        borderColor: "border-orange-200",
      },
      COMPLETED: {
        label: "Hoàn thành",
        color: "green",
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      },
      CANCELLED: {
        label: "Đã hủy",
        color: "red",
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      },
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  const statusConfig = getStatusConfig(order.orderStatus || order.status);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString("vi-VN");
    return new Date(timestamp).toLocaleString("vi-VN");
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      width={500}
      centered
      footer={null}
      className="order-notification-modal"
      styles={{
        body: { padding: 0 },
        content: { padding: 0, overflow: "hidden" },
      }}>
      {/* Header với gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-6 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <Title level={3} className="text-white/80 m-0 text-xl font-bold">
                  CÓ ĐƠN HÀNG MỚI!
                </Title>
                <Text className="text-white/80 text-sm">Vừa nhận được đơn hàng từ khách hàng</Text>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-white text-lg font-bold">#{order.orderCode || order.id}</Text>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {statusConfig.label}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Text className="text-white/80 text-sm block">Tổng tiền</Text>
                <Text className="text-white text-xl font-bold">
                  {formatPrice(order.totalAmount || order.totalPrice || 0)}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Customer Information */}
          <Card className="shadow-sm border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <Title level={4} className="m-0 text-gray-800">
                Thông tin khách hàng
              </Title>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar
                  icon={<User className="w-4 h-4" />}
                  className="bg-blue-100 text-blue-600"
                  size="small"
                />
                <div className="flex-1">
                  <Text className="text-sm text-gray-500 block">Tên khách hàng</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {order.customerName || order.receiverName || "N/A"}
                  </Text>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar
                  icon={<Phone className="w-4 h-4" />}
                  className="bg-green-100 text-green-600"
                  size="small"
                />
                <div className="flex-1">
                  <Text className="text-sm text-gray-500 block">Số điện thoại</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {order.customerPhone || order.receiverPhone || "N/A"}
                  </Text>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Avatar
                  icon={<DollarSign className="w-4 h-4" />}
                  className="bg-green-100 text-green-600"
                  size="small"
                />
                <div className="flex-1">
                  <Text className="text-sm text-green-600 block">Tổng tiền</Text>
                  <Text className="text-lg font-bold text-green-700">
                    {formatPrice(order.totalAmount || order.totalPrice || 0)}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Time Information */}
          <div className="flex items-center justify-center space-x-2 text-gray-500 pt-2">
            <Clock className="w-4 h-4" />
            <Text className="text-sm">Thời gian: {formatTimestamp(order.timestamp)}</Text>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex justify-center">
          <Button
            type="primary"
            onClick={onClose}
            className="px-8 py-2 h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderNotificationModal;
