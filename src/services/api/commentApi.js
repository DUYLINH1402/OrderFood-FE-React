import apiClient, { publicClient } from "../apiClient";

/**
 * API liên quan đến Comment
 * Hỗ trợ comment cho nhiều loại đối tượng: FOOD, BLOG, ...
 */

// ==================== PUBLIC APIs (không cần đăng nhập) ====================

/**
 * Lấy danh sách bình luận của một đối tượng (có phân trang)
 * @param {string} targetType - Loại đối tượng (FOOD, BLOG, ...)
 * @param {number} targetId - ID của đối tượng
 * @param {number} page - Số trang (bắt đầu từ 0)
 * @param {number} size - Số lượng mỗi trang
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const getCommentsApi = (targetType, targetId, page = 0, size = 10) => {
  return publicClient.get(`/api/v1/public/comments/${targetType}/${targetId}`, {
    params: { page, size },
  });
};

/**
 * Lấy chi tiết một bình luận
 * @param {number} commentId - ID bình luận
 * @returns {Promise} - Response chứa CommentResponse
 */
export const getCommentDetailApi = (commentId) => {
  return publicClient.get(`/api/v1/public/comments/detail/${commentId}`);
};

/**
 * Lấy danh sách reply của một comment (có phân trang)
 * @param {number} commentId - ID comment cha
 * @param {number} page - Số trang
 * @param {number} size - Số lượng mỗi trang
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const getRepliesApi = (commentId, page = 0, size = 20) => {
  return publicClient.get(`/api/v1/public/comments/${commentId}/replies`, {
    params: { page, size },
  });
};

/**
 * Đếm số bình luận của một đối tượng
 * @param {string} targetType - Loại đối tượng
 * @param {number} targetId - ID của đối tượng
 * @returns {Promise} - Response chứa số lượng comment
 */
export const countCommentsApi = (targetType, targetId) => {
  return publicClient.get(`/api/v1/public/comments/count/${targetType}/${targetId}`);
};

// ==================== PRIVATE APIs (cần đăng nhập) ====================

/**
 * Tạo bình luận mới
 * @param {Object} data - Dữ liệu bình luận
 * @param {string} data.content - Nội dung bình luận
 * @param {string} data.targetType - Loại đối tượng (FOOD, BLOG, ...)
 * @param {number} data.targetId - ID của đối tượng
 * @param {number|null} data.parentId - ID comment cha (nếu là reply)
 * @returns {Promise} - Response chứa CommentResponse
 */
export const createCommentApi = (data) => {
  return apiClient.post("/api/v1/client/comments", data);
};

/**
 * Cập nhật bình luận (chỉ được cập nhật comment của mình)
 * @param {number} commentId - ID bình luận
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.content - Nội dung mới
 * @returns {Promise} - Response chứa CommentResponse
 */
export const updateCommentApi = (commentId, data) => {
  return apiClient.put(`/api/v1/client/comments/${commentId}`, data);
};

/**
 * Xóa bình luận (soft delete, chỉ được xóa comment của mình)
 * @param {number} commentId - ID bình luận
 * @returns {Promise}
 */
export const deleteCommentApi = (commentId) => {
  return apiClient.delete(`/api/v1/client/comments/${commentId}`);
};

/**
 * Lấy danh sách bình luận của user hiện tại
 * @param {number} page - Số trang
 * @param {number} size - Số lượng mỗi trang
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const getMyCommentsApi = (page = 0, size = 10) => {
  return apiClient.get("/api/v1/client/comments/my-comments", {
    params: { page, size },
  });
};
