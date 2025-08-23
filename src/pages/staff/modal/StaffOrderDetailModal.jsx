import React from "react";
import { Modal, Row, Col, Card, Badge, Typography, Divider, Space, Tag, Table } from "antd";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiTruck,
  FiHome,
  FiPackage,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";

const { Title, Text } = Typography;

const StaffOrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!order) return null;
  // Status mapping
  const getStatusConfig = (status) => {
    const configs = {
      PROCESSING: { color: "blue", text: "Chờ xác nhận", icon: <FiClock /> },
      CONFIRMED: { color: "orange", text: "Đang chế biến", icon: <FiPackage /> },
      DELIVERING: { color: "purple", text: "Đang giao hàng", icon: <FiTruck /> },
      COMPLETED: { color: "green", text: "Đã hoàn thành", icon: <FiCheckCircle /> },
      CANCELLED: { color: "red", text: "Đã hủy", icon: <FiX /> },
    };
    return configs[status] || configs.PROCESSING;
  };

  const statusConfig = getStatusConfig(order.status);

  // Payment status config
  const getPaymentStatusConfig = (status) => {
    return status === "PAID"
      ? { color: "success", text: "Đã thanh toán" }
      : { color: "warning", text: "Chưa thanh toán" };
  };

  const paymentConfig = getPaymentStatusConfig(order.paymentStatus);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Table columns for items - Mobile responsive
  const itemColumns = [
    {
      title: "Món ăn",
      key: "food",
      render: (_, record) => (
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {record.imageUrl ? (
              <img
                src={record.imageUrl}
                alt={record.foodName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiPackage className="text-gray-400" size={16} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 text-sm tablet:text-md desktop:text-md truncate">
              {record.foodName || "N/A"}
            </div>
            <div className="text-sm tablet:text-md text-gray-500">
              {formatCurrency(record.price || 0)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 60,
      align: "center",
      render: (quantity) => (
        <Badge count={quantity} style={{ backgroundColor: "#52c41a" }} className="font-bold" />
      ),
    },
    {
      title: "Tổng",
      key: "total",
      width: 80,
      align: "right",
      render: (_, record) => (
        <div className="font-bold text-blue-600 text-sm tablet:text-md">
          {formatCurrency((record.price || 0) * (record.quantity || 0))}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex flex-col tablet:flex-row tablet:items-center space-y-2 tablet:space-y-0 tablet:space-x-2">
          <div className="flex items-center space-x-2">
            <FiFileText className="text-blue-600" size={20} />
            <span className="text-base tablet:text-lg desktop:text-xl font-bold">
              Chi tiết đơn hàng
            </span>
          </div>
          <Tag color={statusConfig.color}>
            <Space size="small">
              {statusConfig.icon}
              <span className="text-sm tablet:text-md">{statusConfig.text}</span>
            </Space>
          </Tag>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="92vw"
      style={{
        top: 10,
      }}
      styles={{
        body: { maxHeight: "85vh", overflowY: "auto" },
      }}
      className="staff-order-detail-modal">
      <div className="space-y-4 tablet:space-y-6">
        {/* Order Code and Status */}
        <Card size="small" className="w-full">
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3 tablet:gap-4">
            <div className="flex flex-col tablet:flex-row tablet:items-center space-y-1 tablet:space-y-0 tablet:space-x-2">
              <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                Mã đơn hàng:
              </Text>
              <Text strong className="text-base tablet:text-lg desktop:text-xl">
                #{order.orderCode || order.id}
              </Text>
            </div>
            <div className="flex flex-col tablet:flex-row tablet:items-center space-y-1 tablet:space-y-0 tablet:space-x-2">
              <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                Trạng thái TT:
              </Text>
              <Tag color={paymentConfig.color} className="w-fit">
                {paymentConfig.text}
              </Tag>
            </div>
          </div>
        </Card>

        {/* Order Items - This is the most important section */}
        <Card
          title={
            <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between space-y-2 tablet:space-y-0">
              <div className="flex items-center space-x-2">
                <FiPackage className="text-blue-600" size={16} />
                <span className="text-sm tablet:text-md desktop:text-md">Chi tiết món ăn</span>
                <Badge
                  count={order.items?.length || 0}
                  style={{ backgroundColor: "#52c41a" }}
                  className="ml-1"
                />
              </div>
              <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                Tổng SL: {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}{" "}
                món
              </Text>
            </div>
          }
          size="small">
          <div className="overflow-x-auto">
            <Table
              dataSource={order.items || []}
              columns={itemColumns}
              pagination={false}
              rowKey={(record) => record.foodId || Math.random()}
              size="small"
              className="mb-4"
              bordered
              scroll={{ x: 300 }}
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-3 tablet:p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text className="text-sm tablet:text-md">Tổng tiền gốc:</Text>
                <Text strong className="text-sm tablet:text-md desktop:text-md">
                  {formatCurrency(order.originalAmount || order.totalPrice || 0)}
                </Text>
              </div>

              {/* Hiển thị giảm giá từ coupon nếu có */}
              {(order.couponDiscountAmount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <Text className="text-sm tablet:text-md text-blue-600">
                    Giảm giá coupon ({order.couponCode}):
                  </Text>
                  <Text className="text-blue-600 text-sm tablet:text-md desktop:text-md">
                    -{formatCurrency(order.couponDiscountAmount || 0)}
                  </Text>
                </div>
              )}

              {/* Hiển thị giảm giá khác nếu có */}
              {(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <Text className="text-sm tablet:text-md text-orange-600">
                    Giảm giá khuyến mãi:
                  </Text>
                  <Text className="text-orange-600 text-sm tablet:text-md desktop:text-md">
                    -{formatCurrency(order.discountAmount || 0)}
                  </Text>
                </div>
              )}

              {/* Hiển thị tổng giảm giá nếu có cả 2 loại */}
              {(order.couponDiscountAmount || 0) + (order.discountAmount || 0) > 0 && (
                <div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded">
                  <Text className="text-sm tablet:text-md font-medium text-green-700">
                    Tổng tiết kiệm:
                  </Text>
                  <Text className="text-green-700 text-sm tablet:text-md desktop:text-md font-medium">
                    -
                    {formatCurrency(
                      (order.couponDiscountAmount || 0) + (order.discountAmount || 0)
                    )}
                  </Text>
                </div>
              )}

              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text strong className="text-base tablet:text-lg desktop:text-xl">
                  Tổng cộng:
                </Text>
                <Text strong className="text-base tablet:text-lg desktop:text-xl text-red-600">
                  {formatCurrency(order.totalPrice || 0)}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Information */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <FiUser className="text-blue-600" size={16} />
              <span className="text-sm tablet:text-md desktop:text-md">Thông tin khách hàng</span>
            </div>
          }
          size="small">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FiUser className="text-gray-500" size={14} />
                <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                  Tên:
                </Text>
                <Text strong className="text-sm tablet:text-md desktop:text-md">
                  {order.receiverName || "N/A"}
                </Text>
              </div>
              <div className="flex items-center space-x-2">
                <FiPhone className="text-gray-500" size={14} />
                <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                  SĐT:
                </Text>
                <Text strong className="text-blue-600 text-sm tablet:text-md desktop:text-md">
                  {order.receiverPhone || "N/A"}
                </Text>
              </div>
              {order.receiverEmail && (
                <div className="flex items-center space-x-2">
                  <FiMail className="text-gray-500" size={14} />
                  <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                    Email:
                  </Text>
                  <Text className="text-sm tablet:text-md truncate">{order.receiverEmail}</Text>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {order.deliveryType === "DELIVERY" ? (
                  <FiTruck className="text-purple-600" size={14} />
                ) : (
                  <FiHome className="text-green-600" size={14} />
                )}
                <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                  Loại:
                </Text>
                <Tag
                  color={order.deliveryType === "DELIVERY" ? "purple" : "green"}
                  className="text-sm">
                  {order.deliveryType === "DELIVERY" ? "Giao tại nhà" : "Lấy tại cửa hàng"}
                </Tag>
              </div>
              {order.deliveryType === "DELIVERY" && (
                <div className="flex items-start space-x-2">
                  <FiMapPin className="text-gray-500 mt-0.5 flex-shrink-0" size={14} />
                  <div className="min-w-0 flex-1">
                    <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                      Địa chỉ:
                    </Text>
                    <div className="mt-1">
                      <Text strong className="text-sm tablet:text-md desktop:text-md break-words">
                        {(() => {
                          // Tạo địa chỉ đầy đủ từ các thành phần
                          const addressParts = [
                            order.deliveryAddress, // Địa chỉ chi tiết từ API
                            order.wardName, // Phường/Xã
                            order.districtName, // Quận/Huyện
                            order.provinceName || order.cityName, // Tỉnh/Thành phố
                          ].filter((part) => part && part.trim() !== "");

                          if (addressParts.length > 0) {
                            return addressParts.join(", ");
                          }

                          return "Chưa có địa chỉ giao hàng";
                        })()}
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Payment Information */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <FiCreditCard className="text-blue-600" size={16} />
              <span className="text-sm tablet:text-md desktop:text-md">Thông tin thanh toán</span>
            </div>
          }
          size="small">
          <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-3 tablet:gap-4">
            <div className="flex items-center space-x-2">
              <FiDollarSign className="text-gray-500" size={14} />
              <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                Phương Thức:
              </Text>
              <Text strong className="text-sm tablet:text-md desktop:text-md">
                {order.paymentMethod || "N/A"}
              </Text>
            </div>
            <div className="flex flex-col tablet:flex-row tablet:items-center space-y-1 tablet:space-y-0 tablet:space-x-2">
              <div className="flex items-center space-x-1">
                <FiClock className="text-gray-500" size={14} />
                <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                  Thời Gian Thanh Toán:
                </Text>
              </div>
              <Text className="text-sm tablet:text-md break-all">
                {formatDate(order.paymentTime)}
              </Text>
            </div>
            <div className="flex flex-col tablet:flex-row tablet:items-center space-y-1 tablet:space-y-0 tablet:space-x-2">
              <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                Mã Giao Dịch:
              </Text>
              <Text code className="text-sm break-all">
                {order.paymentTransactionId || "N/A"}
              </Text>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <FiClock className="text-blue-600" size={16} />
              <span className="text-sm tablet:text-md desktop:text-md">Thông tin bổ sung</span>
            </div>
          }
          size="small">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                  Thời gian đặt:
                </Text>
                <div className="mt-1">
                  <Text strong className="text-sm tablet:text-md desktop:text-md">
                    {formatDate(order.createdAt)}
                  </Text>
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                  Cập nhật lần cuối:
                </Text>
                <div className="mt-1">
                  <Text className="text-sm tablet:text-md desktop:text-md">
                    {formatDate(order.updatedAt)}
                  </Text>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {order.staffNote && (
                <div>
                  <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                    Ghi chú NV:
                  </Text>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded mt-1">
                    <Text className="text-blue-700 text-sm tablet:text-md desktop:text-md break-words">
                      {order.staffNote}
                    </Text>
                  </div>
                </div>
              )}
              {order.internalNote && (
                <div>
                  <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                    Ghi chú nội bộ:
                  </Text>
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded mt-1">
                    <Text className="text-purple-700 text-sm tablet:text-md desktop:text-md break-words">
                      {order.internalNote}
                    </Text>
                  </div>
                </div>
              )}
              {order.cancelReason && (
                <div>
                  <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                    Lý do hủy:
                  </Text>
                  <div className="p-2 bg-red-50 border border-red-200 rounded mt-1">
                    <Text className="text-red-700 text-sm tablet:text-md desktop:text-md break-words">
                      {order.cancelReason}
                    </Text>
                  </div>
                </div>
              )}
              {order.cancelledAt && (
                <div>
                  <Text type="secondary" className="text-gray-500 text-sm tablet:text-md">
                    Thời gian hủy:
                  </Text>
                  <div className="mt-1">
                    <Text className="text-sm tablet:text-md desktop:text-md">
                      {formatDate(order.cancelledAt)}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default StaffOrderDetailModal;
