import React, { useState, useEffect, useCallback } from "react";
import {
  getCouponDashboardApi,
  filterCouponsApi,
  getCouponPerformanceApi,
  activateCouponApi,
  deactivateCouponApi,
  deleteCouponApi,
  createCouponApi,
  updateCouponApi,
} from "../../services/api/couponAdminApi";
import CouponStatisticsCards from "./promotions/CouponStatisticsCards";
import CouponUsageTrendChart from "./promotions/CouponUsageTrendChart";
import CouponDistributionChart from "./promotions/CouponDistributionChart";
import TopCouponsTable from "./promotions/TopCouponsTable";
import TopCouponUsersTable from "./promotions/TopCouponUsersTable";
import CouponListTable from "./promotions/CouponListTable";
import CouponDetailModal from "./promotions/CouponDetailModal";
import CouponFormModal from "./promotions/CouponFormModal";

/**
 * Trang quản lý khuyến mãi - Admin Dashboard
 * Hiển thị thống kê, biểu đồ và danh sách mã giảm giá
 */
const AdminPromotions = () => {
  // State cho dashboard data
  const [dashboardData, setDashboardData] = useState({
    statistics: null,
    topCouponsByUsage: [],
    topCouponsByDiscount: [],
    usageTrend30Days: [],
    topUsersByCouponUsage: [],
  });

  // State cho danh sách coupon
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 20,
  });

  // State loading
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // State cho modal chi tiết
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State cho modal tạo/sửa coupon
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const response = await getCouponDashboardApi();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dashboard:", error);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // Fetch coupon list
  const fetchCoupons = useCallback(async (filters = {}, page = 0) => {
    setLoadingCoupons(true);
    try {
      const response = await filterCouponsApi({ ...filters, page, size: 20 });
      if (response.success && response.data) {
        const pageData = response.data;
        setCoupons(pageData.content || []);
        setPagination({
          currentPage: pageData.number || 0,
          totalPages: pageData.totalPages || 0,
          totalElements: pageData.totalElements || 0,
          pageSize: pageData.size || 20,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách coupon:", error);
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  // Xem chi tiết coupon
  const handleViewDetail = async (coupon) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const response = await getCouponPerformanceApi(coupon.couponId);
      if (response.success && response.data) {
        setSelectedCoupon(response.data);
      } else {
        setSelectedCoupon(coupon);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết coupon:", error);
      setSelectedCoupon(coupon);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Đóng modal chi tiết
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCoupon(null);
  };

  // Mở modal tạo coupon mới
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setIsFormModalOpen(true);
  };

  // Mở modal sửa coupon
  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setIsFormModalOpen(true);
  };

  // Đóng modal form
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCoupon(null);
  };

  // Lưu coupon (tạo mới hoặc cập nhật)
  const handleSaveCoupon = async (couponData) => {
    setSavingCoupon(true);
    try {
      let response;
      if (editingCoupon) {
        response = await updateCouponApi(editingCoupon.couponId, couponData);
      } else {
        response = await createCouponApi(couponData);
      }
      if (response.success) {
        handleCloseFormModal();
        fetchCoupons();
        fetchDashboardData();
      } else {
        console.error("Lỗi khi lưu coupon:", response.error);
      }
    } catch (error) {
      console.error("Lỗi khi lưu coupon:", error);
    } finally {
      setSavingCoupon(false);
    }
  };

  // Kích hoạt coupon
  const handleActivateCoupon = async (couponId) => {
    try {
      const response = await activateCouponApi(couponId);
      if (response.success) {
        fetchCoupons();
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Lỗi khi kích hoạt coupon:", error);
    }
  };

  // Vô hiệu hóa coupon
  const handleDeactivateCoupon = async (couponId) => {
    try {
      const response = await deactivateCouponApi(couponId);
      if (response.success) {
        fetchCoupons();
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Lỗi khi vô hiệu hóa coupon:", error);
    }
  };

  // Xóa coupon
  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    try {
      const response = await deleteCouponApi(couponId);
      if (response.success) {
        fetchCoupons();
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Lỗi khi xóa coupon:", error);
    }
  };

  // Xử lý filter
  const handleFilter = (filters) => {
    fetchCoupons(filters, 0);
  };

  // Xử lý phân trang
  const handlePageChange = (page) => {
    fetchCoupons({}, page);
  };

  // Fetch data khi component mount
  useEffect(() => {
    fetchDashboardData();
    fetchCoupons();
  }, [fetchDashboardData, fetchCoupons]);

  // Tabs configuration
  const tabs = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      ),
    },
    {
      id: "coupons",
      label: "Danh sách mã",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Phân tích",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi và quản lý chương trình mã giảm giá</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchDashboardData();
              fetchCoupons();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Làm mới
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-sm text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Tạo mã mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <CouponStatisticsCards statistics={dashboardData.statistics} loading={loadingDashboard} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Usage Trend Chart - 2 cols */}
            <div className="lg:col-span-2">
              <CouponUsageTrendChart
                trendData={dashboardData.usageTrend30Days}
                loading={loadingDashboard}
              />
            </div>

            {/* Top Users - 1 col */}
            <div className="lg:col-span-1 h-full">
              <TopCouponUsersTable
                topUsers={dashboardData.topUsersByCouponUsage}
                loading={loadingDashboard}
              />
            </div>
          </div>

          {/* Top Coupons */}
          <TopCouponsTable
            topByUsage={dashboardData.topCouponsByUsage}
            topByDiscount={dashboardData.topCouponsByDiscount}
            loading={loadingDashboard}
          />
        </div>
      )}

      {activeTab === "coupons" && (
        <CouponListTable
          coupons={coupons}
          loading={loadingCoupons}
          pagination={pagination}
          onFilter={handleFilter}
          onPageChange={handlePageChange}
          onViewDetail={handleViewDetail}
          onEdit={handleOpenEditModal}
          onActivate={handleActivateCoupon}
          onDeactivate={handleDeactivateCoupon}
          onDelete={handleDeleteCoupon}
        />
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Distribution Charts */}
          <CouponDistributionChart
            statistics={dashboardData.statistics}
            loading={loadingDashboard}
          />

          {/* Usage Trend - Full width */}
          <CouponUsageTrendChart
            trendData={dashboardData.usageTrend30Days}
            loading={loadingDashboard}
          />

          {/* Top Coupons */}
          <TopCouponsTable
            topByUsage={dashboardData.topCouponsByUsage}
            topByDiscount={dashboardData.topCouponsByDiscount}
            loading={loadingDashboard}
          />
        </div>
      )}

      {/* Detail Modal */}
      <CouponDetailModal
        coupon={selectedCoupon}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />

      {/* Form Modal */}
      <CouponFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveCoupon}
        coupon={editingCoupon}
        loading={savingCoupon}
      />
    </div>
  );
};

export default AdminPromotions;
