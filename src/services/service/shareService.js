const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import { getShareCountApi, recordShareApi } from "../api/shareApi";

// Định nghĩa các loại target type
export const TARGET_TYPES = {
  FOOD: "FOOD",
  BLOG: "BLOG",
};

// Định nghĩa các nền tảng chia sẻ được hỗ trợ
export const SHARE_PLATFORMS = {
  FACEBOOK: "FACEBOOK",
  MESSENGER: "MESSENGER",
  ZALO: "ZALO",
  COPY_LINK: "COPY_LINK",
};

/**
 * Lấy số lượt share của một đối tượng
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise<number>} - Số lượt share
 */
export const getShareCount = async (targetType, targetId) => {
  if (useFirebase) {
    return 0;
  }

  try {
    const response = await getShareCountApi(targetType, targetId);
    // Xử lý nhiều format response có thể có từ server
    const data = response.data;

    // Nếu data là số trực tiếp
    if (typeof data === "number") {
      return data;
    }

    // Nếu data là object với các key có thể có
    return data?.shareCount || data?.count || data?.totalShares || 0;
  } catch (error) {
    console.error("Lỗi lấy số lượt share:", error);
    return 0;
  }
};

/**
 * Ghi nhận lượt share lên mạng xã hội
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @param {string} platform - Nền tảng chia sẻ
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const recordShare = async (targetType, targetId, platform) => {
  if (useFirebase) {
    return { success: true };
  }

  try {
    await recordShareApi(targetType, targetId, platform);
    return { success: true };
  } catch (error) {
    console.error("Lỗi ghi nhận lượt share:", error);
    return { success: false, message: "Không thể ghi nhận lượt chia sẻ" };
  }
};

/**
 * Tạo URL chia sẻ cho món ăn
 * @param {string} slug - Slug của món ăn
 * @returns {string} - Full URL để chia sẻ
 */
export const generateFoodShareUrl = (slug) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/chi-tiet-mon-an/${slug}`;
};

/**
 * Tạo nội dung chia sẻ cho món ăn
 * @param {object} food - Object chứa thông tin món ăn
 * @returns {{title: string, description: string, hashtag: string}}
 */
export const generateFoodShareContent = (food) => {
  const title = `${food.name} - Món ngon tại Đông Xanh`;
  const description = food.description || `Khám phá ${food.name} tuyệt vời tại nhà hàng Đông Xanh!`;
  const hashtag = "#DongXanh #MonNgon #AmThucViet";

  return {
    title,
    description,
    hashtag,
  };
};

/**
 * Tạo URL chia sẻ cho bài viết/blog
 * @param {string} slug - Slug của bài viết
 * @returns {string} - Full URL để chia sẻ
 */
export const generateBlogShareUrl = (slug) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/tin-tuc/${slug}`;
};

/**
 * Tạo nội dung chia sẻ cho bài viết/blog
 * @param {object} blog - Object chứa thông tin bài viết
 * @returns {{title: string, description: string, hashtag: string}}
 */
export const generateBlogShareContent = (blog) => {
  const title = blog.title || "Tin tức từ Đông Xanh";
  const description =
    blog.summary || blog.description || "Khám phá những tin tức mới nhất từ nhà hàng Đông Xanh!";
  const hashtag = "#DongXanh #TinTuc #AmThuc";

  return {
    title,
    description,
    hashtag,
  };
};
