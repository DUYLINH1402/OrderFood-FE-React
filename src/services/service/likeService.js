const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getLikeInfoApi,
  getLikeCountPublicApi,
  checkLikeStatusApi,
  toggleLikeApi,
} from "../api/likeApi";
import { getToken } from "../auth/authApi";

// Định nghĩa các loại target type
export const TARGET_TYPES = {
  FOOD: "FOOD",
  BLOG: "BLOG",
};

/**
 * Lấy thông tin like của một đối tượng (số lượt like và trạng thái đã like)
 * - Nếu đã đăng nhập: lấy cả likeCount và hasLiked
 * - Nếu chưa đăng nhập: chỉ lấy likeCount, hasLiked = false
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise<{likeCount: number, hasLiked: boolean}>}
 */
export const getLikeInfo = async (targetType, targetId) => {
  if (useFirebase) {
    return { likeCount: 0, hasLiked: false };
  }

  const token = getToken();

  try {
    if (token) {
      // User đã đăng nhập - lấy cả likeCount và hasLiked
      const response = await getLikeInfoApi(targetType, targetId);
      return {
        likeCount: response.data?.likeCount || 0,
        hasLiked: response.data?.hasLiked || false,
      };
    } else {
      // User chưa đăng nhập - chỉ lấy likeCount từ API public
      const response = await getLikeCountPublicApi(targetType, targetId);
      return {
        likeCount: response.data?.likeCount || 0,
        hasLiked: false,
      };
    }
  } catch (error) {
    console.error("Lỗi lấy thông tin like:", error);
    return { likeCount: 0, hasLiked: false };
  }
};

/**
 * Lấy số lượt like của một đối tượng (API công khai)
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise<number>}
 */
export const getLikeCount = async (targetType, targetId) => {
  if (useFirebase) {
    return 0;
  }
  try {
    const response = await getLikeCountPublicApi(targetType, targetId);
    return response.data?.likeCount || 0;
  } catch (error) {
    console.error("Lỗi lấy số lượt like:", error);
    return 0;
  }
};

/**
 * Kiểm tra user đã like đối tượng chưa
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise<boolean>}
 */
export const checkLikeStatus = async (targetType, targetId) => {
  if (useFirebase) {
    return false;
  }
  try {
    const response = await checkLikeStatusApi(targetType, targetId);

    // Xử lý nhiều format response có thể có từ server
    const data = response.data;
    if (typeof data === "boolean") {
      return data;
    }
    if (typeof data?.hasLiked === "boolean") {
      return data.hasLiked;
    }
    if (typeof data?.liked === "boolean") {
      return data.liked;
    }
    return false;
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái like:", error);
    return false;
  }
};

/**
 * Toggle like/unlike một đối tượng
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise<{success: boolean, hasLiked: boolean, likeCount: number}>}
 */
export const toggleLike = async (targetType, targetId) => {
  if (useFirebase) {
    return { success: false, hasLiked: false, likeCount: 0 };
  }
  try {
    const response = await toggleLikeApi(targetType, targetId);
    return {
      success: true,
      ...response.data,
    };
  } catch (error) {
    console.error("Lỗi toggle like:", error);
    throw error;
  }
};
