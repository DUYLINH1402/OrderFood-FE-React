import { publicClient, apiClient } from "../apiClient";

// TẠO ĐƠN HÀNG - Hỗ trợ cả khách vãng lai và user đăng nhập
export const createOrderApi = async (payload) => {
  try {
    const response = await publicClient.post("/api/orders", payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });

    // Re-throw the error with more context
    const enhancedError = new Error(
      error.response?.data?.message || error.message || "Không thể tạo đơn hàng"
    );
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

// LẤY DANH SÁCH ĐƠN HÀNG CHO USER
export const getOrdersApi = async () => {
  try {
    const response = await apiClient.get("/api/orders");

    // Validate response
    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }

    // Safe data processing
    let processedData;
    try {
      processedData = Array.isArray(response.data)
        ? response.data
        : response.data.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];
    } catch (dataError) {
      console.error("Error processing response data:", dataError);
      processedData = [];
    }

    return {
      success: true,
      data: processedData,
      pagination: response.data.pagination || {
        page: response.data.page || 0,
        size: response.data.size || 10,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });

    return {
      success: false,
      message: error.response?.data?.message || error.message || "Không thể tải danh sách đơn hàng",
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
      },
    };
  }
};

// LẤY CHI TIẾT ĐƠN HÀNG
export const getOrderByIdApi = async (orderId) => {
  try {
    const response = await publicClient.get(`/api/orders/${orderId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải chi tiết đơn hàng",
    };
  }
};

// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
export const updateOrderStatusApi = async (orderId, statusData) => {
  try {
    const response = await publicClient.put(`/api/orders/${orderId}/status`, statusData);
    return {
      success: true,
      message: response.data.message || "Cập nhật trạng thái thành công",
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng",
    };
  }
};

// HỦY ĐƠN HÀNG
export const cancelOrderApi = async (orderId, cancelReason) => {
  try {
    const response = await publicClient.put(`/api/orders/${orderId}/cancel`, {
      cancelReason: cancelReason,
    });
    return {
      success: true,
      message: response.data.message || "Hủy đơn hàng thành công",
    };
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể hủy đơn hàng",
    };
  }
};

// LẤY THỐNG KÊ ĐƠN HÀNG
export const getOrderStatisticsApi = async () => {
  try {
    const response = await publicClient.get("/api/orders/statistics");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đơn hàng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thống kê đơn hàng",
    };
  }
};

// Default export object chứa tất cả các API functions
const orderApi = {
  createOrder: createOrderApi,
  getOrders: getOrdersApi,
  getOrderById: getOrderByIdApi,
  updateOrderStatus: updateOrderStatusApi,
  cancelOrder: cancelOrderApi,
  getOrderStatistics: getOrderStatisticsApi,
};

export default orderApi;
