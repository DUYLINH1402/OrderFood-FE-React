import apiClient from "../apiClient";

/**
 * Admin Order API - Các hàm gọi API quản lý đơn hàng dành cho Admin
 * Dựa trên AdminOrderController.java từ Backend
 */

/**
 * Lấy tất cả đơn hàng với bộ lọc đa dạng
 * GET /api/admin/orders/all
 */
export const getAllAdminOrdersApi = async (params = {}) => {
  try {
    const {
      status = "all",
      page = 0,
      size = 10,
      sortBy = "createdAt",
      sortDir = "desc",
      orderCode,
      customerName,
      startDate,
      endDate,
    } = params;

    const response = await apiClient.get("/api/admin/orders/all", {
      params: {
        status,
        page,
        size,
        sortBy,
        sortDir,
        orderCode,
        customerName,
        startDate,
        endDate,
      },
    });
    console.log("getAllAdminOrdersApi response:", response);

    return {
      success: true,
      data: response.data,
      message: "Lấy danh sách đơn hàng thành công",
    };
  } catch (error) {
    console.error("Error in getAllAdminOrdersApi:", error);
    throw error;
  }
};

/**
 * Lấy thống kê đơn hàng tổng quan
 * GET /api/admin/orders/statistics
 */
export const getOrderStatisticsApi = async (params = {}) => {
  try {
    const { startDate, endDate, period } = params;

    const response = await apiClient.get("/api/admin/orders/statistics", {
      params: { startDate, endDate, period },
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in getOrderStatisticsApi:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn hàng với quyền cao nhất (Admin)
 * PUT /api/admin/orders/{orderId}/status
 */
export const updateOrderStatusByAdminApi = async (orderId, statusRequest) => {
  try {
    const response = await apiClient.put(`/api/admin/orders/${orderId}/status`, statusRequest);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in updateOrderStatusByAdminApi:", error);
    throw error;
  }
};

/**
 * Xóa đơn hàng (soft delete)
 * DELETE /api/admin/orders/{orderId}
 */
export const deleteOrderApi = async (orderId) => {
  try {
    const response = await apiClient.delete(`/api/admin/orders/${orderId}`);

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in deleteOrderApi:", error);
    throw error;
  }
};

/**
 * Khôi phục đơn hàng đã hủy
 * POST /api/admin/orders/{orderId}/restore
 */
export const restoreOrderApi = async (orderId) => {
  try {
    const response = await apiClient.post(`/api/admin/orders/${orderId}/restore`);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in restoreOrderApi:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn hàng với thông tin đầy đủ
 * GET /api/admin/orders/{orderId}/details
 */
export const getOrderFullDetailsApi = async (orderId) => {
  try {
    const response = await apiClient.get(`/api/admin/orders/${orderId}/details`);
    console.log("getOrderFullDetailsApi response:", response);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in getOrderFullDetailsApi:", error);
    throw error;
  }
};

/**
 * Tìm kiếm đơn hàng nâng cao
 * GET /api/admin/orders/advanced-search
 */
export const advancedSearchOrdersApi = async (params = {}) => {
  try {
    const {
      keyword,
      status,
      customerEmail,
      customerPhone,
      minAmount,
      maxAmount,
      page = 0,
      size = 10,
    } = params;

    const response = await apiClient.get("/api/admin/orders/advanced-search", {
      params: {
        keyword,
        status,
        customerEmail,
        customerPhone,
        minAmount,
        maxAmount,
        page,
        size,
      },
    });

    return {
      success: true,
      data: response.data,
      message: "Tìm kiếm đơn hàng thành công",
    };
  } catch (error) {
    console.error("Error in advancedSearchOrdersApi:", error);
    throw error;
  }
};

/**
 * Cập nhật ghi chú nội bộ (internal_note)
 * PUT /api/admin/orders/{orderId}/internal-note
 */
export const updateInternalNoteApi = async (orderId, noteRequest) => {
  try {
    const response = await apiClient.put(`/api/admin/orders/${orderId}/internal-note`, noteRequest);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in updateInternalNoteApi:", error);
    throw error;
  }
};

/**
 * Hủy đơn hàng kèm lý do chi tiết
 * POST /api/admin/orders/{orderId}/cancel
 */
export const cancelOrderWithReasonApi = async (orderId, cancelRequest) => {
  try {
    const response = await apiClient.post(`/api/admin/orders/${orderId}/cancel`, cancelRequest);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in cancelOrderWithReasonApi:", error);
    throw error;
  }
};

/**
 * Thống kê chuyên sâu cho Dashboard Admin
 * GET /api/admin/orders/dashboard-stats
 */
export const getDashboardStatsApi = async () => {
  try {
    const response = await apiClient.get("/api/admin/orders/dashboard-stats");

    console.log("getDashboardStatsApi response:", response);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error in getDashboardStatsApi:", error);
    throw error;
  }
};
