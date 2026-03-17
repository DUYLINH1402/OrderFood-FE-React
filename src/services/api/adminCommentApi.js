import apiClient from "../apiClient";

/**
 * Admin API liên quan đến quản lý Comment
 * Yêu cầu role ADMIN
 */

// ==================== ADMIN APIs ====================

/**
 * Lấy tất cả bình luận (phân trang)
 * @param {Object} params - Query params
 * @param {number} params.page - Số trang (bắt đầu từ 0)
 * @param {number} params.size - Số lượng mỗi trang
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const getAdminCommentsApi = (params = {}) => {
  return apiClient.get("/api/v1/admin/comments", { params });
};

/**
 * Lấy bình luận theo trạng thái
 * @param {string} status - Trạng thái (ACTIVE, HIDDEN, DELETED)
 * @param {Object} params - Query params
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const getAdminCommentsByStatusApi = (status, params = {}) => {
  return apiClient.get(`/api/v1/admin/comments/status/${status}`, { params });
};

/**
 * Tìm kiếm bình luận theo từ khóa
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {Object} params - Query params (page, size)
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const searchAdminCommentsApi = (keyword, params = {}) => {
  return apiClient.get("/api/v1/admin/comments/search", {
    params: { keyword, ...params },
  });
};

/**
 * Lấy chi tiết một bình luận
 * @param {number} commentId - ID bình luận
 * @returns {Promise} - Response chứa CommentResponse
 */
export const getAdminCommentDetailApi = (commentId) => {
  return apiClient.get(`/api/v1/admin/comments/${commentId}`);
};

/**
 * Lấy bình luận theo user
 * @param {number} userId - ID của user
 * @param {Object} params - Query params (page, size)
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const getAdminCommentsByUserApi = (userId, params = {}) => {
  return apiClient.get(`/api/v1/admin/comments/user/${userId}`, { params });
};

/**
 * Lấy bình luận theo đối tượng (target)
 * @param {string} targetType - Loại đối tượng (FOOD, BLOG, MOVIE)
 * @param {number} targetId - ID của đối tượng
 * @param {Object} params - Query params (page, size)
 * @returns {Promise} - Response chứa CommentPageResponse
 */
export const getAdminCommentsByTargetApi = (targetType, targetId, params = {}) => {
  return apiClient.get(`/api/v1/admin/comments/target/${targetType}/${targetId}`, { params });
};

/**
 * Lấy thống kê bình luận
 * @returns {Promise} - Response chứa CommentStatisticsResponse
 */
export const getAdminCommentStatisticsApi = () => {
  return apiClient.get("/api/v1/admin/comments/statistics");
};

/**
 * Thay đổi trạng thái bình luận
 * @param {number} commentId - ID bình luận
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.status - Trạng thái mới (ACTIVE, HIDDEN, DELETED)
 * @returns {Promise} - Response chứa CommentResponse
 */
export const updateAdminCommentStatusApi = (commentId, data) => {
  return apiClient.put(`/api/v1/admin/comments/${commentId}/status`, data);
};

/**
 * Cập nhật trạng thái nhiều bình luận
 * @param {Object} data - Dữ liệu cập nhật
 * @param {Array<number>} data.commentIds - Danh sách ID bình luận
 * @param {string} data.status - Trạng thái mới
 * @returns {Promise} - Response chứa BatchOperationResponse
 */
export const batchUpdateAdminCommentStatusApi = (data) => {
  return apiClient.put("/api/v1/admin/comments/batch/status", data);
};

/**
 * Xóa vĩnh viễn bình luận
 * @param {number} commentId - ID bình luận
 * @returns {Promise}
 */
export const hardDeleteAdminCommentApi = (commentId) => {
  return apiClient.delete(`/api/v1/admin/comments/${commentId}/hard-delete`);
};

/**
 * Xóa vĩnh viễn nhiều bình luận
 * @param {Object} data - Dữ liệu xóa
 * @param {Array<number>} data.commentIds - Danh sách ID bình luận cần xóa
 * @returns {Promise} - Response chứa BatchOperationResponse
 */
export const batchHardDeleteAdminCommentsApi = (data) => {
  return apiClient.delete("/api/v1/admin/comments/batch/hard-delete", { data });
};
