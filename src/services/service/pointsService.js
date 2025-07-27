import apiClient from "../apiClient";

/**
 * Lấy thông tin điểm thưởng của user hiện tại (BE lấy userId từ token)
 * @returns {Promise} Promise chứa thông tin điểm thưởng
 */
export const getUserPoints = async () => {
  try {
    // Truyền token qua header (apiClient đã tự động thêm nếu có)
    const response = await apiClient.get("/api/points/current");
    return response.data;
  } catch (error) {
    console.error("Error fetching user points:", error);
    throw error;
  }
};

/**
 * Sử dụng điểm thưởng trong đơn hàng
 * @param {Object} pointsData - Dữ liệu sử dụng điểm
 * @returns {Promise} Promise chứa kết quả
 */
export const usePointsForOrder = async (pointsData) => {
  try {
    const response = await apiClient.post("/points/use", pointsData);
    return response.data;
  } catch (error) {
    console.error("Error using points for order:", error);
    throw error;
  }
};

/**
 * Lấy lịch sử điểm thưởng
 * @param {string} userId - ID của user
 * @param {Object} params - Tham số phân trang
 * @returns {Promise} Promise chứa lịch sử điểm thưởng
 */
/**
 * Lấy lịch sử điểm thưởng của user hiện tại (BE tự lấy userId từ token)
 * @param {Object} params - Tham số phân trang
 * @returns {Promise} Promise chứa lịch sử điểm thưởng
 */
export const getPointsHistory = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/points/history", { params });
    // Đảm bảo luôn trả về object có items là mảng
    if (Array.isArray(response.data)) {
      return { items: response.data, totalItems: response.data.length, totalPages: 1 };
    }
    console.warn("Unexpected response format for points history:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching points history:", error);
    throw error;
  }
};

/**
 * Tính toán điểm thưởng sẽ nhận được từ đơn hàng
 * @param {number} orderAmount - Tổng tiền đơn hàng
 * @returns {Promise} Promise chứa số điểm sẽ nhận được
 */
export const calculateEarnedPoints = async (orderAmount) => {
  try {
    const response = await apiClient.post("/points/calculate", { orderAmount });
    return response.data;
  } catch (error) {
    console.error("Error calculating earned points:", error);
    throw error;
  }
};

/**
 * Validate việc sử dụng điểm thưởng
 * @param {Object} validateData - Dữ liệu để validate
 * @returns {Promise} Promise chứa kết quả validate
 */
export const validatePointsUsage = async (validateData) => {
  try {
    const response = await apiClient.post("/points/validate", validateData);
    return response.data;
  } catch (error) {
    console.error("Error validating points usage:", error);
    throw error;
  }
};
