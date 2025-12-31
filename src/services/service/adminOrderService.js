/**
 * Admin Order Service - Dịch vụ quản lý đơn hàng dành cho Admin
 * Bao gồm đầy đủ các chức năng: lọc, thống kê, hủy đơn, ghi chú nội bộ, khôi phục...
 */

import {
  getAllAdminOrdersApi,
  getOrderStatisticsApi,
  updateOrderStatusByAdminApi,
  deleteOrderApi,
  restoreOrderApi,
  getOrderFullDetailsApi,
  advancedSearchOrdersApi,
  updateInternalNoteApi,
  cancelOrderWithReasonApi,
  getDashboardStatsApi,
} from "../api/adminOrderApi";

/**
 * Lấy tất cả đơn hàng với bộ lọc đa dạng
 * @param {Object} params - Tham số lọc
 * @param {string} params.status - Trạng thái đơn hàng (all, PENDING, CONFIRMED, ...)
 * @param {number} params.page - Số trang (bắt đầu từ 0)
 * @param {number} params.size - Số lượng mỗi trang
 * @param {string} params.sortBy - Sắp xếp theo trường (createdAt, finalAmount, ...)
 * @param {string} params.sortDir - Hướng sắp xếp (asc, desc)
 * @param {string} params.orderCode - Mã đơn hàng
 * @param {string} params.customerName - Tên khách hàng
 * @param {string} params.startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} params.endDate - Ngày kết thúc (YYYY-MM-DD)
 */
export const getAllAdminOrders = async (params = {}) => {
  try {
    const response = await getAllAdminOrdersApi(params);
    return response;
  } catch (error) {
    console.error("Error in getAllAdminOrders service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi tải đơn hàng",
      data: null,
    };
  }
};

/**
 * Lấy thống kê đơn hàng tổng quan
 * @param {Object} params - Tham số thống kê
 * @param {string} params.startDate - Ngày bắt đầu
 * @param {string} params.endDate - Ngày kết thúc
 * @param {string} params.period - Khoảng thời gian (day, week, month, year)
 */
export const getOrderStatistics = async (params = {}) => {
  try {
    const response = await getOrderStatisticsApi(params);
    return response;
  } catch (error) {
    console.error("Error in getOrderStatistics service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi lấy thống kê",
      data: null,
    };
  }
};

/**
 * Cập nhật trạng thái đơn hàng với quyền cao nhất (Admin)
 * @param {number} orderId - ID đơn hàng
 * @param {Object} statusRequest - Dữ liệu cập nhật
 * @param {string} statusRequest.status - Trạng thái mới
 * @param {string} statusRequest.note - Ghi chú (tùy chọn)
 */
export const updateOrderStatusByAdmin = async (orderId, statusRequest) => {
  try {
    const response = await updateOrderStatusByAdminApi(orderId, statusRequest);
    return response;
  } catch (error) {
    console.error("Error in updateOrderStatusByAdmin service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi cập nhật trạng thái",
      data: null,
    };
  }
};

/**
 * Xóa đơn hàng (soft delete)
 * @param {number} orderId - ID đơn hàng
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await deleteOrderApi(orderId);
    return response;
  } catch (error) {
    console.error("Error in deleteOrder service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi xóa đơn hàng",
    };
  }
};

/**
 * Khôi phục đơn hàng đã hủy
 * @param {number} orderId - ID đơn hàng
 */
export const restoreOrder = async (orderId) => {
  try {
    const response = await restoreOrderApi(orderId);
    return response;
  } catch (error) {
    console.error("Error in restoreOrder service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi khôi phục đơn hàng",
      data: null,
    };
  }
};

/**
 * Lấy chi tiết đơn hàng với thông tin đầy đủ
 * @param {number} orderId - ID đơn hàng
 */
export const getOrderFullDetails = async (orderId) => {
  try {
    const response = await getOrderFullDetailsApi(orderId);
    return response;
  } catch (error) {
    console.error("Error in getOrderFullDetails service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi lấy chi tiết đơn hàng",
      data: null,
    };
  }
};

/**
 * Tìm kiếm đơn hàng nâng cao
 * @param {Object} params - Tham số tìm kiếm
 * @param {string} params.keyword - Từ khóa tìm kiếm
 * @param {string} params.status - Trạng thái
 * @param {string} params.customerEmail - Email khách hàng
 * @param {string} params.customerPhone - SĐT khách hàng
 * @param {number} params.minAmount - Giá trị tối thiểu
 * @param {number} params.maxAmount - Giá trị tối đa
 * @param {number} params.page - Số trang
 * @param {number} params.size - Số lượng mỗi trang
 */
export const advancedSearchOrders = async (params = {}) => {
  try {
    const response = await advancedSearchOrdersApi(params);
    return response;
  } catch (error) {
    console.error("Error in advancedSearchOrders service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi tìm kiếm",
      data: null,
    };
  }
};

/**
 * Cập nhật ghi chú nội bộ (chỉ Admin mới thấy)
 * @param {number} orderId - ID đơn hàng
 * @param {string} internalNote - Nội dung ghi chú
 */
export const updateInternalNote = async (orderId, internalNote) => {
  try {
    const response = await updateInternalNoteApi(orderId, { internalNote });
    return response;
  } catch (error) {
    console.error("Error in updateInternalNote service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi cập nhật ghi chú",
      data: null,
    };
  }
};

/**
 * Hủy đơn hàng kèm lý do chi tiết
 * @param {number} orderId - ID đơn hàng
 * @param {string} cancelReason - Lý do hủy đơn
 */
export const cancelOrderWithReason = async (orderId, cancelReason) => {
  try {
    const response = await cancelOrderWithReasonApi(orderId, { cancelReason });
    return response;
  } catch (error) {
    console.error("Error in cancelOrderWithReason service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi hủy đơn hàng",
      data: null,
    };
  }
};

/**
 * Lấy thống kê chuyên sâu cho Dashboard Admin
 * Bao gồm: Doanh thu thực, Đơn bị hủy, Ghi chú mới...
 */
export const getDashboardStats = async () => {
  try {
    const response = await getDashboardStatsApi();
    return response;
  } catch (error) {
    console.error("Error in getDashboardStats service:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Lỗi khi lấy thống kê dashboard",
      data: null,
    };
  }
};
