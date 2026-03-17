import apiClient, { publicClient } from "../apiClient";

/**
 * Lấy thông tin like của một đối tượng (số lượt like và trạng thái đã like của user)
 * API này cần token để xác định user hiện tại đã like chưa
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise} - Response chứa likeCount và hasLiked
 */
export const getLikeInfoApi = (targetType, targetId) => {
  return apiClient.get(`/api/v1/public/likes/${targetType}/${targetId}`);
};

/**
 * Lấy số lượt like của một đối tượng (API công khai, không cần đăng nhập)
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise} - Response chứa likeCount
 */
export const getLikeCountPublicApi = (targetType, targetId) => {
  return publicClient.get(`/api/v1/public/likes/${targetType}/${targetId}`);
};

/**
 * Kiểm tra user hiện tại đã like đối tượng chưa
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise} - Response chứa hasLiked (boolean)
 */
export const checkLikeStatusApi = (targetType, targetId) => {
  return apiClient.get(`/api/v1/client/likes/check/${targetType}/${targetId}`);
};

/**
 * Toggle like/unlike một đối tượng
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise} - Response chứa trạng thái mới
 */
export const toggleLikeApi = (targetType, targetId) => {
  return apiClient.post("/api/v1/client/likes/toggle", {
    targetType,
    targetId,
  });
};
