import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Pagination, Tag, Tooltip, Modal, Progress } from "antd";
import {
  FiDollarSign,
  FiPackage,
  FiSearch,
  FiBarChart,
  FiRefreshCw,
  FiAlertCircle,
  FiEye,
  FiTrash2,
  FiFileText,
  FiRotateCcw,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiCreditCard,
  FiGift,
  FiStar,
  FiCalendar,
} from "react-icons/fi";
import {
  getAllAdminOrders,
  getDashboardStats,
  cancelOrderWithReason,
  restoreOrder,
  updateInternalNote,
  getOrderFullDetails,
} from "../../services/service/adminOrderService";
import { ORDER_STATUS, ORDER_STATUS_CONFIG } from "../../constants/orderConstants";
import SpinnerCube from "../../components/Skeleton/SpinnerCube";
import AdminOrderDetailModal from "./modal/AdminOrderDetailModal";

const AdminOrders = () => {
  // States data
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Dashboard Stats từ API - cấu trúc đầy đủ
  const [dashboardStats, setDashboardStats] = useState({
    // Doanh thu
    totalRevenue: 0,
    actualRevenue: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    revenueGrowthPercent: 0,
    averageOrderValue: 0,
    // Đơn hàng
    totalOrders: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    ordersThisMonth: 0,
    // Trạng thái đơn
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    deliveringOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    cancelledOrdersToday: 0,
    cancelledOrdersThisWeek: 0,
    cancellationRate: 0,
    // Thanh toán
    paidOrders: 0,
    unpaidOrders: 0,
    refundedOrders: 0,
    // Khuyến mãi & Điểm
    ordersWithCoupon: 0,
    totalCouponDiscount: 0,
    totalPointsUsed: 0,
    totalPointsDiscount: 0,
    // Ghi chú nội bộ
    ordersWithInternalNotes: 0,
    newInternalNotesToday: 0,
    newInternalNotesThisWeek: 0,
  });

  // UI States cho Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UI States lọc & phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

  // Load Dashboard Stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  }, []);

  // Load Orders với filter từ API Backend
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = {
        status: selectedStatus,
        page: currentPage - 1, // API page bắt đầu từ 0
        size: pageSize,
        sortBy: "createdAt",
        sortDir: "desc",
        orderCode: searchTerm || undefined,
        startDate: dateFilter.from || undefined,
        endDate: dateFilter.to || undefined,
      };

      const response = await getAllAdminOrders(params);
      if (response.success) {
        // Cấu trúc response: { data: { data: [...], total, totalPages, page, size, hasNext, hasPrevious } }
        const responseData = response.data;
        setAllOrders(responseData?.data || []);
        setTotalElements(responseData?.total || 0);
        setLastUpdated(new Date());
      } else {
        toast.error(response.message || "Không thể tải dữ liệu đơn hàng");
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu đơn hàng");
      console.error("Error loading orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, [selectedStatus, currentPage, pageSize, searchTerm, dateFilter]);

  // Load data khi component mount và khi filter thay đổi
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Load dashboard stats khi component mount
  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  // Debounce search - reset page về 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, dateFilter]);

  // Handler mở modal chi tiết - lấy thông tin đầy đủ từ API
  const handleOpenDetail = async (order) => {
    try {
      const response = await getOrderFullDetails(order.id);
      if (response.success) {
        setSelectedOrder(response.data);
      } else {
        // Fallback về order hiện tại nếu API fail
        setSelectedOrder(order);
      }
    } catch (error) {
      console.error("Error getting order details:", error);
      setSelectedOrder(order);
    }
    setIsModalOpen(true);
  };

  // Cập nhật ghi chú nội bộ - gọi API thực
  const handleUpdateInternalNote = async (orderId, note) => {
    try {
      const response = await updateInternalNote(orderId, note);
      if (response.success) {
        // Cập nhật UI local
        setAllOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, internalNote: note } : o))
        );
        // Cập nhật selected order nếu đang mở
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, internalNote: note }));
        }
        toast.success("Đã cập nhật ghi chú nội bộ");
        setIsModalOpen(false);
        // Reload dashboard stats
        loadDashboardStats();
      } else {
        toast.error(response.message || "Lỗi khi cập nhật ghi chú");
      }
    } catch (error) {
      console.error("Error updating internal note:", error);
      toast.error("Lỗi khi cập nhật ghi chú nội bộ");
    }
  };

  // Hủy đơn hàng với lý do - gọi API thực
  const handleCancelOrder = (order) => {
    Modal.confirm({
      title: `Xác nhận hủy đơn hàng #${order.orderCode}`,
      icon: <FiAlertCircle className="text-red-500" size={24} />,
      content: (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2 font-medium">
            Lý do hủy (Dữ liệu Admin - Cột cancel_reason):
          </p>
          <textarea
            id="adminCancelReason"
            className="w-full p-3 border rounded-lg text-sm focus:ring-1 focus:ring-red-500 outline-none"
            rows={3}
            placeholder="Nhập lý do hủy bắt buộc để đối soát sau này..."
          />
        </div>
      ),
      okText: "Hủy đơn ngay",
      okType: "danger",
      cancelText: "Quay lại",
      onOk: async () => {
        const reason = document.getElementById("adminCancelReason").value;
        if (!reason) {
          toast.warning("Vui lòng nhập lý do hủy để lưu vào hệ thống");
          return Promise.reject();
        }

        try {
          const response = await cancelOrderWithReason(order.id, reason);
          if (response.success) {
            toast.success(`Đã hủy đơn ${order.orderCode}`);
            // Reload orders và stats
            loadOrders();
            loadDashboardStats();
          } else {
            toast.error(response.message || "Lỗi khi hủy đơn hàng");
          }
        } catch (error) {
          console.error("Error cancelling order:", error);
          toast.error("Lỗi khi hủy đơn hàng");
        }
      },
    });
  };

  // Khôi phục đơn hàng đã hủy
  const handleRestoreOrder = async (order) => {
    try {
      const response = await restoreOrder(order.id);
      if (response.success) {
        toast.success(`Đã khôi phục đơn hàng #${order.orderCode}`);
        // Reload orders và stats
        loadOrders();
        loadDashboardStats();
      } else {
        toast.error(response.message || "Lỗi khi khôi phục đơn hàng");
      }
    } catch (error) {
      console.error("Error restoring order:", error);
      toast.error("Lỗi khi khôi phục đơn hàng");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
            <FiBarChart className="mr-3 text-orange-500" /> Quản trị Đơn hàng
          </h1>
          <p className="text-slate-500 mt-1 italic">Dữ liệu đối soát tài chính chi tiết</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadOrders}
            className="flex items-center px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 shadow-md transition-all">
            <FiRefreshCw className={`mr-2 ${ordersLoading ? "animate-spin" : ""}`} /> Làm mới
          </button>
        </div>
      </div>

      {/* Stats Dashboard - Dữ liệu từ Dashboard Stats API */}
      <div className="space-y-6 mb-8">
        {/* Section 1: Tổng quan Doanh thu */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-green-500" /> Tổng quan Doanh thu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ">
            <MiniStatCard
              title="Tổng doanh thu"
              value={`${(dashboardStats.totalRevenue || 0).toLocaleString()}đ`}
              icon={<FiDollarSign />}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <MiniStatCard
              title="Doanh thu thực"
              value={`${(dashboardStats.actualRevenue || 0).toLocaleString()}đ`}
              icon={<FiCheckCircle />}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <MiniStatCard
              title="Hôm nay"
              value={`${(dashboardStats.revenueToday || 0).toLocaleString()}đ`}
              icon={<FiCalendar />}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <MiniStatCard
              title="Tuần này"
              value={`${(dashboardStats.revenueThisWeek || 0).toLocaleString()}đ`}
              icon={<FiBarChart />}
              color="text-indigo-600"
              bgColor="bg-indigo-50"
            />
            <MiniStatCard
              title="Tháng này"
              value={`${(dashboardStats.revenueThisMonth || 0).toLocaleString()}đ`}
              icon={<FiTrendingUp />}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sx font-medium text-orange-700">Tăng trưởng</span>
                {dashboardStats.revenueGrowthPercent >= 0 ? (
                  <FiTrendingUp className="text-green-500" size={16} />
                ) : (
                  <FiTrendingDown className="text-red-500" size={16} />
                )}
              </div>
              <p
                className={`text-xl font-bold ${
                  dashboardStats.revenueGrowthPercent >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {dashboardStats.revenueGrowthPercent >= 0 ? "+" : ""}
                {(dashboardStats.revenueGrowthPercent || 0).toFixed(1)}%
              </p>
            </div>
          </div>
          {/* Giá trị đơn trung bình */}
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Giá trị đơn hàng trung bình</span>
              <span className="text-lg font-bold text-orange-600">
                {(dashboardStats.averageOrderValue || 0).toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Thống kê Đơn hàng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Đơn hàng theo thời gian */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FiPackage className="mr-2 text-blue-500" /> Đơn hàng theo thời gian
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Tổng đơn hàng"
                value={dashboardStats.totalOrders || 0}
                icon={<FiPackage />}
                color="bg-blue-500"
              />
              <StatCard
                title="Hôm nay"
                value={dashboardStats.ordersToday || 0}
                icon={<FiCalendar />}
                color="bg-cyan-500"
              />
              <StatCard
                title="Tuần này"
                value={dashboardStats.ordersThisWeek || 0}
                icon={<FiBarChart />}
                color="bg-indigo-500"
              />
              <StatCard
                title="Tháng này"
                value={dashboardStats.ordersThisMonth || 0}
                icon={<FiTrendingUp />}
                color="bg-violet-500"
              />
            </div>
          </div>

          {/* Trạng thái đơn hàng */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FiClock className="mr-2 text-orange-500" /> Trạng thái đơn hàng
            </h2>
            <div className="space-y-3">
              <StatusProgressBar
                label="Chờ xử lý"
                value={dashboardStats.pendingOrders || 0}
                total={dashboardStats.totalOrders || 1}
                color="#f59e0b"
                icon={<FiClock />}
              />
              <StatusProgressBar
                label="Đã xác nhận"
                value={dashboardStats.confirmedOrders || 0}
                total={dashboardStats.totalOrders || 1}
                color="#3b82f6"
                icon={<FiCheckCircle />}
              />
              <StatusProgressBar
                label="Đang chế biến"
                value={dashboardStats.processingOrders || 0}
                total={dashboardStats.totalOrders || 1}
                color="#8b5cf6"
                icon={<FiPackage />}
              />
              <StatusProgressBar
                label="Đang giao"
                value={dashboardStats.deliveringOrders || 0}
                total={dashboardStats.totalOrders || 1}
                color="#06b6d4"
                icon={<FiTruck />}
              />
              <StatusProgressBar
                label="Hoàn thành"
                value={dashboardStats.completedOrders || 0}
                total={dashboardStats.totalOrders || 1}
                color="#10b981"
                icon={<FiCheckCircle />}
              />
              <StatusProgressBar
                label="Đã hủy"
                value={dashboardStats.cancelledOrders || 0}
                total={dashboardStats.totalOrders || 1}
                color="#ef4444"
                icon={<FiXCircle />}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Thanh toán & Hủy đơn */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thanh toán */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FiCreditCard className="mr-2 text-green-500" /> Thanh toán
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span className="text-sm text-slate-600">Đã thanh toán</span>
                </div>
                <span className="font-bold text-green-600">{dashboardStats.paidOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <FiClock className="text-amber-500 mr-2" />
                  <span className="text-sm text-slate-600">Chưa thanh toán</span>
                </div>
                <span className="font-bold text-amber-600">{dashboardStats.unpaidOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <FiRotateCcw className="text-red-500 mr-2" />
                  <span className="text-sm text-slate-600">Hoàn tiền</span>
                </div>
                <span className="font-bold text-red-600">{dashboardStats.refundedOrders || 0}</span>
              </div>
            </div>
          </div>

          {/* Thống kê hủy đơn */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FiXCircle className="mr-2 text-red-500" /> Thống kê hủy đơn
            </h2>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-2">
                <span className="text-2xl font-bold text-red-600">
                  {(dashboardStats.cancellationRate || 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-slate-500">Tỷ lệ hủy đơn</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tổng đơn hủy</span>
                <span className="font-semibold text-red-600">
                  {dashboardStats.cancelledOrders || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Hủy hôm nay</span>
                <span className="font-semibold text-red-600">
                  {dashboardStats.cancelledOrdersToday || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Hủy tuần này</span>
                <span className="font-semibold text-red-600">
                  {dashboardStats.cancelledOrdersThisWeek || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Khuyến mãi & Điểm thưởng */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FiGift className="mr-2 text-purple-500" /> Khuyến mãi & Điểm
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sx text-purple-600 font-medium">Đơn dùng Coupon</span>
                  <span className="text-sm font-bold text-purple-700">
                    {dashboardStats.ordersWithCoupon || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sx text-slate-500">Tổng giảm giá</span>
                  <span className="text-sm font-semibold text-purple-600">
                    -{(dashboardStats.totalCouponDiscount || 0).toLocaleString()}đ
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sx text-orange-600 font-medium flex items-center">
                    <FiStar className="mr-1" /> Điểm đã sử dụng
                  </span>
                  <span className="text-sm font-bold text-orange-700">
                    {(dashboardStats.totalPointsUsed || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sx text-slate-500">Quy đổi giảm giá</span>
                  <span className="text-sm font-semibold text-orange-600">
                    -{(dashboardStats.totalPointsDiscount || 0).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Ghi chú nội bộ Admin */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <FiFileText className="mr-2 text-orange-400" /> Ghi chú nội bộ Admin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-slate-300 mb-1">Tổng đơn có ghi chú</p>
              <p className="text-2xl font-bold">{dashboardStats.ordersWithInternalNotes || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-slate-300 mb-1">Ghi chú mới hôm nay</p>
              <p className="text-2xl font-bold text-orange-400">
                {dashboardStats.newInternalNotesToday || 0}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-slate-300 mb-1">Ghi chú mới tuần này</p>
              <p className="text-2xl font-bold text-cyan-400">
                {dashboardStats.newInternalNotesThisWeek || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc nâng cao */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-50 border-none rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">Mọi trạng thái</option>
            {Object.values(ORDER_STATUS).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_CONFIG[s]?.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="bg-slate-50 border-none rounded-lg px-4 py-2 outline-none text-sm"
            onChange={(e) => setDateFilter((p) => ({ ...p, from: e.target.value }))}
          />
          <input
            type="date"
            className="bg-slate-50 border-none rounded-lg px-4 py-2 outline-none text-sm"
            onChange={(e) => setDateFilter((p) => ({ ...p, to: e.target.value }))}
          />
        </div>
      </div>

      {/* Table Danh sách */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {ordersLoading ? (
          <div className="p-20 flex justify-center">
            <SpinnerCube />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">Đơn hàng</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold">Thanh toán</th>
                  <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-center">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">#{order.orderCode}</div>
                      <div className="text-sx text-slate-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.receiverName}</div>
                      <div className="text-sx text-slate-500">{order.receiverPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-orange-600">
                        {order.finalAmount?.toLocaleString()}đ
                      </div>
                      <Tag
                        color={order.paymentStatus === "PAID" ? "green" : "gold"}
                        className="text-[10px] m-0">
                        {order.paymentMethod} -{" "}
                        {order.paymentStatus === "PAID" ? "ĐÃ THU" : "CHƯA THU"}
                      </Tag>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-sx font-bold ${
                          ORDER_STATUS_CONFIG[order.status]?.bgColor
                        } ${ORDER_STATUS_CONFIG[order.status]?.color}`}>
                        {ORDER_STATUS_CONFIG[order.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Tooltip title="Xem đối soát chi tiết">
                          <button
                            onClick={() => handleOpenDetail(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FiEye size={18} />
                          </button>
                        </Tooltip>
                        {order.status === "CANCELLED" ? (
                          <Tooltip title="Khôi phục đơn hàng">
                            <button
                              onClick={() => handleRestoreOrder(order)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <FiRotateCcw size={18} />
                            </button>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Hủy đơn (Admin)">
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <FiTrash2 size={18} />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-6 border-t border-slate-100 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalElements}
            onChange={(p) => setCurrentPage(p)}
            onShowSizeChange={(_, newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      </div>

      {/* Modal Chi tiết đơn hàng cho Admin */}
      <AdminOrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateInternalNote={handleUpdateInternalNote}
      />
    </div>
  );
};

// Helper Sub-components
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center transition-transform hover:scale-[1.02]">
    <div className={`${color} p-4 rounded-xl text-white mr-4 shadow-lg shadow-slate-100`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-sx font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  </div>
);

const MiniStatCard = ({ title, value, icon, color, bgColor }) => (
  <div className={`${bgColor} p-4 rounded-xl transition-transform hover:scale-[1.02]`}>
    <div className="flex items-center mb-2">
      {React.cloneElement(icon, { className: `${color} mr-2`, size: 16 })}
      <span className="text-sx font-medium text-slate-600">{title}</span>
    </div>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

const StatusProgressBar = ({ label, value, total, color, icon }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}>
        {React.cloneElement(icon, { size: 16, style: { color } })}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-slate-600">{label}</span>
          <span className="text-sm font-bold" style={{ color }}>
            {value}
          </span>
        </div>
        <Progress
          percent={percent}
          showInfo={false}
          strokeColor={color}
          trailColor="#e2e8f0"
          size="small"
        />
      </div>
    </div>
  );
};

export default AdminOrders;
