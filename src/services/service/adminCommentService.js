import {
  getAdminCommentsApi,
  getAdminCommentsByStatusApi,
  searchAdminCommentsApi,
  getAdminCommentDetailApi,
  getAdminCommentsByUserApi,
  getAdminCommentsByTargetApi,
  getAdminCommentStatisticsApi,
  updateAdminCommentStatusApi,
  batchUpdateAdminCommentStatusApi,
  hardDeleteAdminCommentApi,
  batchHardDeleteAdminCommentsApi,
} from "../api/adminCommentApi";

/**
 * Trạng thái bình luận
 */
export const COMMENT_STATUS = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
  DELETED: "DELETED",
};

/**
 * Các loại đối tượng có thể comment
 */
export const COMMENT_TARGET_TYPES = {
  FOOD: "FOOD",
  BLOG: "BLOG",
};

/**
 * Cấu hình hiển thị trạng thái
 */
export const COMMENT_STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang hiển thị",
    color: "bg-green-100 text-green-800",
    dotColor: "bg-green-500",
  },
  HIDDEN: {
    label: "Đã ẩn",
    color: "bg-yellow-100 text-yellow-800",
    dotColor: "bg-yellow-500",
  },
  DELETED: {
    label: "Đã xóa",
    color: "bg-red-100 text-red-800",
    dotColor: "bg-red-500",
  },
};

/**
 * Cấu hình hiển thị loại đối tượng
 */
export const TARGET_TYPE_CONFIG = {
  FOOD: {
    label: "Món ăn",
    color: "bg-orange-100 text-orange-800",
  },
  BLOG: {
    label: "Bài viết",
    color: "bg-blue-100 text-blue-800",
  },
};

// ==================== ADMIN Comment Services ====================

/**
 * Lấy danh sách tất cả bình luận
 * @param {Object} params - Query params
 * @returns {Promise<Object>} - CommentPageResponse
 */
export const getAdminComments = async (params = {}) => {
  try {
    const response = await getAdminCommentsApi(params);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi lấy danh sách bình luận:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách bình luận",
    };
  }
};

/**
 * Lấy bình luận theo trạng thái
 * @param {string} status - Trạng thái (ACTIVE, HIDDEN, DELETED)
 * @param {Object} params - Query params
 * @returns {Promise<Object>}
 */
export const getAdminCommentsByStatus = async (status, params = {}) => {
  try {
    const response = await getAdminCommentsByStatusApi(status, params);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi lấy bình luận theo trạng thái:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải bình luận theo trạng thái",
    };
  }
};

/**
 * Tìm kiếm bình luận
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {Object} params - Query params
 * @returns {Promise<Object>}
 */
export const searchAdminComments = async (keyword, params = {}) => {
  try {
    const response = await searchAdminCommentsApi(keyword, params);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi tìm kiếm bình luận:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tìm kiếm bình luận",
    };
  }
};

/**
 * Lấy chi tiết bình luận
 * @param {number} commentId - ID bình luận
 * @returns {Promise<Object>}
 */
export const getAdminCommentDetail = async (commentId) => {
  try {
    const response = await getAdminCommentDetailApi(commentId);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi lấy chi tiết bình luận:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải chi tiết bình luận",
    };
  }
};

/**
 * Lấy bình luận theo user
 * @param {number} userId - ID user
 * @param {Object} params - Query params
 * @returns {Promise<Object>}
 */
export const getAdminCommentsByUser = async (userId, params = {}) => {
  try {
    const response = await getAdminCommentsByUserApi(userId, params);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi lấy bình luận theo user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải bình luận theo người dùng",
    };
  }
};

/**
 * Lấy bình luận theo đối tượng
 * @param {string} targetType - Loại đối tượng
 * @param {number} targetId - ID đối tượng
 * @param {Object} params - Query params
 * @returns {Promise<Object>}
 */
export const getAdminCommentsByTarget = async (targetType, targetId, params = {}) => {
  try {
    const response = await getAdminCommentsByTargetApi(targetType, targetId, params);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi lấy bình luận theo đối tượng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải bình luận theo đối tượng",
    };
  }
};

/**
 * Lấy thống kê bình luận
 * @returns {Promise<Object>}
 */
export const getAdminCommentStatistics = async () => {
  try {
    const response = await getAdminCommentStatisticsApi();
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi lấy thống kê bình luận:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thống kê bình luận",
    };
  }
};

/**
 * Cập nhật trạng thái bình luận
 * @param {number} commentId - ID bình luận
 * @param {string} status - Trạng thái mới
 * @returns {Promise<Object>}
 */
export const updateAdminCommentStatus = async (commentId, status) => {
  try {
    const response = await updateAdminCommentStatusApi(commentId, { status });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi cập nhật trạng thái bình luận:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái bình luận",
    };
  }
};

/**
 * Cập nhật trạng thái nhiều bình luận
 * @param {Array<number>} commentIds - Danh sách ID
 * @param {string} status - Trạng thái mới
 * @returns {Promise<Object>}
 */
export const batchUpdateAdminCommentStatus = async (commentIds, status) => {
  try {
    const response = await batchUpdateAdminCommentStatusApi({ commentIds, status });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi cập nhật trạng thái hàng loạt:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái hàng loạt",
    };
  }
};

/**
 * Xóa vĩnh viễn bình luận
 * @param {number} commentId - ID bình luận
 * @returns {Promise<Object>}
 */
export const hardDeleteAdminComment = async (commentId) => {
  try {
    await hardDeleteAdminCommentApi(commentId);
    return {
      success: true,
    };
  } catch (error) {
    console.log("Lỗi khi xóa vĩnh viễn bình luận:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa vĩnh viễn bình luận",
    };
  }
};

/**
 * Xóa vĩnh viễn nhiều bình luận
 * @param {Array<number>} commentIds - Danh sách ID
 * @returns {Promise<Object>}
 */
export const batchHardDeleteAdminComments = async (commentIds) => {
  try {
    const response = await batchHardDeleteAdminCommentsApi({ commentIds });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Lỗi khi xóa hàng loạt bình luận:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa hàng loạt bình luận",
    };
  }
};
