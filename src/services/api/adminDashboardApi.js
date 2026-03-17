import { apiClient } from "../apiClient";

/**
 * Admin Dashboard API - Dành cho admin xem thống kê tổng quan
 */

// Lấy thống kê tổng quan dashboard
export const getDashboardStatisticsApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/staff/dashboard/statistics");
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
    const response = await apiClient.get("/api/v1/staff/dashboard/revenue", {
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
    const response = await apiClient.get("/api/v1/staff/dashboard/activities", {
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

// Lấy thống kê nâng cao (AOV, tỷ lệ hủy, khách mới, điểm thưởng...)
export const getAdvancedStatisticsApi = async (period = 7) => {
  try {
    const response = await apiClient.get("/api/v1/staff/dashboard/advanced-statistics", {
      params: { period },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê nâng cao:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thống kê nâng cao",
      data: null,
    };
  }
};

// Lấy doanh thu theo danh mục món ăn
export const getRevenueByCategoryApi = async (period = 7) => {
  try {
    const response = await apiClient.get("/api/v1/staff/dashboard/revenue-by-category", {
      params: { period },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu theo danh mục:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải doanh thu theo danh mục",
      data: null,
    };
  }
};

// Lấy chi tiết hiệu quả món ăn (có phân trang)
export const getFoodPerformanceApi = async (period = 90, page = 0, size = 10) => {
  try {
    const response = await apiClient.get("/api/v1/staff/dashboard/food-performance", {
      params: { period, page, size },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy hiệu quả món ăn:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải hiệu quả món ăn",
      data: null,
    };
  }
};

// Lấy top món ăn bán chạy
export const getTopSellingFoodsApi = async (period = 90) => {
  try {
    const response = await apiClient.get("/api/v1/staff/dashboard/top-selling-foods", {
      params: { period },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy top món bán chạy:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải top món bán chạy",
      data: null,
    };
  }
};

// Export default object
const adminDashboardApi = {
  getStatistics: getDashboardStatisticsApi,
  getRevenue: getDashboardRevenueApi,
  getActivities: getDashboardActivitiesApi,
  getAdvancedStatistics: getAdvancedStatisticsApi,
  getRevenueByCategory: getRevenueByCategoryApi,
  getFoodPerformance: getFoodPerformanceApi,
  getTopSellingFoods: getTopSellingFoodsApi,
};

export default adminDashboardApi;
