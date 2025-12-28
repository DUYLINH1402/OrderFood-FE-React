import { apiClient } from "../apiClient";

/**
 * Admin Dashboard API - Dành cho admin xem thống kê tổng quan
 */

// Lấy thống kê tổng quan dashboard
export const getDashboardStatisticsApi = async () => {
  try {
    const response = await apiClient.get("/api/admin/dashboard/statistics");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê dashboard:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thống kê dashboard",
      data: null,
    };
  }
};

// Lấy doanh thu theo số ngày
export const getDashboardRevenueApi = async (days = 7) => {
  try {
    const response = await apiClient.get("/api/admin/dashboard/revenue", {
      params: { days },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải doanh thu",
      data: null,
    };
  }
};

// Lấy hoạt động gần đây
export const getDashboardActivitiesApi = async (limit = 10) => {
  try {
    const response = await apiClient.get("/api/admin/dashboard/activities", {
      params: { limit },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy hoạt động gần đây:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải hoạt động gần đây",
      data: null,
    };
  }
};

// Export default object
const adminDashboardApi = {
  getStatistics: getDashboardStatisticsApi,
  getRevenue: getDashboardRevenueApi,
  getActivities: getDashboardActivitiesApi,
};

export default adminDashboardApi;
