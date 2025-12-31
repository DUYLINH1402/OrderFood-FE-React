import React, { useState, useEffect } from "react";
import { Modal, Tag, Divider, Image, Typography, Timeline, Tooltip } from "antd";
import {
  FiUser,
  FiDollarSign,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiMessageSquare,
  FiAlertCircle,
  FiTag,
  FiClock,
  FiCopy,
  FiActivity,
} from "react-icons/fi";

const { Paragraph } = Typography;

const AdminOrderDetailModal = ({ order, isOpen, onClose, onUpdateInternalNote }) => {
  const [internalNote, setInternalNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setInternalNote(order.internalNote || "");
    }
  }, [order]);

  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      amount || 0
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSaveInternalNote = async () => {
    setIsSaving(true);
    try {
      await onUpdateInternalNote(order.id, internalNote);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper để lấy màu badge trạng thái đơn hàng
  const getOrderStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "CONFIRMED":
        return "blue";
      case "SHIPPING":
        return "cyan";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <Modal
      title={
        <div className="flex flex-col md:flex-row md:items-center justify-between pr-8 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-800">Đơn hàng #{order.orderCode}</span>
            <Paragraph
              copyable={{ text: order.orderCode, tooltips: ["Sao chép", "Đã chép"] }}
              className="m-0 text-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Tag color={getOrderStatusColor(order.status)}>TRẠNG THÁI: {order.status}</Tag>
            <Tag color={order.paymentStatus === "PAID" ? "green" : "volcano"}>
              {order.paymentStatus === "PAID" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
            </Tag>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={1100}
      centered
      footer={[
        <button
          key="back"
          onClick={onClose}
          className="px-6 py-2 border rounded-lg mr-2 hover:bg-gray-50 font-medium">
          Đóng
        </button>,
        <button
          key="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition-all"
          onClick={handleSaveInternalNote}>
          {isSaving ? "Đang lưu..." : "Lưu ghi chú nội bộ"}
        </button>,
      ]}>
      <div className="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
        {/* TOP: Timeline & Thông tin cơ bản */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center text-sm uppercase">
                <FiClock className="mr-2" /> Dòng thời gian
              </h4>
              <Timeline
                items={[
                  {
                    color: "blue",
                    children: (
                      <span className="text-sx text-gray-600">
                        Đã tạo: {formatDate(order.createdAt)}
                      </span>
                    ),
                  },
                  order.paymentTime && {
                    color: "green",
                    children: (
                      <span className="text-sx text-gray-600">
                        Thanh toán: {formatDate(order.paymentTime)}
                      </span>
                    ),
                  },
                  order.updatedAt && {
                    color: "gray",
                    children: (
                      <span className="text-sx text-gray-400">
                        Cập nhật lần cuối: {formatDate(order.updatedAt)}
                      </span>
                    ),
                  },
                  order.status === "CANCELLED" && {
                    color: "red",
                    children: (
                      <span className="text-sx text-red-600 font-bold">
                        Đã hủy: {formatDate(order.cancelledAt)}
                      </span>
                    ),
                  },
                ].filter(Boolean)}
              />
            </div>

            {/* Lý do hủy (nổi bật nếu có) */}
            {order.status === "CANCELLED" && (
              <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 h-fit">
                <p className="text-red-700 font-bold text-sx uppercase flex items-center mb-1">
                  <FiAlertCircle className="mr-1" /> Lý do hủy đơn:
                </p>
                <p className="text-red-600 text-sm font-medium">"{order.cancelReason}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Row 1: Thông tin khách hàng & Vận chuyển */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="flex items-center font-bold text-blue-700 mb-4 border-b pb-2">
              <FiUser className="mr-2" /> THÔNG TIN KHÁCH HÀNG
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Người nhận:</span>
                <span className="font-bold text-gray-800 text-base">{order.receiverName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Số điện thoại:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{order.receiverPhone}</span>
                  <Paragraph
                    copyable={{ text: order.receiverPhone, tooltips: ["Copy", "Đã copy"] }}
                    className="m-0 text-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-700">{order.receiverEmail || "N/A"}</span>
              </div>
              <Divider className="my-2" dashed />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Hình thức nhận hàng:</span>
                <Tag color={order.deliveryType === "TAKE_AWAY" ? "purple" : "cyan"}>
                  {order.deliveryType === "TAKE_AWAY" ? "MANG ĐI / TẠI QUÁN" : "GIAO HÀNG TẬN NƠI"}
                </Tag>
              </div>

              {order.deliveryType !== "TAKE_AWAY" ? (
                <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                  <p className="text-gray-500 flex items-center mb-1 text-sx uppercase font-bold">
                    <FiMapPin className="mr-1" /> Địa chỉ giao hàng:
                  </p>
                  <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
                </div>
              ) : (
                <div className="mt-2 bg-purple-50 p-3 rounded-lg text-center text-purple-700 text-sm font-medium">
                  Khách nhận tại cửa hàng
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="flex items-center font-bold text-orange-700 mb-4 border-b pb-2">
              <FiCreditCard className="mr-2" /> CỔNG THANH TOÁN
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Phương thức:</span>
                <Tag color="geekblue" className="text-sm px-2 py-0.5 font-bold uppercase">
                  {order.paymentMethod}
                </Tag>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Mã giao dịch (TransID):</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sx">
                  {order.paymentTransactionId || "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái cổng:</span>
                <span
                  className={`font-bold ${
                    order.paymentStatus === "PENDING" ? "text-orange-500" : "text-green-600"
                  }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg mt-4 text-sx text-gray-500">
                <FiActivity className="inline mr-1" />
                System Log: Updated at {formatDate(order.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Chi tiết món ăn (Có ảnh) */}
        <div className="mt-8">
          <h4 className="flex items-center font-bold text-gray-700 mb-4 uppercase text-sm tracking-wide">
            <FiPackage className="mr-2" /> Danh sách sản phẩm ({order.items?.length || 0})
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center w-16">#</th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-center">SL</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-right">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Hiển thị ảnh thumbnail nếu có */}
                        {item.imageUrl ? (
                          <Image
                            width={50}
                            height={50}
                            src={item.imageUrl}
                            alt={item.foodName}
                            className="rounded-md object-cover border border-gray-200"
                            fallback="https://via.placeholder.com/50?text=Food"
                          />
                        ) : (
                          <div className="w-[50px] h-[50px] bg-gray-100 rounded-md flex items-center justify-center text-sx text-gray-400">
                            No Img
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-800">{item.foodName}</div>
                          {item.foodSlug && (
                            <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                              {item.foodSlug}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium bg-gray-50/50">
                      x{item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3: Đối soát & Tổng kết */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột Ghi chú (Chiếm 2 phần) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="flex items-center font-bold text-gray-700 mb-4 uppercase text-sm">
              <FiMessageSquare className="mr-2" /> Ghi chú vận hành
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <label className="text-sx text-yellow-700 font-bold uppercase mb-2 block">
                  Ghi chú của Khách / Staff Order:
                </label>
                <p className="text-gray-700 text-sm italic">
                  "{order.staffNote || "Không có ghi chú nào"}"
                </p>
              </div>

              <div>
                <label className="text-sx text-blue-700 font-bold uppercase mb-2 block">
                  Ghi chú nội bộ (Admin Note):
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  rows={4}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Nhập thông tin đối soát, lưu ý cho kế toán hoặc lý do xử lý..."
                />
                <div className="text-sx text-gray-400 mt-1 text-right">
                  Chỉ hiển thị cho quản trị viên
                </div>
              </div>
            </div>
          </div>

          {/* Cột Tổng tiền (Chiếm 1 phần) */}
          <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
            <h4 className="flex items-center font-bold text-gray-700 mb-4 uppercase text-sm">
              <FiDollarSign className="mr-2" /> Tổng kết tài chính
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính (Subtotal):</span>
                <span className="font-medium">{formatCurrency(order.subtotalAmount)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>
                  {order.shippingFee > 0 ? (
                    `+ ${formatCurrency(order.shippingFee)}`
                  ) : (
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  )}
                </span>
              </div>

              {order.couponDiscountAmount > 0 && (
                <div className="flex justify-between text-blue-600 bg-blue-50 p-1 px-2 rounded">
                  <span className="flex items-center">
                    <FiTag className="mr-1" /> Coupon ({order.couponCode}):
                  </span>
                  <span>- {formatCurrency(order.couponDiscountAmount)}</span>
                </div>
              )}

              {order.pointsDiscountAmount > 0 && (
                <div className="flex justify-between text-purple-600 bg-purple-50 p-1 px-2 rounded">
                  <span>Điểm ({order.pointsUsed} pts):</span>
                  <span>- {formatCurrency(order.pointsDiscountAmount)}</span>
                </div>
              )}

              <Divider className="my-3 border-gray-300" />

              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-bold text-lg">THỰC THU:</span>
                <span className="text-orange-600 text-2xl font-bold">
                  {formatCurrency(order.finalAmount)}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 text-right italic mt-2">* Đã bao gồm VAT</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AdminOrderDetailModal;
