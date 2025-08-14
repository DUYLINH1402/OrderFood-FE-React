import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
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
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });

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
      // Tạm thời dùng dữ liệu mẫu
      const sampleOrders = [];
      setOrders(sampleOrders);
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
          <h1 className="text-xl font-bold text-gray-900 mb-2">Lịch sử đơn hàng</h1>
          <p className="text-base text-gray-600">
            Xem tất cả đơn hàng và theo dõi lịch sử giao dịch
          </p>
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
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900">
                          Xem chi tiết
                        </button>
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
