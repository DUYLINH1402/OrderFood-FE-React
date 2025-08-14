const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";
import {
  createOrderApi,
  getOrdersApi,
  getOrderByIdApi,
  updateOrderStatusApi,
  cancelOrderApi,
  getOrderStatisticsApi,
} from "../api/orderApi";

// Import Firebase functions
import {
  createOrderFromFirebase,
  getOrdersFromFirebase,
  getOrderByIdFromFirebase,
  updateOrderStatusFromFirebase,
  cancelOrderFromFirebase,
  getOrderStatisticsFromFirebase,
} from "../firebase/orderFirebase";

// Import utility functions
import {
  transformApiOrderToFrontend,
  transformFirebaseOrderToFrontend,
  transformFrontendOrderToApi,
} from "../../utils/orderUtils";

// TẠO ĐƠN HÀNG
export const createOrder = async (payload) => {
  try {
    if (useFirebase) {
      return await createOrderFromFirebase(payload);
    } else {
      return await createOrderApi(payload);
    }
  } catch (error) {
    console.error("Error in createOrder service:", error);
    throw error;
  }
};

// LẤY DANH SÁCH ĐƠN HÀNG
export const getOrders = async () => {
  return useFirebase ? await getOrdersFromFirebase() : await getOrdersApi();
};

// LẤY CHI TIẾT ĐƠN HÀNG
export const getOrderById = async (orderId) => {
  try {
    const result = useFirebase
      ? await getOrderByIdFromFirebase(orderId)
      : await getOrderByIdApi(orderId);

    if (result.success) {
      return {
        ...result,
        data: useFirebase
          ? transformFirebaseOrderToFrontend(result.data)
          : transformApiOrderToFrontend(result.data),
      };
    }
    return result;
  } catch (error) {
    console.error("Error in getOrderById service:", error);
    return { success: false, message: error.message };
  }
};

// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    if (useFirebase) {
      return await updateOrderStatusFromFirebase(orderId, statusData);
    } else {
      return await updateOrderStatusApi(orderId, statusData);
    }
  } catch (error) {
    console.error("Error in updateOrderStatus service:", error);
    return { success: false, message: error.message };
  }
};

// HỦY ĐƠN HÀNG
export const cancelOrder = async (orderId, cancelReason) => {
  try {
    if (useFirebase) {
      return await cancelOrderFromFirebase(orderId, cancelReason);
    } else {
      return await cancelOrderApi(orderId, cancelReason);
    }
  } catch (error) {
    console.error("Error in cancelOrder service:", error);
    return { success: false, message: error.message };
  }
};

// LẤY THỐNG KÊ ĐƠN HÀNG
export const getOrderStatistics = async (userId) => {
  try {
    if (useFirebase) {
      return await getOrderStatisticsFromFirebase(userId);
    } else {
      return await getOrderStatisticsApi();
    }
  } catch (error) {
    console.error("Error in getOrderStatistics service:", error);
    return { success: false, message: error.message };
  }
};
