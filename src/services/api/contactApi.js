import apiClient, { publicClient } from "../apiClient";

// ============================================
// PUBLIC API - Khách hàng gửi tin nhắn
// ============================================

/**
 * Gửi tin nhắn liên hệ từ khách hàng
 * @param {Object} data - Thông tin tin nhắn
 * @param {string} data.name - Tên người gửi
 * @param {string} data.email - Email người gửi
 * @param {string} [data.phone] - Số điện thoại (tùy chọn)
 * @param {string} [data.subject] - Chủ đề (tùy chọn)
 * @param {string} data.message - Nội dung tin nhắn
 * @returns {Promise<Object>} Kết quả gửi tin nhắn
 */
export const sendContactMessageApi = async (data) => {
  try {
    const response = await publicClient.post("/api/contact", data);
    return {
      success: true,
      message: response.data?.message || "Gửi tin nhắn thành công!",
      contactId: response.data?.contactId,
    };
  } catch (error) {
    const errorCode = error?.response?.data?.errorCode;
    const errorMessage = error?.response?.data?.message;

    // Xử lý lỗi rate limit
    if (errorCode === "CONTACT_RATE_LIMIT_IP") {
      return {
        success: false,
        message: "Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau 1 phút.",
        errorCode,
      };
    }
    if (errorCode === "CONTACT_RATE_LIMIT_EMAIL") {
      return {
        success: false,
        message: "Email này đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.",
        errorCode,
      };
    }

    console.error("Lỗi khi gửi tin nhắn liên hệ:", error?.response?.data || error.message);
    return {
      success: false,
      message: errorMessage || "Không thể gửi tin nhắn. Vui lòng thử lại sau.",
    };
  }
};

// ============================================
// ADMIN API - Quản lý tin nhắn liên hệ
// ============================================

/**
 * Lấy danh sách tin nhắn liên hệ (Admin)
 * @param {Object} params - Tham số truy vấn
 * @param {number} [params.page=0] - Số trang
 * @param {number} [params.size=20] - Số lượng mỗi trang
 * @returns {Promise<Object>} Danh sách tin nhắn với phân trang
 */
export const getAdminContactsApi = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/admin/contacts", { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tin nhắn:", error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể tải danh sách tin nhắn",
    };
  }
};

/**
 * Lấy danh sách tin nhắn theo trạng thái
 * @param {string} status - Trạng thái (PENDING, READ, REPLIED, ARCHIVED)
 * @param {Object} params - Tham số phân trang
 * @returns {Promise<Object>} Danh sách tin nhắn
 */
export const getContactsByStatusApi = async (status, params = {}) => {
  try {
    const response = await apiClient.get(`/api/admin/contacts/status/${status}`, { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn theo trạng thái:", error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể tải tin nhắn theo trạng thái",
    };
  }
};

/**
 * Lấy danh sách tin nhắn theo nhiều trạng thái
 * @param {string[]} statuses - Mảng trạng thái
 * @param {Object} params - Tham số phân trang
 * @returns {Promise<Object>} Danh sách tin nhắn
 */
export const getContactsByStatusesApi = async (statuses = [], params = {}) => {
  try {
    const response = await apiClient.get("/api/admin/contacts/statuses", {
      params: { ...params, statuses: statuses.join(",") },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Lỗi khi lấy tin nhắn theo nhiều trạng thái:",
      error?.response?.data || error.message
    );
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể tải tin nhắn",
    };
  }
};

/**
 * Tìm kiếm tin nhắn theo từ khóa
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {Object} params - Tham số phân trang
 * @returns {Promise<Object>} Kết quả tìm kiếm
 */
export const searchContactsApi = async (keyword, params = {}) => {
  try {
    const response = await apiClient.get("/api/admin/contacts/search", {
      params: { ...params, keyword },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi tìm kiếm tin nhắn:", error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể tìm kiếm tin nhắn",
    };
  }
};

/**
 * Lấy chi tiết tin nhắn theo ID
 * @param {number} id - ID tin nhắn
 * @returns {Promise<Object>} Chi tiết tin nhắn
 */
export const getContactDetailApi = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/contacts/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết tin nhắn (${id}):`, error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể tải chi tiết tin nhắn",
    };
  }
};

/**
 * Cập nhật trạng thái tin nhắn
 * @param {number} id - ID tin nhắn
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.status - Trạng thái mới
 * @param {string} [data.adminNote] - Ghi chú của admin
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateContactStatusApi = async (id, data) => {
  try {
    const response = await apiClient.patch(`/api/admin/contacts/${id}/status`, data);
    return {
      success: true,
      data: response.data,
      message: "Cập nhật trạng thái thành công",
    };
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật trạng thái tin nhắn (${id}):`,
      error?.response?.data || error.message
    );
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể cập nhật trạng thái",
    };
  }
};

/**
 * Phản hồi tin nhắn
 * @param {number} id - ID tin nhắn
 * @param {Object} data - Dữ liệu phản hồi
 * @param {string} data.replyContent - Nội dung phản hồi
 * @param {boolean} [data.sendEmail=true] - Có gửi email không
 * @returns {Promise<Object>} Kết quả phản hồi
 */
export const replyContactApi = async (id, data) => {
  try {
    const response = await apiClient.post(`/api/admin/contacts/${id}/reply`, data);
    return {
      success: true,
      data: response.data,
      message: "Phản hồi tin nhắn thành công",
    };
  } catch (error) {
    console.error(`Lỗi khi phản hồi tin nhắn (${id}):`, error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể phản hồi tin nhắn",
    };
  }
};

/**
 * Xóa tin nhắn (chỉ ARCHIVED)
 * @param {number} id - ID tin nhắn
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteContactApi = async (id) => {
  try {
    await apiClient.delete(`/api/admin/contacts/${id}`);
    return {
      success: true,
      message: "Xóa tin nhắn thành công",
    };
  } catch (error) {
    const errorCode = error?.response?.data?.errorCode;

    if (errorCode === "CONTACT_DELETE_NOT_ALLOWED") {
      return {
        success: false,
        message: "Chỉ có thể xóa tin nhắn đã lưu trữ",
        errorCode,
      };
    }

    console.error(`Lỗi khi xóa tin nhắn (${id}):`, error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể xóa tin nhắn",
    };
  }
};

/**
 * Đếm số tin nhắn chưa đọc
 * @returns {Promise<Object>} Số lượng tin nhắn pending
 */
export const getPendingContactsCountApi = async () => {
  try {
    const response = await apiClient.get("/api/admin/contacts/pending/count");
    return {
      success: true,
      count: response.data?.pendingCount || 0,
    };
  } catch (error) {
    console.error("Lỗi khi đếm tin nhắn chưa đọc:", error?.response?.data || error.message);
    return {
      success: false,
      count: 0,
    };
  }
};

/**
 * Lấy thống kê tin nhắn
 * @param {string} startDate - Ngày bắt đầu (ISO format)
 * @param {string} endDate - Ngày kết thúc (ISO format)
 * @returns {Promise<Object>} Thống kê tin nhắn
 */
export const getContactStatisticsApi = async (startDate, endDate) => {
  try {
    const response = await apiClient.get("/api/admin/contacts/statistics", {
      params: { startDate, endDate },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê tin nhắn:", error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể tải thống kê",
    };
  }
};

/**
 * Lấy tin nhắn mới nhất (cho Dashboard)
 * @param {number} [limit=5] - Số lượng tin nhắn
 * @returns {Promise<Object>} Danh sách tin nhắn mới nhất
 */
export const getRecentContactsApi = async (limit = 5) => {
  try {
    const response = await apiClient.get("/api/admin/contacts/recent", {
      params: { limit },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn mới nhất:", error?.response?.data || error.message);
    return {
      success: false,
      data: [],
    };
  }
};
