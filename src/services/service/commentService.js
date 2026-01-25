import {
  getCommentsApi,
  getCommentDetailApi,
  getRepliesApi,
  countCommentsApi,
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
  getMyCommentsApi,
} from "../api/commentApi";

/**
 * Các loại đối tượng có thể comment
 */
export const COMMENT_TARGET_TYPES = {
  FOOD: "FOOD",
  BLOG: "BLOG",
};

/**
 * Service xử lý logic nghiệp vụ liên quan đến Comment
 */

// ==================== PUBLIC Services ====================

/**
 * Lấy danh sách bình luận của một đối tượng
 * @param {string} targetType - Loại đối tượng (FOOD, BLOG, ...)
 * @param {number} targetId - ID của đối tượng
 * @param {number} page - Số trang
 * @param {number} size - Số lượng mỗi trang
 * @returns {Promise<Object>} - CommentPageResponse
 */
export const getComments = async (targetType, targetId, page = 0, size = 10) => {
  try {
    const response = await getCommentsApi(targetType, targetId, page, size);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy danh sách bình luận:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một bình luận
 * @param {number} commentId - ID bình luận
 * @returns {Promise<Object>} - CommentResponse
 */
export const getCommentDetail = async (commentId) => {
  try {
    const response = await getCommentDetailApi(commentId);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy chi tiết bình luận:", error);
    throw error;
  }
};

/**
 * Lấy danh sách reply của một comment
 * @param {number} commentId - ID comment cha
 * @param {number} page - Số trang
 * @param {number} size - Số lượng mỗi trang
 * @returns {Promise<Object>} - CommentPageResponse
 */
export const getReplies = async (commentId, page = 0, size = 20) => {
  try {
    const response = await getRepliesApi(commentId, page, size);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy danh sách reply:", error);
    throw error;
  }
};

/**
 * Đếm số bình luận của một đối tượng
 * @param {string} targetType - Loại đối tượng
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise<number>} - Số lượng comment
 */
export const countComments = async (targetType, targetId) => {
  try {
    const response = await countCommentsApi(targetType, targetId);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi đếm số bình luận:", error);
    return 0;
  }
};

// ==================== PRIVATE Services ====================

/**
 * Tạo bình luận mới
 * @param {Object} data - Dữ liệu bình luận
 * @returns {Promise<Object>} - CommentResponse
 */
export const createComment = async (data) => {
  try {
    const response = await createCommentApi(data);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi tạo bình luận:", error);
    throw error;
  }
};

/**
 * Cập nhật bình luận
 * @param {number} commentId - ID bình luận
 * @param {string} content - Nội dung mới
 * @returns {Promise<Object>} - CommentResponse
 */
export const updateComment = async (commentId, content) => {
  try {
    const response = await updateCommentApi(commentId, { content });
    return response.data;
  } catch (error) {
    console.log("Lỗi khi cập nhật bình luận:", error);
    throw error;
  }
};

/**
 * Xóa bình luận
 * @param {number} commentId - ID bình luận
 * @returns {Promise<boolean>}
 */
export const deleteComment = async (commentId) => {
  try {
    await deleteCommentApi(commentId);
    return true;
  } catch (error) {
    console.log("Lỗi khi xóa bình luận:", error);
    throw error;
  }
};

/**
 * Lấy danh sách bình luận của user hiện tại
 * @param {number} page - Số trang
 * @param {number} size - Số lượng mỗi trang
 * @returns {Promise<Object>} - CommentPageResponse
 */
export const getMyComments = async (page = 0, size = 10) => {
  try {
    const response = await getMyCommentsApi(page, size);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy bình luận của tôi:", error);
    throw error;
  }
};
