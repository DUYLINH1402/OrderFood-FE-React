import { apiClient } from "../apiClient";

/**
 * Staff Report API - Dành cho nhân viên xem báo cáo thống kê
 */

// Lấy thống kê đơn hàng trong khoảng thời gian
export const getOrderStatsByDateRangeApi = async (startDate, endDate) => {
  try {
    const response = await apiClient.get("/api/staff/orders/recent", {
      params: {
        page: 0,
        size: 1000, // Lấy nhiều để thống kê
        startDate,
        endDate,
      },
    });

    const orders = response.data.data || response.data.content || response.data || [];
    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đơn hàng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thống kê đơn hàng",
      data: [],
    };
  }
};

// Lấy tất cả đơn hàng gần đây để phân tích
export const getAllRecentOrdersApi = async (size = 500) => {
  try {
    const response = await apiClient.get("/api/staff/orders/recent", {
      params: { page: 0, size },
    });

    const orders = response.data.data || response.data.content || response.data || [];
    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng gần đây:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải đơn hàng",
      data: [],
    };
  }
};

// Export default object
const staffReportApi = {
  getOrderStatsByDateRange: getOrderStatsByDateRangeApi,
  getAllRecentOrders: getAllRecentOrdersApi,
};

export default staffReportApi;
