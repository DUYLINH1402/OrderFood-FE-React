import apiClient from "../apiClient";

const BASE_URL = "/api/v1/admin/promotions/coupons";

/**
 * API lấy thống kê tổng quan về coupon
 * GET /api/v1/admin/promotions/coupons/statistics
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
 * API phân tích việc sử dụng coupon trong khoảng thời gian
 * GET /api/v1/admin/promotions/coupons/analytics?startDate=...&endDate=...
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
 * GET /api/v1/admin/promotions/coupons/trend?startDate=...&endDate=...
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

/**
 * API lấy hiệu suất của một coupon cụ thể
 * GET /api/v1/admin/promotions/coupons/{couponId}/performance
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
 * GET /api/v1/admin/promotions/coupons/top?criteria=USAGE&limit=10
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

/**
 * API lấy thống kê sử dụng coupon của một user
 * GET /api/v1/admin/promotions/coupons/users/{userId}
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
 * GET /api/v1/admin/promotions/coupons/users/top?limit=10
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

/**
 * API lọc danh sách coupon với nhiều tiêu chí
 * GET /api/v1/admin/promotions/coupons/filter?status=ACTIVE&type=PUBLIC&keyword=...
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

/**
 * API lấy dashboard tổng hợp cho quản lý coupon
 * GET /api/v1/admin/promotions/coupons/dashboard
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
