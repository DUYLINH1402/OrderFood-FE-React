import { apiClient } from "../apiClient";

/**
 * Staff Order API - Dành cho nhân viên quản lý đơn hàng
 */

// Lấy tất cả đơn hàng mà staff có thể xử lý (tất cả trạng thái từ PROCESSING trở đi)
export const getAllStaffOrdersApi = async (page, size) => {
  try {
    let response;
    try {
      response = await apiClient.get("/api/staff/orders/recent", {
        params: { page: page || 0, size: size || 7 },
      });
    } catch (error) {
      console.error("Lỗi khi lấy tất cả đơn hàng:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi lấy tất cả đơn hàng",
        data: [],
      };
    }

    return {
      success: true,
      data: response.data.data || response.data.content || response.data || [],
      pagination: response.data.pagination || {
        page,
        size,
        total: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đơn hàng staff:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách đơn hàng",
      data: [],
    };
  }
};

// Lấy danh sách đơn hàng đang chờ xử lý (PROCESSING - chờ xác nhận)
export const getPendingOrdersApi = async (page = 0, size = 20) => {
  try {
    const response = await apiClient.get("/api/staff/orders/need-confirmation", {
      params: { page, size },
    });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page,
        size,
        total: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng đang chờ:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách đơn hàng đang chờ",
      data: [],
    };
  }
};

// Lấy danh sách đơn hàng đang xử lý (PROCESSING)
export const getProcessingOrdersApi = async (page = 0, size = 20) => {
  try {
    const response = await apiClient.get("/api/staff/orders/processing", {
      params: { page, size },
    });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page,
        size,
        total: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng đang xử lý:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách đơn hàng đang xử lý",
      data: [],
    };
  }
};

// Cập nhật trạng thái đơn hàng (dành cho staff)
export const updateOrderStatusByStaffApi = async (orderId, statusRequest) => {
  try {
    const response = await apiClient.put(`/api/staff/orders/${orderId}/status`, statusRequest);
    return {
      success: true,
      data: response.data.data,
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

// Tìm kiếm đơn hàng theo mã đơn hàng
export const searchOrderByCodeApi = async (orderCode) => {
  try {
    const response = await apiClient.get(`/api/staff/orders/${orderCode}`);
    console.log("Tìm kiếm đơn hàng:", response.data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Tìm kiếm thành công",
    };
  } catch (error) {
    console.error("Lỗi khi tìm kiếm đơn hàng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không tìm thấy đơn hàng",
      data: null,
    };
  }
};

// Lấy chi tiết đơn hàng (staff)
export const getOrderByIdForStaffApi = async (orderId) => {
  try {
    const response = await apiClient.get(`/api/staff/orders/${orderId}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Lấy chi tiết thành công",
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải chi tiết đơn hàng",
      data: null,
    };
  }
};

// Export default object chứa tất cả các API functions
const staffOrderApi = {
  getAllOrders: getAllStaffOrdersApi,
  getPendingOrders: getPendingOrdersApi,
  updateOrderStatus: updateOrderStatusByStaffApi,
  searchOrderByCode: searchOrderByCodeApi,
  getOrderById: getOrderByIdForStaffApi,
};

export default staffOrderApi;
