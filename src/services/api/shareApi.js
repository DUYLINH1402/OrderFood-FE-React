import apiClient, { publicClient } from "../apiClient";

/**
 * Lấy số lượt share của một đối tượng (API công khai, không cần đăng nhập)
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise} - Response chứa shareCount
 */
export const getShareCountApi = (targetType, targetId) => {
  return publicClient.get(`/api/v1/public/shares/${targetType}/${targetId}/count`);
};

/**
 * Ghi nhận lượt share lên mạng xã hội
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @param {string} platform - Nền tảng chia sẻ (FACEBOOK, TWITTER, ZALO, ...)
 * @returns {Promise} - Response xác nhận đã ghi nhận
 */
export const recordShareApi = (targetType, targetId, platform) => {
  return publicClient.post("/api/v1/public/shares", {
    targetType,
    targetId,
    platform,
  });
};
