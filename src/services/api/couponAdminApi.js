import apiClient from "../apiClient";

// Base URL theo Backend API mới
const BASE_URL = "/api/v1/admin/coupons";

// ============ QUẢN LÝ COUPON CƠ BẢN (CRUD) ============

/**
 * API tạo mới coupon
 * POST /api/admin/coupons
 */
export const createCouponApi = async (couponData) => {
  try {
    const res = await apiClient.post(BASE_URL, couponData);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi tạo coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API cập nhật coupon
 * PUT /api/admin/coupons/{id}
 */
export const updateCouponApi = async (id, couponData) => {
  try {
    const res = await apiClient.put(`${BASE_URL}/${id}`, couponData);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi cập nhật coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API xóa coupon (soft delete)
 * DELETE /api/admin/coupons/{id}
 */
export const deleteCouponApi = async (id) => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi xóa coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy chi tiết coupon theo ID
 * GET /api/admin/coupons/{id}
 */
export const getCouponByIdApi = async (id) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/${id}`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy danh sách tất cả coupon với phân trang
 * GET /api/admin/coupons
 */
export const getAllCouponsApi = async ({
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortDir = "desc",
} = {}) => {
  try {
    const res = await apiClient.get(BASE_URL, {
      params: { page, size, sortBy, sortDir },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy danh sách coupon theo trạng thái
 * GET /api/admin/coupons/status/{status}
 */
export const getCouponsByStatusApi = async (status) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/status/${status}`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy coupon theo trạng thái:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ QUẢN LÝ TRẠNG THÁI COUPON ============

/**
 * API kích hoạt coupon
 * PUT /api/admin/coupons/{id}/activate
 */
export const activateCouponApi = async (id) => {
  try {
    await apiClient.put(`${BASE_URL}/${id}/activate`);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi kích hoạt coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API vô hiệu hóa coupon
 * PUT /api/admin/coupons/{id}/deactivate
 */
export const deactivateCouponApi = async (id) => {
  try {
    await apiClient.put(`${BASE_URL}/${id}/deactivate`);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi vô hiệu hóa coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API cập nhật trạng thái coupon hết hạn (manual trigger)
 * PUT /api/admin/coupons/update-expired
 */
export const updateExpiredCouponsApi = async () => {
  try {
    await apiClient.put(`${BASE_URL}/update-expired`);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi cập nhật coupon hết hạn:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API cập nhật trạng thái coupon hết lượt sử dụng (manual trigger)
 * PUT /api/admin/coupons/update-used-out
 */
export const updateUsedOutCouponsApi = async () => {
  try {
    await apiClient.put(`${BASE_URL}/update-used-out`);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi cập nhật coupon hết lượt:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ THỐNG KÊ TỔNG QUAN ============

/**
 * API lấy thống kê tổng quan về coupon
 * GET /api/admin/coupons/statistics
 */
export const getCouponStatisticsApi = async () => {
  try {
    const res = await apiClient.get(`${BASE_URL}/statistics`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API thống kê coupon theo trạng thái (đếm số lượng)
 * GET /api/admin/coupons/statistics/by-status
 */
export const getCouponStatisticsByStatusApi = async () => {
  try {
    const res = await apiClient.get(`${BASE_URL}/statistics/by-status`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê theo trạng thái:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy top coupon được sử dụng nhiều nhất
 * GET /api/admin/coupons/most-used?limit=10
 */
export const getMostUsedCouponsApi = async (limit = 10) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/most-used`, {
      params: { limit },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy coupon sử dụng nhiều:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy danh sách coupon sắp hết hạn
 * GET /api/admin/coupons/expiring-soon?days=7
 */
export const getExpiringSoonCouponsApi = async (days = 7) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/expiring-soon`, {
      params: { days },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy coupon sắp hết hạn:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ PHÂN TÍCH SỬ DỤNG ============

/**
 * API phân tích việc sử dụng coupon trong khoảng thời gian
 * GET /api/admin/coupons/analytics?startDate=...&endDate=...
 */
export const getCouponAnalyticsApi = async (startDate, endDate) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/analytics`, {
      params: { startDate, endDate },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy phân tích coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy xu hướng sử dụng coupon theo ngày
 * GET /api/admin/coupons/trend?startDate=...&endDate=...
 */
export const getCouponTrendApi = async (startDate, endDate) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/trend`, {
      params: { startDate, endDate },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy xu hướng coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ HIỆU SUẤT COUPON ============

/**
 * API lấy hiệu suất của một coupon cụ thể
 * GET /api/admin/coupons/{couponId}/performance
 */
export const getCouponPerformanceApi = async (couponId) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/${couponId}/performance`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy hiệu suất coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy top coupon hiệu quả nhất
 * GET /api/admin/coupons/top?criteria=USAGE&limit=10
 * @param {string} criteria - USAGE (số lần dùng) hoặc DISCOUNT (tổng tiền giảm)
 * @param {number} limit - Số lượng kết quả
 */
export const getTopCouponsApi = async (criteria = "USAGE", limit = 10) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/top`, {
      params: { criteria, limit },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy top coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ BÁO CÁO THEO USER ============

/**
 * API lấy thống kê sử dụng coupon của một user
 * GET /api/admin/coupons/users/{userId}
 */
export const getUserCouponUsageApi = async (userId) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/users/${userId}`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê coupon của user:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API lấy top user sử dụng coupon nhiều nhất
 * GET /api/admin/coupons/users/top?limit=10
 */
export const getTopUsersByCouponApi = async (limit = 10) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/users/top`, {
      params: { limit },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy top user sử dụng coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ LỌC VÀ TÌM KIẾM ============

/**
 * API lọc danh sách coupon với nhiều tiêu chí
 * GET /api/admin/coupons/filter?status=ACTIVE&type=PUBLIC&keyword=...
 */
export const filterCouponsApi = async ({ status, type, keyword, page = 0, size = 20 }) => {
  try {
    const params = { page, size };
    if (status) params.status = status;
    if (type) params.type = type;
    if (keyword) params.keyword = keyword;

    const res = await apiClient.get(`${BASE_URL}/filter`, { params });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lọc coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ DASHBOARD TỔNG HỢP ============

/**
 * API lấy dashboard tổng hợp cho quản lý coupon
 * GET /api/admin/coupons/dashboard
 */
export const getCouponDashboardApi = async () => {
  try {
    const res = await apiClient.get(`${BASE_URL}/dashboard`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy dashboard coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ SYSTEM MAINTENANCE ============

/**
 * API chạy tất cả scheduled tasks ngay lập tức (manual trigger)
 * POST /api/admin/coupons/run-maintenance
 */
export const runMaintenanceTasksApi = async () => {
  try {
    const res = await apiClient.post(`${BASE_URL}/run-maintenance`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi chạy bảo trì:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ ADVANCED REPORTS ============

/**
 * API lấy báo cáo chi tiết theo khoảng thời gian
 * GET /api/admin/coupons/detailed-report?startDate=...&endDate=...
 */
export const getDetailedReportApi = async (startDate, endDate) => {
  try {
    const res = await apiClient.get(`${BASE_URL}/detailed-report`, {
      params: { startDate, endDate },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo chi tiết:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

// ============ INTERNAL API (CHO ORDER SERVICE) ============

/**
 * API xác nhận sử dụng coupon (được gọi từ Order Service)
 * POST /api/admin/coupons/confirm-usage
 */
export const confirmCouponUsageApi = async ({ couponCode, userId, orderId, discountAmount }) => {
  try {
    await apiClient.post(`${BASE_URL}/confirm-usage`, null, {
      params: { couponCode, userId, orderId, discountAmount },
    });
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi xác nhận sử dụng coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};

/**
 * API hủy sử dụng coupon (khi đơn hàng bị hủy)
 * DELETE /api/admin/coupons/usage/{usageId}
 */
export const cancelCouponUsageApi = async (usageId) => {
  try {
    await apiClient.delete(`${BASE_URL}/usage/${usageId}`);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi hủy sử dụng coupon:", error);
    return { success: false, error: error.response?.data?.message || "Có lỗi xảy ra" };
  }
};
