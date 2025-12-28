import { apiClient } from "../apiClient";

/**
 * Admin User API - Dành cho admin quản lý người dùng
 * Base URL: /api/admin/users
 */

/**
 * Lấy danh sách người dùng (có phân trang, filter)
 * @param {Object} params - Tham số tìm kiếm
 * @param {string} params.keyword - Từ khóa tìm kiếm (username, email, fullName, phoneNumber)
 * @param {string} params.roleCode - Filter theo role (ROLE_USER, ROLE_STAFF, ROLE_ADMIN)
 * @param {boolean} params.isActive - Filter theo trạng thái active
 * @param {number} params.page - Số trang (bắt đầu từ 0)
 * @param {number} params.size - Số lượng mỗi trang
 * @param {string} params.sortBy - Trường sắp xếp
 * @param {string} params.sortDir - Hướng sắp xếp (asc/desc)
 */
export const getAdminUsersApi = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/admin/users", { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách người dùng",
      data: null,
    };
  }
};

/**
 * Lấy chi tiết người dùng theo ID
 * @param {number} id - ID người dùng
 */
export const getAdminUserByIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết người dùng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thông tin người dùng",
      data: null,
    };
  }
};

/**
 * Tạo người dùng mới
 * @param {Object} data - Thông tin người dùng
 * @param {string} data.username - Tên đăng nhập (3-50 ký tự)
 * @param {string} data.email - Email
 * @param {string} data.password - Mật khẩu (6-100 ký tự)
 * @param {string} data.fullName - Họ tên (tối đa 100 ký tự)
 * @param {string} data.phoneNumber - Số điện thoại (tối đa 20 ký tự)
 * @param {string} data.address - Địa chỉ (tối đa 255 ký tự)
 * @param {string} data.avatarUrl - URL avatar
 * @param {string} data.roleCode - Role code: ROLE_USER, ROLE_STAFF, ROLE_ADMIN
 * @param {boolean} data.isActive - Trạng thái active
 * @param {boolean} data.isVerified - Trạng thái verified
 */
export const createAdminUserApi = async (data) => {
  try {
    const response = await apiClient.post("/api/admin/users", data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo người dùng",
      data: null,
    };
  }
};

/**
 * Cập nhật thông tin người dùng
 * @param {number} id - ID người dùng
 * @param {Object} data - Thông tin cần cập nhật
 */
export const updateAdminUserApi = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${id}`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật người dùng",
      data: null,
    };
  }
};

/**
 * Xóa người dùng
 * @param {number} id - ID người dùng cần xóa
 */
export const deleteAdminUserApi = async (id) => {
  try {
    await apiClient.delete(`/api/admin/users/${id}`);
    return {
      success: true,
      message: "Xóa người dùng thành công",
    };
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa người dùng",
    };
  }
};

/**
 * Cập nhật trạng thái người dùng (khóa/mở khóa)
 * @param {number} id - ID người dùng
 * @param {Object} data - Thông tin trạng thái
 * @param {boolean} data.isActive - Trạng thái active
 * @param {boolean} data.isVerified - Trạng thái verified
 */
export const updateAdminUserStatusApi = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${id}/status`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái người dùng",
      data: null,
    };
  }
};

/**
 * Reset mật khẩu người dùng (gửi email reset password)
 * @param {number} userId - ID người dùng
 */
export const resetAdminUserPasswordApi = async (userId) => {
  try {
    const response = await apiClient.post(`/api/admin/users/${userId}/reset-password`);
    return {
      success: true,
      data: response.data,
      message: "Đã gửi email reset mật khẩu thành công",
    };
  } catch (error) {
    console.error("Lỗi khi reset mật khẩu người dùng:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể gửi email reset mật khẩu",
      data: null,
    };
  }
};

// Export default object
const adminUserApi = {
  getUsers: getAdminUsersApi,
  getUserById: getAdminUserByIdApi,
  createUser: createAdminUserApi,
  updateUser: updateAdminUserApi,
  deleteUser: deleteAdminUserApi,
  updateUserStatus: updateAdminUserStatusApi,
  resetUserPassword: resetAdminUserPasswordApi,
};

export default adminUserApi;
