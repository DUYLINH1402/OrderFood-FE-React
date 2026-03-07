import { publicClient } from "../apiClient";

/**
 * Lấy thông tin nhà hàng từ API
 * @returns {Promise<Object|null>} Thông tin nhà hàng hoặc null nếu lỗi
 */
export const getRestaurantInfoFromSQL = async () => {
  try {
    const response = await publicClient.get("/api/v1/public/restaurant");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin nhà hàng:", error);
    return null;
  }
};
