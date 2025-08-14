import {
  getAllStaffOrdersApi,
  getPendingOrdersApi,
  updateOrderStatusByStaffApi,
  searchOrderByCodeApi,
  getOrderByIdForStaffApi,
} from "../api/staffOrderApi";

import { transformApiOrderToFrontend } from "../../utils/orderUtils";

/**
 * Staff Order Service - Dịch vụ dành cho nhân viên quản lý đơn hàng
 */

// Lấy tất cả đơn hàng mà staff có thể xử lý
export const getAllStaffOrders = async (page = 0, size = 100) => {
  try {
    const result = await getAllStaffOrdersApi(page, size);

    if (result.success) {
      return {
        ...result,
        data: result.data.map((order) => transformApiOrderToFrontend(order)),
      };
    }

    return result;
  } catch (error) {
    console.error("Error in getAllStaffOrders service:", error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

// Lấy danh sách đơn hàng đang chờ xử lý
export const getStaffPendingOrders = async (page = 0, size = 20) => {
  try {
    const result = await getPendingOrdersApi(page, size);

    if (result.success) {
      return {
        ...result,
        data: result.data.map((order) => transformApiOrderToFrontend(order)),
      };
    }

    return result;
  } catch (error) {
    console.error("Error in getStaffPendingOrders service:", error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

// Lấy danh sách đơn hàng đang xử lý
export const getStaffProcessingOrders = async (page = 0, size = 20) => {
  try {
    const result = await getProcessingOrdersApi(page, size);

    if (result.success) {
      return {
        ...result,
        data: result.data.map((order) => transformApiOrderToFrontend(order)),
      };
    }

    return result;
  } catch (error) {
    console.error("Error in getStaffProcessingOrders service:", error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

// Cập nhật trạng thái đơn hàng (staff)
export const updateStaffOrderStatus = async (orderId, status, note = null) => {
  try {
    const statusRequest = {
      status: status,
      note: note,
    };

    const result = await updateOrderStatusByStaffApi(orderId, statusRequest);

    if (result.success) {
      return {
        ...result,
        data: transformApiOrderToFrontend(result.data),
      };
    }

    return result;
  } catch (error) {
    console.error("Error in updateStaffOrderStatus service:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Tìm kiếm đơn hàng theo mã
export const searchStaffOrderByCode = async (orderCode) => {
  try {
    const result = await searchOrderByCodeApi(orderCode);

    if (result.success && result.data) {
      return {
        ...result,
        data: transformApiOrderToFrontend(result.data),
      };
    }

    return result;
  } catch (error) {
    console.error("Error in searchStaffOrderByCode service:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
};

// Lấy chi tiết đơn hàng (staff)
export const getStaffOrderById = async (orderId) => {
  try {
    const result = await getOrderByIdForStaffApi(orderId);

    if (result.success && result.data) {
      return {
        ...result,
        data: transformApiOrderToFrontend(result.data),
      };
    }

    return result;
  } catch (error) {
    console.error("Error in getStaffOrderById service:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
};

// Export default object chứa tất cả các service functions
const staffOrderService = {
  getPendingOrders: getStaffPendingOrders,
  getProcessingOrders: getStaffProcessingOrders,
  updateOrderStatus: updateStaffOrderStatus,
  searchOrderByCode: searchStaffOrderByCode,
  getOrderById: getStaffOrderById,
};

export default staffOrderService;
