const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getAllStaffOrdersApi,
  getPendingOrdersApi,
  getProcessingOrdersApi,
  updateOrderStatusByStaffApi,
  searchOrderByCodeApi,
  getOrderByIdForStaffApi,
} from "../api/staffOrderApi";

/**
 * Staff Order Service - Dịch vụ dành cho nhân viên quản lý đơn hàng
 */

// Lấy tất cả đơn hàng mà staff có thể xử lý
export const getAllStaffOrders = async (page, size) => {
  try {
    if (useFirebase) {
      return await getAllStaffOrdersFromFirebase(page, size);
    } else {
      return await getAllStaffOrdersApi(page, size);
    }
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
    if (useFirebase) {
      return await getPendingOrdersFromFirebase(page, size);
    } else {
      return await getPendingOrdersApi(page, size);
    }
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
    if (useFirebase) {
      return await getProcessingOrdersFromFirebase(page, size);
    } else {
      return await getProcessingOrdersApi(page, size);
    }
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
    if (useFirebase) {
      return await updateOrderStatusInFirebase(orderId, status, note);
    } else {
      const statusRequest = {
        status: status,
        note: note,
      };
      return await updateOrderStatusByStaffApi(orderId, statusRequest);
    }
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
    if (useFirebase) {
      return await searchOrderByCodeFromFirebase(orderCode);
    } else {
      return await searchOrderByCodeApi(orderCode);
    }
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
    if (useFirebase) {
      return await getOrderByIdFromFirebase(orderId);
    } else {
      return await getOrderByIdForStaffApi(orderId);
    }
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
  getAllOrders: getAllStaffOrders,
  getPendingOrders: getStaffPendingOrders,
  getProcessingOrders: getStaffProcessingOrders,
  updateOrderStatus: updateStaffOrderStatus,
  searchOrderByCode: searchStaffOrderByCode,
  getOrderById: getStaffOrderById,
};

export default staffOrderService;
